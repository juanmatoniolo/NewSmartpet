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
    Phone,
    Mail
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
        titulo: "",
        nota: "",
        recordatorio: true
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
                titulo: citaEdit.titulo || "",
                nota: citaEdit.nota || "",
                recordatorio: isTrue(citaEdit.recordatorio)
            });
        } else {
            setForm({
                mascota_id: getMascotaInicial(mascotaId, mascotas),
                id_contacto: "",
                fecha_evento: "",
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

    // Ahora los contactos son del usuario, no se filtran por mascota
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
            [field]: value
        }));
        setErrores((prev) => ({ ...prev, [field]: "" }));
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
        // Ya no es necesario tener una mascota seleccionada (el contacto es global)
        if (onCrearContacto) onCrearContacto();
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
                                <strong>📌 Recordá:</strong> los contactos son personales y sirven para todas tus mascotas.
                                Si activás el recordatorio, recibirás un email recordatorio el día previo a la cita.
                            </Alert>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">🐾 Mascota *</Form.Label>
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
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-2">
                                <Form.Label className="fw-bold mb-0">
                                    Contacto relacionado
                                </Form.Label>
                                <Button
                                    type="button"
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={handleCrearContacto}
                                    disabled={guardando}
                                    className="w-100 w-sm-auto"
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
                                    disabled={guardando}
                                >
                                    <option value="">Sin contacto asociado</option>
                                    {contactos.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {getIconoTipo(c.tipo)} {c.nombre} {c.apellido || ""} - {renderTipo(c)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>

                            {contactos.length === 0 && (
                                <Alert variant="warning" className="mt-2 mb-0 rounded-4">
                                    No tenés contactos cargados. Usá el botón "Agregar contacto" para crear uno.
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
                                    {contactoSeleccionado.email && (
                                        <div className="small text-muted">
                                            <Mail size={14} className="me-1" />
                                            {contactoSeleccionado.email}
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

                        <Col xs={12} md={12}>
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
                                        <span className="d-inline-flex align-items-center gap-2 flex-wrap">
                                            <Bell size={18} />
                                            Activar recordatorio por email
                                            <Badge bg="success" className="ms-1">Activo</Badge>
                                        </span>
                                    }
                                />
                                <small className="text-muted d-block mt-2 ms-4">
                                    Recibirás un recordatorio el día anterior a la cita en tu correo electrónico.
                                </small>
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
                    <Button variant="outline-secondary" onClick={handleClose} disabled={guardando}>
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