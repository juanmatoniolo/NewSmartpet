import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    InputGroup,
    Spinner,
    Alert,
    Badge
} from "react-bootstrap";
import {
    FileText,
    Calendar,
    User,
    Heart,
    PawPrint,
    CheckCircle
} from "lucide-react";
import styles from "./ModalHistorial.module.css";

const toDateInput = (value) => {
    if (!value) return "";
    return String(value).slice(0, 10);
};

const getMascotaInicial = (mascotaId, mascotas = []) => {
    if (mascotaId && mascotaId !== "todas") return String(mascotaId);
    if (mascotas.length === 1) return String(mascotas[0].id);
    return "";
};

export default function ModalHistorial({
    show,
    onHide,
    historialEdit,
    contactos = [],
    mascotas = [],
    mascotaId = "",
    onSave
}) {
    const [form, setForm] = useState({
        mascota_id: "",
        id_contacto: "",
        fecha_evento: "",
        titulo: "",
        nota: ""
    });

    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const isEdit = Boolean(historialEdit);

    useEffect(() => {
        if (!show) return;

        if (historialEdit) {
            setForm({
                mascota_id:
                    historialEdit.mascota_id?.toString() ||
                    historialEdit.id_mascota?.toString() ||
                    historialEdit.mascotaId?.toString() ||
                    getMascotaInicial(mascotaId, mascotas),
                id_contacto: historialEdit.id_contacto?.toString() || "",
                fecha_evento: toDateInput(historialEdit.fecha_evento),
                titulo: historialEdit.titulo || "",
                nota: historialEdit.nota || ""
            });
        } else {
            setForm({
                mascota_id: getMascotaInicial(mascotaId, mascotas),
                id_contacto: "",
                fecha_evento: "",
                titulo: "",
                nota: ""
            });
        }

        setErrores({});
    }, [show, historialEdit, mascotaId, mascotas]);

    const mascotaSeleccionada = useMemo(() => {
        return mascotas.find((m) => String(m.id) === String(form.mascota_id));
    }, [mascotas, form.mascota_id]);

    const contactosDisponibles = useMemo(() => {
        if (!form.mascota_id) return contactos;

        return contactos.filter((c) => {
            const idContactoMascota = c.mascota_id || c.id_mascota || c.mascotaId;
            return !idContactoMascota || String(idContactoMascota) === String(form.mascota_id);
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
        if (!form.titulo.trim()) errors.titulo = "Ingresá el título";
        if (!form.nota.trim()) errors.nota = "Ingresá el detalle";

        return errors;
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
                titulo: form.titulo.trim(),
                nota: form.nota.trim(),
                fecha_evento: form.fecha_evento || null
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
                        <FileText size={24} />
                        <div>
                            <div>{isEdit ? "Editar registro" : "Nuevo registro"}</div>
                            <small className="text-muted fw-normal">
                                Guardá servicios, controles u observaciones importantes
                            </small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}>
                            <Alert variant="light" className="border rounded-4 mb-0">
                                <strong>Bitácora:</strong> usala para anotar todo lo que quieras recordar sobre tu mascota.
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
                            <Form.Label className="fw-bold">Contacto asociado</Form.Label>
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
                                    {contactosDisponibles.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {getIconoTipo(c.tipo)} {c.nombre} {c.apellido || ""} - {renderTipo(c)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Col>

                        {contactoSeleccionado && (
                            <Col xs={12}>
                                <div className="p-3 border rounded-4 bg-light">
                                    <strong>{getIconoTipo(contactoSeleccionado.tipo)} {contactoSeleccionado.nombre}</strong>
                                    {contactoSeleccionado.celular && (
                                        <span className="ms-2 text-muted">{contactoSeleccionado.celular}</span>
                                    )}
                                </div>
                            </Col>
                        )}

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Fecha</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Calendar size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={form.fecha_evento}
                                    onChange={(e) => setField("fecha_evento", e.target.value)}
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Título *</Form.Label>
                            <Form.Control
                                value={form.titulo}
                                onChange={(e) => setField("titulo", e.target.value)}
                                placeholder="Ej: Control de peso, baño, tratamiento..."
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
                                    rows={5}
                                    value={form.nota}
                                    onChange={(e) => setField("nota", e.target.value)}
                                    placeholder="Qué pasó, qué indicaron, cómo evolucionó..."
                                    isInvalid={!!errores.nota}
                                    disabled={guardando}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errores.nota}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        {mascotaSeleccionada && form.titulo && (
                            <Col xs={12}>
                                <Alert variant="light" className="border rounded-4 mb-0">
                                    <CheckCircle size={18} className="me-2" />
                                    Se guardará <strong>{form.titulo}</strong> en la bitácora de{" "}
                                    <Badge bg="secondary">{mascotaSeleccionada.nombre}</Badge>.
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
                        ) : (
                            <>
                                <Heart size={16} className="me-2" />
                                {isEdit ? "Actualizar registro" : "Crear registro"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}