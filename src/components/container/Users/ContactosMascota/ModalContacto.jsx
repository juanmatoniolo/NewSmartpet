import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { User, Phone, MapPin, Clock, Calendar as CalendarIcon, FileText } from "lucide-react";

const createInitialForm = () => ({
    tipo: "veterinario",
    categoria_personalizada: "",
    nombre: "",
    apellido: "",
    celular: "",
    telefono_fijo: "",
    direccion: "",
    horarios: "",
    dias_atencion: "",
    notas: "",
});

const sectionTitleStyle = {
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    color: "#6c757d",
    fontWeight: 600,
    marginBottom: "1rem",
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

function sanitizeText(value = "") {
    return value.replace(/\s+/g, " ").trim();
}

function sanitizePhone(value = "") {
    return value.replace(/[^\d+\-\s()]/g, "").trim();
}

function normalizeTipo(tipo = "") {
    const allowed = ["veterinario", "peluqueria", "paseador", "petshop", "guarderia", "otro"];
    return allowed.includes(tipo) ? tipo : "veterinario";
}

function buildForm(contactoEdit) {
    if (!contactoEdit) return createInitialForm();

    const tipo = normalizeTipo(contactoEdit.tipo);

    return {
        tipo,
        categoria_personalizada: contactoEdit.categoria_personalizada || "",
        nombre: contactoEdit.nombre || "",
        apellido: contactoEdit.apellido || "",
        celular: contactoEdit.celular || "",
        telefono_fijo: contactoEdit.telefono_fijo || "",
        direccion: contactoEdit.direccion || "",
        horarios: contactoEdit.horarios || "",
        dias_atencion: contactoEdit.dias_atencion || "",
        notas: contactoEdit.notas || "",
    };
}

function sanitizePayload(form) {
    return {
        tipo: normalizeTipo(form.tipo),
        categoria_personalizada: form.tipo === "otro" ? sanitizeText(form.categoria_personalizada) : "",
        nombre: sanitizeText(form.nombre),
        apellido: sanitizeText(form.apellido),
        celular: sanitizePhone(form.celular),
        telefono_fijo: sanitizePhone(form.telefono_fijo),
        direccion: sanitizeText(form.direccion),
        horarios: sanitizeText(form.horarios),
        dias_atencion: sanitizeText(form.dias_atencion),
        notas: form.notas.trim(),
    };
}

function validateForm(form) {
    const errores = {};
    const normalized = sanitizePayload(form);

    if (!normalized.nombre) {
        errores.nombre = "El nombre es obligatorio.";
    }

    if (normalized.tipo === "otro" && !normalized.categoria_personalizada) {
        errores.categoria_personalizada = "La categoría personalizada es obligatoria.";
    }

    return errores;
}

export default function ModalContacto({ show, onHide, contactoEdit, onSave }) {
    const [form, setForm] = useState(createInitialForm());
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [validated, setValidated] = useState(false);

    const isEdit = Boolean(contactoEdit);

    useEffect(() => {
        if (!show) return;

        setForm(buildForm(contactoEdit));
        setErrores({});
        setValidated(false);
    }, [contactoEdit, show]);

    const updateForm = (nextForm) => {
        setForm(nextForm);
        if (validated) {
            setErrores(validateForm(nextForm));
        }
    };

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        const nextForm = { ...form, [field]: value };

        if (field === "tipo" && value !== "otro") {
            nextForm.categoria_personalizada = "";
        }

        updateForm(nextForm);
    };

    const handleClose = () => {
        if (guardando) return;
        onHide();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm(form);
        setValidated(true);
        setErrores(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const payload = sanitizePayload(form);

        try {
            setGuardando(true);
            const ok = await onSave(payload);
            if (ok) handleClose();
        } catch (error) {
            console.error("Error al guardar contacto:", error);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            fullscreen="sm-down"
            centered
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            scrollable
        >
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Header
                    closeButton={!guardando}
                    style={{
                        borderBottom: "2px solid #e5d9f2",
                        background: "linear-gradient(135deg, #f8f5fc 0%, white 100%)",
                        padding: "1rem 1.5rem",
                    }}
                >
                    <Modal.Title className="d-flex align-items-center gap-3">
                        <div
                            className="p-2 rounded-circle"
                            style={{ backgroundColor: "rgba(127, 155, 194, 0.15)" }}
                        >
                            <User size={24} style={{ color: "#7f9bc2" }} />
                        </div>
                        <div>
                            <h5 className="mb-0" style={{ fontSize: "1.3rem" }}>
                                {isEdit ? "Editar" : "Nuevo"} contacto
                            </h5>
                            <small className="text-muted">Gestiona la información del contacto</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-3 px-md-5 py-4">
                    <Row className="g-4">
                        {/* Categoría */}
                        <Col xs={12}>
                            <h6 className="text-muted" style={sectionTitleStyle}>
                                📋 Categoría
                            </h6>
                            <Form.Group controlId="tipoContacto">
                                <Form.Label className="fw-semibold">
                                    Tipo de contacto <span className="text-danger">*</span>
                                </Form.Label>
                                <Form.Select
                                    value={form.tipo}
                                    onChange={handleChange("tipo")}
                                    style={roundedControlStyle}
                                    disabled={guardando}
                                >
                                    <option value="veterinario">🏥 Veterinario</option>
                                    <option value="peluqueria">✂️ Peluquería</option>
                                    <option value="paseador">🦮 Paseador</option>
                                    <option value="petshop">🏪 Pet Shop</option>
                                    <option value="guarderia">🏠 Guardería</option>
                                    <option value="otro">📋 Otro</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {form.tipo === "otro" && (
                            <Col xs={12}>
                                <Form.Group controlId="categoriaPersonalizada">
                                    <Form.Label className="fw-semibold">
                                        Categoría personalizada <span className="text-danger">*</span>
                                    </Form.Label>
                                    <Form.Control
                                        value={form.categoria_personalizada}
                                        onChange={handleChange("categoria_personalizada")}
                                        placeholder="Ej: Adiestrador, Nutricionista"
                                        style={roundedControlStyle}
                                        isInvalid={!!errores.categoria_personalizada}
                                        maxLength={60}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.categoria_personalizada}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        )}

                        {/* Información personal */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                👤 Información personal
                            </h6>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="nombreContacto">
                                <Form.Label className="fw-semibold">
                                    Nombre <span className="text-danger">*</span>
                                </Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <User size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.nombre}
                                        onChange={handleChange("nombre")}
                                        placeholder="Nombre del contacto"
                                        style={rightRoundedControlStyle}
                                        isInvalid={!!errores.nombre}
                                        autoComplete="given-name"
                                        maxLength={60}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.nombre}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="apellidoContacto">
                                <Form.Label className="fw-semibold">Apellido</Form.Label>
                                <Form.Control
                                    value={form.apellido}
                                    onChange={handleChange("apellido")}
                                    placeholder="Apellido"
                                    style={roundedControlStyle}
                                    autoComplete="family-name"
                                    maxLength={60}
                                    disabled={guardando}
                                />
                            </Form.Group>
                        </Col>

                        {/* Contacto */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📞 Contacto
                            </h6>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="celularContacto">
                                <Form.Label className="fw-semibold">Celular</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Phone size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.celular}
                                        onChange={handleChange("celular")}
                                        placeholder="Ej: 3456-123456"
                                        style={rightRoundedControlStyle}
                                        inputMode="tel"
                                        autoComplete="tel"
                                        maxLength={25}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="telefonoFijoContacto">
                                <Form.Label className="fw-semibold">Teléfono fijo</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Phone size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.telefono_fijo}
                                        onChange={handleChange("telefono_fijo")}
                                        placeholder="Ej: 03456-421234"
                                        style={rightRoundedControlStyle}
                                        inputMode="tel"
                                        autoComplete="tel-national"
                                        maxLength={25}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Ubicación y horarios */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📍 Ubicación y horarios
                            </h6>
                        </Col>

                        <Col xs={12}>
                            <Form.Group controlId="direccionContacto">
                                <Form.Label className="fw-semibold">Dirección</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <MapPin size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.direccion}
                                        onChange={handleChange("direccion")}
                                        placeholder="Calle, número, ciudad"
                                        style={rightRoundedControlStyle}
                                        autoComplete="street-address"
                                        maxLength={140}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="diasAtencionContacto">
                                <Form.Label className="fw-semibold">Días de atención</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <CalendarIcon size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.dias_atencion}
                                        onChange={handleChange("dias_atencion")}
                                        placeholder="Ej: Lunes a Viernes"
                                        style={rightRoundedControlStyle}
                                        maxLength={80}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="horariosContacto">
                                <Form.Label className="fw-semibold">Horarios</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text style={inputGroupTextStyle}>
                                        <Clock size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.horarios}
                                        onChange={handleChange("horarios")}
                                        placeholder="Ej: 9:00 a 18:00"
                                        style={rightRoundedControlStyle}
                                        maxLength={80}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        {/* Información adicional */}
                        <Col xs={12}>
                            <h6 className="text-muted mt-2" style={sectionTitleStyle}>
                                📝 Información adicional
                            </h6>
                        </Col>

                        <Col xs={12}>
                            <Form.Group controlId="notasContacto">
                                <Form.Label className="fw-semibold">Notas</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text
                                        style={{
                                            ...inputGroupTextStyle,
                                            alignItems: "flex-start",
                                            paddingTop: "0.6rem",
                                        }}
                                    >
                                        <FileText size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={form.notas}
                                        onChange={handleChange("notas")}
                                        placeholder="Información adicional, observaciones..."
                                        style={rightRoundedControlStyle}
                                        maxLength={500}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                                <div className="text-end mt-1">
                                    <small className="text-muted">{form.notas.length}/500</small>
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer
                    style={{
                        borderTop: "2px solid #e5d9f2",
                        padding: "1.25rem 1.5rem",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                    }}
                >
                    <Button
                        variant="outline-secondary"
                        onClick={handleClose}
                        disabled={guardando}
                        className="px-4 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                        style={{ minHeight: "44px" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="success"
                        disabled={guardando}
                        className="px-4 py-2 rounded-pill flex-grow-1 flex-md-grow-0"
                        style={{ minHeight: "44px", minWidth: "160px" }}
                    >
                        {guardando ? (
                            <span className="d-inline-flex align-items-center gap-2">
                                <Spinner animation="border" size="sm" />
                                Guardando...
                            </span>
                        ) : isEdit ? (
                            "Actualizar"
                        ) : (
                            "Crear contacto"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}