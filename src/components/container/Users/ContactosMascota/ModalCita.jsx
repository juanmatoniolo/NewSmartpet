import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Badge, Spinner } from "react-bootstrap";
import { Calendar, Clock, FileText, User, Bell } from "lucide-react";
import styles from "./ModalCita.module.css";

export default function ModalCita({ show, onHide, citaEdit, contactos = [], onSave }) {
    const [form, setForm] = useState({
        id_contacto: "",
        fecha_evento: "",
        proxima_fecha: "",
        titulo: "",
        nota: "",
        recordatorio: false
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (!show) return;

        if (citaEdit) {
            setForm({
                id_contacto: citaEdit.id_contacto?.toString() || "",
                fecha_evento: citaEdit.fecha_evento || "",
                proxima_fecha: citaEdit.proxima_fecha || "",
                titulo: citaEdit.titulo || "",
                nota: citaEdit.nota || "",
                recordatorio: citaEdit.recordatorio || false
            });
        } else {
            setForm({
                id_contacto: "",
                fecha_evento: "",
                proxima_fecha: "",
                titulo: "",
                nota: "",
                recordatorio: false
            });
        }

        setErrores({});
    }, [citaEdit, show]);

    const validateForm = () => {
        const errors = {};

        if (!form.titulo.trim()) errors.titulo = "El título es obligatorio";
        if (!form.nota.trim()) errors.nota = "El detalle es obligatorio";
        if (!form.fecha_evento.trim()) errors.fecha_evento = "La fecha es obligatoria";

        return errors;
    };

    const handleClose = () => {
        if (guardando) return;
        onHide();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setErrores(errors);
            return;
        }

        try {
            setGuardando(true);
            const ok = await onSave(form);
            if (ok) handleClose();
        } finally {
            setGuardando(false);
        }
    };

    const getIconoTipo = (tipo) => {
        const mapa = {
            veterinario: "🏥",
            peluqueria: "✂️",
            paseador: "🦮",
            petshop: "🏪",
            guarderia: "🏠"
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

        return tipos[c.tipo] || "Sin tipo";
    };

    const contactoSeleccionado = contactos.find((c) => c.id === parseInt(form.id_contacto));

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            scrollable
            centered={false}
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            autoFocus={false}
            dialogClassName={styles.modal}
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando} className={styles.header}>
                    <Modal.Title className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <Calendar size={24} style={{ color: "#cd7fa7" }} strokeWidth={2.2} />
                        </div>

                        <div className={styles.title}>
                            <h4>{citaEdit ? "Editar" : "Nueva"} cita</h4>
                            <small>Programa y organiza las citas de tu mascota</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-3 g-md-4">
                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>👤</span> Contacto
                            </div>

                            <Form.Group>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <User size={16} />
                                    </InputGroup.Text>

                                    <Form.Select
                                        value={form.id_contacto}
                                        onChange={(e) => setForm({ ...form, id_contacto: e.target.value })}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    >
                                        <option value="">Sin contacto asociado</option>
                                        {contactos.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {getIconoTipo(c.tipo)} {c.nombre} {c.apellido} - {renderTipo(c)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>

                            {contactoSeleccionado && (
                                <div className={styles.contactoPreview}>
                                    <strong>
                                        {getIconoTipo(contactoSeleccionado.tipo)} {contactoSeleccionado.nombre}
                                    </strong>
                                    {contactoSeleccionado.celular && (
                                        <span>• {contactoSeleccionado.celular}</span>
                                    )}
                                </div>
                            )}
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📅</span> Fechas
                            </div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    Fecha de la cita <span className="text-danger">*</span>
                                </Form.Label>

                                <InputGroup hasValidation>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="date"
                                        value={form.fecha_evento}
                                        onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                                        className={styles.formControl}
                                        isInvalid={!!errores.fecha_evento}
                                        disabled={guardando}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errores.fecha_evento}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">Próxima cita</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Clock size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="date"
                                        value={form.proxima_fecha}
                                        onChange={(e) => setForm({ ...form, proxima_fecha: e.target.value })}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>

                                <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
                                    Fecha tentativa del próximo control
                                </small>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📝</span> Detalles
                            </div>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    Título <span className="text-danger">*</span>
                                </Form.Label>

                                <Form.Control
                                    value={form.titulo}
                                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                    placeholder="Control anual, Vacunación, Peluquería..."
                                    className={styles.fullRounded}
                                    isInvalid={!!errores.titulo}
                                    disabled={guardando}
                                />

                                <Form.Control.Feedback type="invalid">
                                    {errores.titulo}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    Detalle <span className="text-danger">*</span>
                                </Form.Label>

                                <InputGroup hasValidation>
                                    <InputGroup.Text
                                        className={styles.inputGroupText}
                                        style={{ alignItems: "flex-start", paddingTop: "0.65rem" }}
                                    >
                                        <FileText size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={form.nota}
                                        onChange={(e) => setForm({ ...form, nota: e.target.value })}
                                        placeholder="Motivo de la cita, tratamiento, observaciones..."
                                        className={styles.formControl}
                                        style={{ resize: "vertical" }}
                                        isInvalid={!!errores.nota}
                                        disabled={guardando}
                                    />

                                    <Form.Control.Feedback type="invalid">
                                        {errores.nota}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.reminderBox}>
                                <Form.Check
                                    type="checkbox"
                                    id="recordatorio-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2 flex-wrap">
                                            <Bell size={18} color={form.recordatorio ? "#cd7fa7" : "#8a7a9c"} />
                                            <span className="fw-semibold">Activar recordatorio</span>
                                            <Badge bg="info" style={{ backgroundColor: "#7f9bc2", fontSize: "0.7rem" }}>
                                                Próximamente
                                            </Badge>
                                        </span>
                                    }
                                    checked={form.recordatorio}
                                    onChange={(e) => setForm({ ...form, recordatorio: e.target.checked })}
                                    disabled={guardando}
                                />

                                <small className="text-muted d-block ms-4 mt-1" style={{ fontSize: "0.75rem" }}>
                                    Recibirás una notificación antes de la cita
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer className={styles.footer}>
                    <Button
                        variant="outline-secondary"
                        className={styles.cancelBtn}
                        onClick={handleClose}
                        disabled={guardando}
                    >
                        Cancelar
                    </Button>

                    <Button type="submit" className={styles.saveBtn} disabled={guardando}>
                        {guardando ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" />
                                Guardando...
                            </span>
                        ) : citaEdit ? "Actualizar" : "Crear cita"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}