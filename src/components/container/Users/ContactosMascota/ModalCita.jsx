import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Badge } from "react-bootstrap";
import { Calendar, Clock, FileText, User, Bell } from "lucide-react";

export default function ModalCita({ show, onHide, citaEdit, contactos, mascotaId, onSave }) {
    const [form, setForm] = useState({ id_contacto: "", fecha_evento: "", proxima_fecha: "", titulo: "", nota: "", recordatorio: false });
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
            setForm({ id_contacto: "", fecha_evento: "", proxima_fecha: "", titulo: "", nota: "", recordatorio: false });
        }
        setErrores({});
    }, [citaEdit, show]);

    const validateForm = () => {
        const errors = {};
        if (!form.titulo.trim()) errors.titulo = "El título es obligatorio";
        if (!form.nota.trim()) errors.nota = "El detalle es obligatorio";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setErrores(errors);
            return;
        }
        setGuardando(true);
        const ok = await onSave(form);
        setGuardando(false);
        if (ok) onHide();
    };

    const getIconoTipo = (tipo) => ({ veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪", guarderia: "🏠" }[tipo] || "📋");
    const renderTipo = (c) => c.tipo === "otro" ? (c.categoria_personalizada || "Otro") : ({ veterinario: "Veterinario", peluqueria: "Peluquería", paseador: "Paseador", petshop: "Pet Shop", guarderia: "Guardería" }[c.tipo] || "Sin tipo");

    const contactoSeleccionado = contactos.find(c => c.id === parseInt(form.id_contacto));

    // Estilos fijos (sin variables CSS)
    const headerStyle = {
        borderBottom: "2px solid #e5d9f2",
        background: "linear-gradient(135deg, #f8f5fc 0%, white 100%)",
        padding: "1rem 1.25rem"
    };
    const inputGroupTextStyle = {
        backgroundColor: "#f8f5fc",
        border: "1px solid #e5d9f2"
    };
    const roundedControlStyle = {
        borderRadius: "0.5rem",
        padding: "0.6rem 0.75rem",
        fontSize: "1rem"
    };
    const rightRoundedControlStyle = {
        borderRadius: "0 0.5rem 0.5rem 0",
        fontSize: "1rem"
    };
    const sectionTitleStyle = {
        fontSize: "0.85rem",
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        color: "#6c757d",
        fontWeight: 500
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            fullscreen="sm-down" // En móviles ocupa toda la pantalla
            centered
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            scrollable
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando} style={headerStyle}>
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-circle" style={{ backgroundColor: "rgba(205, 127, 167, 0.15)" }}>
                            <Calendar size={24} style={{ color: "#cd7fa7" }} />
                        </div>
                        <div>
                            <h5 className="mb-0" style={{ fontSize: "1.25rem" }}>{citaEdit ? "Editar" : "Nueva"} Cita</h5>
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Programa una cita para tu mascota</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-3 px-md-4 py-3 py-md-4">
                    <Row className="g-3">
                        <Col xs={12}>
                            <h6 className="text-muted mb-3" style={sectionTitleStyle}>
                                👤 Contacto
                            </h6>
                            <Form.Label className="fw-semibold">Contacto relacionado</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={inputGroupTextStyle}>
                                    <User size={16} />
                                </InputGroup.Text>
                                <Form.Select
                                    value={form.id_contacto}
                                    onChange={e => setForm({ ...form, id_contacto: e.target.value })}
                                    style={rightRoundedControlStyle}
                                    disabled={guardando}
                                >
                                    <option value="">Sin contacto asociado</option>
                                    {contactos.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {getIconoTipo(c.tipo)} {c.nombre} {c.apellido} - {renderTipo(c)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                            {contactoSeleccionado && (
                                <div className="mt-2 p-2 rounded" style={{ backgroundColor: "#f8f5fc", fontSize: "0.85rem" }}>
                                    <strong>{getIconoTipo(contactoSeleccionado.tipo)} {contactoSeleccionado.nombre}</strong>
                                    {contactoSeleccionado.celular && <span className="ms-2 text-muted">• {contactoSeleccionado.celular}</span>}
                                </div>
                            )}
                        </Col>

                        <Col xs={12}>
                            <h6 className="text-muted mb-3 mt-2" style={sectionTitleStyle}>
                                📅 Fechas
                            </h6>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Fecha de la cita *</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={inputGroupTextStyle}>
                                    <Calendar size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={form.fecha_evento}
                                    onChange={e => setForm({ ...form, fecha_evento: e.target.value })}
                                    style={rightRoundedControlStyle}
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Próxima cita</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={inputGroupTextStyle}>
                                    <Clock size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={form.proxima_fecha}
                                    onChange={e => setForm({ ...form, proxima_fecha: e.target.value })}
                                    style={rightRoundedControlStyle}
                                    disabled={guardando}
                                />
                            </InputGroup>
                            <small className="text-muted" style={{ fontSize: "0.75rem" }}>Fecha tentativa del próximo control</small>
                        </Col>

                        <Col xs={12}>
                            <h6 className="text-muted mb-3 mt-2" style={sectionTitleStyle}>
                                📝 Detalles
                            </h6>
                        </Col>
                        <Col xs={12}>
                            <Form.Label className="fw-semibold">Título *</Form.Label>
                            <Form.Control
                                value={form.titulo}
                                onChange={e => setForm({ ...form, titulo: e.target.value })}
                                placeholder="Ej: Control anual, Vacunación, Peluquería"
                                style={roundedControlStyle}
                                isInvalid={!!errores.titulo}
                                disabled={guardando}
                            />
                            <Form.Control.Feedback type="invalid">{errores.titulo}</Form.Control.Feedback>
                        </Col>
                        <Col xs={12}>
                            <Form.Label className="fw-semibold">Detalle *</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ ...inputGroupTextStyle, alignItems: "flex-start", paddingTop: "0.6rem" }}>
                                    <FileText size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={form.nota}
                                    onChange={e => setForm({ ...form, nota: e.target.value })}
                                    placeholder="Describe el motivo de la cita, tratamiento necesario, observaciones..."
                                    style={rightRoundedControlStyle}
                                    isInvalid={!!errores.nota}
                                    disabled={guardando}
                                />
                                <Form.Control.Feedback type="invalid">{errores.nota}</Form.Control.Feedback>
                            </InputGroup>
                        </Col>
                        <Col xs={12}>
                            <div className="p-3 rounded" style={{ backgroundColor: "#f8f5fc", border: "2px dashed #e5d9f2" }}>
                                <Form.Check
                                    type="checkbox"
                                    id="recordatorio-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2">
                                            <Bell size={18} color={form.recordatorio ? "#cd7fa7" : "#8a7a9c"} />
                                            <span className="fw-semibold">Activar recordatorio</span>
                                            <Badge bg="info" className="ms-2" style={{ backgroundColor: "#7f9bc2" }}>Próximamente</Badge>
                                        </span>
                                    }
                                    checked={form.recordatorio}
                                    onChange={e => setForm({ ...form, recordatorio: e.target.checked })}
                                    disabled={guardando}
                                />
                                <small className="text-muted d-block ms-4" style={{ fontSize: "0.75rem" }}>Recibirás una notificación antes de la cita</small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: "2px solid #e5d9f2", padding: "1rem", flexWrap: "wrap", gap: "0.75rem" }}>
                    <Button
                        variant="outline-secondary"
                        onClick={onHide}
                        disabled={guardando}
                        className="px-4 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                        style={{ minHeight: "44px" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={guardando}
                        className="px-4 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                        style={{ minHeight: "44px", minWidth: "140px" }}
                    >
                        {guardando ? "Guardando..." : citaEdit ? "Actualizar" : "Crear Cita"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}