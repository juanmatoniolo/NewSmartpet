import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    InputGroup,
    Badge,
    Spinner,
    Alert
} from "react-bootstrap";
import {
    Calendar,
    Clock,
    FileText,
    User,
    Bell,
    PawPrint,
    CheckCircle,
    Plus,
    Phone
} from "lucide-react";
import styles from "./ModalCita.module.css";

const isTrue = (value) => value === true || value === 1 || value === "1";

const toDateInput = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
};

const getMascotaInicial = (mascotaId, mascotas = []) => {
    if (mascotaId && mascotaId !== "todas") return String(mascotaId);
    if (mascotas.length === 1) return String(mascotas[0].id);
    return "";
};

export default function ModalCita({
    show,
    onHide,
    citaEdit,
    contactos = [],
    mascotas = [],
    mascotaId = "",
    onSave,
    onCrearContacto
}) {
    const [form, setForm] = useState({
        mascota_id: "",
        id_contacto: "",
        fecha_evento: "",
        proxima_fecha: "",
        titulo: "",
        nota: "",
        recordatorio: false
    });

    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const isEdit = Boolean(citaEdit);

    useEffect(() => {
        if (!show) return;

        if (citaEdit) {
            setForm({
                mascota_id:
                    citaEdit.mascota_id?.toString() ||
                    citaEdit.id_mascota?.toString() ||
                    citaEdit.mascotaId?.toString() ||
                    getMascotaInicial(mascotaId, mascotas),
                id_contacto: citaEdit.id_contacto?.toString() || "",
                fecha_evento: toDateInput(citaEdit.fecha_evento),
                proxima_fecha: toDateInput(citaEdit.proxima_fecha),
                titulo: citaEdit.titulo || "",
                nota: citaEdit.nota || "",
                recordatorio: isTrue(citaEdit.recordatorio)
            });
        } else {
            setForm({
                mascota_id: getMascotaInicial(mascotaId, mascotas),
                id_contacto: "",
                fecha_evento: "",
                proxima_fecha: "",
                titulo: "",
                nota: "",
                recordatorio: false
            });
        }

        setErrores({});
    }, [show, citaEdit, mascotaId, mascotas]);

    const mascotaSeleccionada = useMemo(() => {
        return mascotas.find((m) => String(m.id) === String(form.mascota_id));
    }, [mascotas, form.mascota_id]);

    const contactosDisponibles = useMemo(() => {
        if (!form.mascota_id) return [];

        return contactos.filter((c) => {
            const idContactoMascota =
                c.mascota_id || c.id_mascota || c.mascotaId || "";

            return String(idContactoMascota) === String(form.mascota_id);
        });
    }, [contactos, form.mascota_id]);

    const contactoSeleccionado = useMemo(() => {
        return contactos.find((c) => String(c.id) === String(form.id_contacto));
    }, [contactos, form.id_contacto]);

    const getIconoTipo = (tipo) => {
        const mapa = {
            veterinario: "🏥",
            peluqueria: "✂️",
            paseador: "🦮",
            petshop: "🏪",
            guarderia: "🏠",
            otro: "📌"
        };

        return mapa[tipo] || "📋";
    };

    const renderTipo = (c) => {
        if (c.tipo === "otro") return c.categoria_personalizada || "Otro";

        const tipos = {
            veterinario: "Veterinario",
            peluqueria: "Peluquería",
            paseador: "Paseador",
            petshop: "Pet Shop",
            guarderia: "Guardería"
        };

        return tipos[c.tipo] || "Contacto";
    };

    const setField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
            ...(field === "mascota_id" ? { id_contacto: "" } : {})
        }));

        setErrores((prev) => ({
            ...prev,
            [field]: ""
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!form.mascota_id) errors.mascota_id = "Seleccioná una mascota";
        if (!form.fecha_evento) errors.fecha_evento = "Seleccioná la fecha";
        if (!form.titulo.trim()) errors.titulo = "Ingresá el título";
        if (!form.nota.trim()) errors.nota = "Ingresá el detalle";

        return errors;
    };

    const handleCrearContacto = () => {
        if (!form.mascota_id) {
            setErrores((prev) => ({
                ...prev,
                mascota_id: "Primero seleccioná una mascota"
            }));
            return;
        }

        if (onCrearContacto) {
            onCrearContacto(form.mascota_id);
        }
    };

    const handleClose = () => {
        if (guardando) return;
        onHide();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        setErrores(errors);

        if (Object.keys(errors).length > 0) return;

        setGuardando(true);

        try {
            const payload = {
                ...form,
                mascota_id: Number(form.mascota_id),
                id_mascota: Number(form.mascota_id),
                id_contacto: form.id_contacto ? Number(form.id_contacto) : null,
                recordatorio: form.recordatorio ? 1 : 0,
                titulo: form.titulo.trim(),
                nota: form.nota.trim()
            };

            const ok = await onSave(payload);

            if (ok) handleClose();
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            fullscreen="md-down"
            centered
            scrollable
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            dialogClassName={styles.modal}
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando}>
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <Calendar size={24} />
                        <div>
                            <div>{isEdit ? "Editar cita" : "Nueva cita"}</div>
                            <small className="text-muted fw-normal">
                                Agendá turnos y vinculalos a un contacto
                            </small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}>
                            <Alert variant="light" className="border rounded-4 mb-0">
                                <strong>Primero elegí la mascota.</strong> Después podés seleccionar un contacto ya agendado o crear uno nuevo.
                            </Alert>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">🐾 Mascota</Form.Label>

                            <InputGroup hasValidation>
                                <InputGroup.Text>
                                    <PawPrint size={16} />
                                </InputGroup.Text>

                                <Form.Select
                                    value={form.mascota_id}
                                    onChange={(e) => setField("mascota_id", e.target.value)}
                                    isInvalid={!!errores.mascota_id}
                                    disabled={guardando || (mascotaId && mascotaId !== "todas")}
                                >
                                    <option value="">Seleccioná una mascota</option>
                                    {mascotas.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nombre}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    {errores.mascota_id}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                                <Form.Label className="fw-bold mb-0">
                                    Contacto agendado
                                </Form.Label>

                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleCrearContacto}
                                    disabled={guardando}
                                >
                                    <Plus size={15} className="me-1" />
                                    Agregar contacto
                                </Button>
                            </div>

                            <InputGroup>
                                <InputGroup.Text>
                                    <User size={16} />
                                </InputGroup.Text>

                                <Form.Select
                                    value={form.id_contacto}
                                    onChange={(e) => setField("id_contacto", e.target.value)}
                                    disabled={guardando || !form.mascota_id}
                                >
                                    <option value="">
                                        {!form.mascota_id
                                            ? "Primero seleccioná una mascota"
                                            : contactosDisponibles.length === 0
                                                ? "No hay contactos para esta mascota"
                                                : "Sin contacto asociado"}
                                    </option>

                                    {contactosDisponibles.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {getIconoTipo(c.tipo)} {c.nombre} {c.apellido || ""} - {renderTipo(c)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>

                            {form.mascota_id && contactosDisponibles.length === 0 && (
                                <Alert variant="warning" className="mt-2 mb-0 rounded-4">
                                    No hay contactos cargados para{" "}
                                    <strong>{mascotaSeleccionada?.nombre || "esta mascota"}</strong>.
                                    Podés crear uno desde “Agregar contacto”.
                                </Alert>
                            )}
                        </Col>

                        {contactoSeleccionado && (
                            <Col xs={12}>
                                <div className="p-3 border rounded-4 bg-light">
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <strong>
                                            {getIconoTipo(contactoSeleccionado.tipo)}{" "}
                                            {contactoSeleccionado.nombre} {contactoSeleccionado.apellido || ""}
                                        </strong>

                                        <Badge bg="secondary">{renderTipo(contactoSeleccionado)}</Badge>
                                    </div>

                                    {contactoSeleccionado.celular && (
                                        <div className="small text-muted mt-1">
                                            <Phone size={14} className="me-1" />
                                            {contactoSeleccionado.celular}
                                        </div>
                                    )}

                                    {contactoSeleccionado.direccion && (
                                        <div className="small text-muted">
                                            📍 {contactoSeleccionado.direccion}
                                        </div>
                                    )}
                                </div>
                            </Col>
                        )}

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Fecha de la cita *</Form.Label>

                            <InputGroup hasValidation>
                                <InputGroup.Text>
                                    <Calendar size={16} />
                                </InputGroup.Text>

                                <Form.Control
                                    type="date"
                                    value={form.fecha_evento}
                                    onChange={(e) => setField("fecha_evento", e.target.value)}
                                    isInvalid={!!errores.fecha_evento}
                                    disabled={guardando}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errores.fecha_evento}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Próxima fecha</Form.Label>

                            <InputGroup>
                                <InputGroup.Text>
                                    <Clock size={16} />
                                </InputGroup.Text>

                                <Form.Control
                                    type="date"
                                    value={form.proxima_fecha}
                                    onChange={(e) => setField("proxima_fecha", e.target.value)}
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Título *</Form.Label>

                            <Form.Control
                                value={form.titulo}
                                onChange={(e) => setField("titulo", e.target.value)}
                                placeholder="Ej: Control veterinario, peluquería, consulta..."
                                isInvalid={!!errores.titulo}
                                disabled={guardando}
                            />

                            <Form.Control.Feedback type="invalid">
                                {errores.titulo}
                            </Form.Control.Feedback>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Detalle *</Form.Label>

                            <InputGroup hasValidation>
                                <InputGroup.Text className="align-items-start pt-2">
                                    <FileText size={16} />
                                </InputGroup.Text>

                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={form.nota}
                                    onChange={(e) => setField("nota", e.target.value)}
                                    placeholder="Motivo, indicaciones, observaciones..."
                                    isInvalid={!!errores.nota}
                                    disabled={guardando}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errores.nota}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <div className="p-3 border rounded-4 bg-light">
                                <Form.Check
                                    type="checkbox"
                                    id="recordatorio-cita"
                                    checked={form.recordatorio}
                                    onChange={(e) => setField("recordatorio", e.target.checked)}
                                    disabled={guardando}
                                    label={
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <Bell size={18} />
                                            Activar recordatorio
                                            <Badge bg="info">Próximamente</Badge>
                                        </span>
                                    }
                                />
                            </div>
                        </Col>

                        {mascotaSeleccionada && form.titulo && form.fecha_evento && (
                            <Col xs={12}>
                                <Alert variant="light" className="border rounded-4 mb-0">
                                    <CheckCircle size={18} className="me-2" />
                                    <strong>{form.titulo}</strong> para{" "}
                                    <Badge bg="secondary">{mascotaSeleccionada.nombre}</Badge>{" "}
                                    el {form.fecha_evento}
                                    {contactoSeleccionado
                                        ? ` con ${contactoSeleccionado.nombre}.`
                                        : "."}
                                </Alert>
                            </Col>
                        )}
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>

                    <Button type="submit" disabled={guardando}>
                        {guardando ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Guardando...
                            </>
                        ) : isEdit ? (
                            "Actualizar cita"
                        ) : (
                            "Crear cita"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}