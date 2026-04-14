import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Badge, Spinner } from "react-bootstrap";
import { Syringe, Calendar, FileText, Package, Hash, User, CheckCircle } from "lucide-react";

// Estilos fijos (sin variables CSS)
const headerStyle = {
    borderBottom: "2px solid #e5d9f2",
    background: "linear-gradient(135deg, #f8f5fc 0%, white 100%)",
    padding: "1rem 1.5rem",
};

const inputGroupTextStyle = {
    backgroundColor: "#f8f5fc",
    border: "1px solid #e5d9f2",
    borderRight: "none",
};

const roundedControlStyle = {
    borderRadius: "0.5rem",
    padding: "0.6rem 0.75rem",
    fontSize: "1rem",
};

const rightRoundedControlStyle = {
    borderRadius: "0 0.5rem 0.5rem 0",
    fontSize: "1rem",
    borderLeft: "none",
};

const sectionTitleStyle = {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#6c757d",
    fontWeight: 600,
    marginBottom: "1rem",
};

export default function ModalVacuna({ show, onHide, vacunaEdit, mascotaId, onSave }) {
    const [form, setForm] = useState({
        nombre: "",
        fecha_aplicacion: "",
        proxima_dosis: "",
        laboratorio: "",
        lote: "",
        veterinario: "",
        notas: "",
        completada: false
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [validated, setValidated] = useState(false);

    const isEdit = Boolean(vacunaEdit);

    useEffect(() => {
        if (!show) return;
        if (vacunaEdit) {
            setForm({
                nombre: vacunaEdit.titulo || "",
                fecha_aplicacion: vacunaEdit.fecha_evento || "",
                proxima_dosis: vacunaEdit.proxima_fecha || "",
                laboratorio: vacunaEdit.laboratorio || "",
                lote: vacunaEdit.lote || "",
                veterinario: vacunaEdit.nota || "",
                notas: vacunaEdit.notas || "",
                completada: vacunaEdit.completada || false
            });
        } else {
            setForm({
                nombre: "",
                fecha_aplicacion: "",
                proxima_dosis: "",
                laboratorio: "",
                lote: "",
                veterinario: "",
                notas: "",
                completada: false
            });
        }
        setErrores({});
        setValidated(false);
    }, [vacunaEdit, show]);

    const validateForm = () => {
        const errors = {};
        if (!form.nombre.trim()) errors.nombre = "El nombre de la vacuna es obligatorio";
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validateForm();
        setValidated(true);
        setErrores(errors);
        if (Object.keys(errors).length > 0) return;

        setGuardando(true);
        const payload = {
            titulo: form.nombre,
            fecha_evento: form.fecha_aplicacion,
            proxima_fecha: form.proxima_dosis,
            nota: form.veterinario,
            laboratorio: form.laboratorio,
            lote: form.lote,
            notas: form.notas,
            completada: form.completada
        };
        const ok = await onSave(payload);
        setGuardando(false);
        if (ok) onHide();
    };

    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm(prev => ({ ...prev, [field]: value }));
        if (validated) setErrores(validateForm({ ...form, [field]: value }));
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            fullscreen="sm-down"
            centered
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            scrollable
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando} style={headerStyle}>
                    <Modal.Title className="d-flex align-items-center gap-3">
                        <div className="p-2 rounded-circle" style={{ backgroundColor: "rgba(155, 142, 194, 0.15)" }}>
                            <Syringe size={24} style={{ color: "#9b8ec2" }} />
                        </div>
                        <div>
                            <h5 className="mb-0" style={{ fontSize: "1.3rem" }}>{vacunaEdit ? "Editar" : "Nueva"} Vacuna</h5>
                            <small className="text-muted">Registra el plan de vacunación</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-3 px-md-5 py-4">
                    <Row className="g-4">
                        {/* Nombre vacuna */}
                        <Col xs={12}>
                            <h6 className="text-muted" style={sectionTitleStyle}>
                                💉 Vacuna
                            </h6>
                            <Form.Group controlId="nombreVacuna">
                                <Form.Label className="fw-semibold">
                                    Nombre de la vacuna <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Syringe size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.nombre}
                                        onChange={handleChange("nombre")}
                                        placeholder="Ej: Antirrábica, Óctuple, Sextuple"
                                        style={rightRoundedControlStyle}
                                        isInvalid={!!errores.nombre}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.nombre}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Fechas */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📅 Fechas
                            </h6>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group controlId="fechaAplicacion">
                                <Form.Label className="fw-semibold">Fecha de aplicación</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={form.fecha_aplicacion}
                                        onChange={handleChange("fecha_aplicacion")}
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group controlId="proximaDosis">
                                <Form.Label className="fw-semibold">Próxima dosis</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={form.proxima_dosis}
                                        onChange={handleChange("proxima_dosis")}
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                                <small className="text-muted" style={{ fontSize: "0.75rem" }}>Fecha estimada para refuerzo</small>
                            </Form.Group>
                        </Col>

                        {/* Producto */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📦 Producto
                            </h6>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group controlId="laboratorio">
                                <Form.Label className="fw-semibold">Laboratorio</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Package size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.laboratorio}
                                        onChange={handleChange("laboratorio")}
                                        placeholder="Ej: Laboratorio Richmond"
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Group controlId="lote">
                                <Form.Label className="fw-semibold">Lote</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Hash size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.lote}
                                        onChange={handleChange("lote")}
                                        placeholder="Número de lote"
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Información adicional */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📝 Información Adicional
                            </h6>
                        </Col>
                        <Col xs={12}>
                            <Form.Group controlId="veterinario">
                                <Form.Label className="fw-semibold">Veterinario que la aplicó</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <User size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.veterinario}
                                        onChange={handleChange("veterinario")}
                                        placeholder="Nombre del profesional"
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group controlId="notas">
                                <Form.Label className="fw-semibold">Notas</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={{ ...inputGroupTextStyle, alignItems: "flex-start", paddingTop: "0.6rem" }}>
                                        <FileText size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={form.notas}
                                        onChange={handleChange("notas")}
                                        placeholder="Reacciones, observaciones..."
                                        style={rightRoundedControlStyle}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Checkbox completada */}
                        <Col xs={12}>
                            <div
                                className="p-3 rounded"
                                style={{
                                    backgroundColor: form.completada ? "rgba(155, 142, 194, 0.1)" : "#f8f5fc",
                                    border: `2px dashed ${form.completada ? "#9b8ec2" : "#e5d9f2"}`,
                                    transition: "all 0.2s"
                                }}
                            >
                                <Form.Check
                                    type="checkbox"
                                    id="completada-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2">
                                            <CheckCircle size={18} color={form.completada ? "#9b8ec2" : "#8a7a9c"} />
                                            <span className="fw-semibold">Marcar como aplicada</span>
                                        </span>
                                    }
                                    checked={form.completada}
                                    onChange={handleChange("completada")}
                                    disabled={guardando}
                                />
                                <small className="text-muted d-block ms-4" style={{ fontSize: "0.75rem" }}>
                                    {form.completada
                                        ? "Esta vacuna se marcará como completada"
                                        : "Marca esta opción cuando la vacuna haya sido aplicada"}
                                </small>
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
                        variant="warning"
                        disabled={guardando}
                        className="px-4 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                        style={{ minHeight: "44px", minWidth: "140px" }}
                    >
                        {guardando ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" />
                                Guardando...
                            </span>
                        ) : vacunaEdit ? "Actualizar" : "Crear Vacuna"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}