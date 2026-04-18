import React, { useEffect, useState, useRef } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { User, Phone, MapPin, Clock, Calendar as CalendarIcon, FileText } from "lucide-react";
import styles from "./ModalBase.module.css";

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

    if (!normalized.nombre) errores.nombre = "El nombre es obligatorio.";
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
    const firstInputRef = useRef(null);

    const isEdit = Boolean(contactoEdit);

    useEffect(() => {
        if (!show) return;
        setForm(buildForm(contactoEdit));
        setErrores({});
        setValidated(false);
    }, [contactoEdit, show]);

    useEffect(() => {
        if (!show) return;
        const id = setTimeout(() => {
            firstInputRef.current?.focus({ preventScroll: true });
        }, 100);
        return () => clearTimeout(id);
    }, [show]);

    const updateForm = (nextForm) => {
        setForm(nextForm);
        if (validated) setErrores(validateForm(nextForm));
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

        try {
            setGuardando(true);
            const ok = await onSave(sanitizePayload(form));
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
            centered
            scrollable
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            autoFocus={false}
            dialogClassName={styles.modal}
            contentClassName={styles.content}
        >
            <Form onSubmit={handleSubmit} noValidate>
                <Modal.Header closeButton={!guardando} className={styles.header}>
                    <Modal.Title className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <User size={22} style={{ color: "#7f9bc2" }} />
                        </div>
                        <div className={styles.title}>
                            <h4>{isEdit ? "Editar" : "Nuevo"} contacto</h4>
                            <small>Gestiona la información del contacto</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-3">
                        <Col xs={12}>
                            <div className={styles.sectionTitle}>📋 Categoría</div>
                            <Form.Select
                                value={form.tipo}
                                onChange={handleChange("tipo")}
                                className={styles.fullRounded}
                                disabled={guardando}
                            >
                                <option value="veterinario">🏥 Veterinario</option>
                                <option value="peluqueria">✂️ Peluquería</option>
                                <option value="paseador">🦮 Paseador</option>
                                <option value="petshop">🏪 Pet Shop</option>
                                <option value="guarderia">🏠 Guardería</option>
                                <option value="otro">📋 Otro</option>
                            </Form.Select>
                        </Col>

                        {form.tipo === "otro" && (
                            <Col xs={12}>
                                <Form.Control
                                    value={form.categoria_personalizada}
                                    onChange={handleChange("categoria_personalizada")}
                                    placeholder="Ej: Adiestrador, Nutricionista"
                                    className={styles.fullRounded}
                                    isInvalid={!!errores.categoria_personalizada}
                                    maxLength={60}
                                    disabled={guardando}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errores.categoria_personalizada}
                                </Form.Control.Feedback>
                            </Col>
                        )}

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>👤 Información personal</div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <User size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        ref={firstInputRef}
                                        value={form.nombre}
                                        onChange={handleChange("nombre")}
                                        placeholder="Nombre"
                                        className={styles.formControl}
                                        isInvalid={!!errores.nombre}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.nombre}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    value={form.apellido}
                                    onChange={handleChange("apellido")}
                                    placeholder="Apellido"
                                    className={styles.fullRounded}
                                    disabled={guardando}
                                />
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>📞 Contacto</div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Celular</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Phone size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.celular}
                                        onChange={handleChange("celular")}
                                        placeholder="3456-123456"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Teléfono fijo</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Phone size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.telefono_fijo}
                                        onChange={handleChange("telefono_fijo")}
                                        placeholder="03456-421234"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>📍 Ubicación y horarios</div>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Dirección</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <MapPin size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.direccion}
                                        onChange={handleChange("direccion")}
                                        placeholder="Calle, número, ciudad"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Días de atención</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <CalendarIcon size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.dias_atencion}
                                        onChange={handleChange("dias_atencion")}
                                        placeholder="Lunes a Viernes"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group>
                                <Form.Label>Horarios</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Clock size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.horarios}
                                        onChange={handleChange("horarios")}
                                        placeholder="9:00 a 18:00"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>📝 Información adicional</div>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Notas</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <FileText size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={form.notas}
                                        onChange={handleChange("notas")}
                                        placeholder="Observaciones, preferencias, historial..."
                                        className={styles.formControl}
                                        style={{ resize: "none" }}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                                <div className={styles.charCount}>{form.notas.length}/500</div>
                            </Form.Group>
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
                        ) : isEdit ? "Actualizar" : "Crear contacto"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}