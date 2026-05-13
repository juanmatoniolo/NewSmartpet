import React, { useEffect, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    InputGroup,
    Spinner,
    Alert,
} from "react-bootstrap";
import {
    Users,
    Phone,
    AtSign,
    MapPin,
    Star,
    Briefcase,
    Tag,
} from "lucide-react";
import styles from "./ModalContacto.module.css";

const isTrue = (value) => value === true || value === 1 || value === "1";

export default function ModalContacto({
    show,
    onHide,
    contactoEdit,
    onSave,
}) {
    const [form, setForm] = useState({
        tipo: "veterinario",
        nombre: "",
        apellido: "",
        celular: "",
        telefono_fijo: "",
        email: "",
        direccion: "",
        horarios: "",
        dias_atencion: "",
        favorito: false,
        categoria_personalizada: "",
    });

    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    const isEdit = Boolean(contactoEdit);

    const tipos = [
        { value: "veterinario", label: "🏥 Veterinario" },
        { value: "peluqueria", label: "✂️ Peluquería" },
        { value: "paseador", label: "🦮 Paseador" },
        { value: "petshop", label: "🏪 Pet Shop" },
        { value: "guarderia", label: "🏠 Guardería" },
        { value: "otro", label: "📌 Otro" },
    ];

    useEffect(() => {
        if (!show) return;

        if (contactoEdit) {
            setForm({
                tipo: contactoEdit.tipo || "veterinario",
                nombre: contactoEdit.nombre || "",
                apellido: contactoEdit.apellido || "",
                celular: contactoEdit.celular || "",
                telefono_fijo: contactoEdit.telefono_fijo || "",
                email: contactoEdit.email || "",
                direccion: contactoEdit.direccion || "",
                horarios: contactoEdit.horarios || "",
                dias_atencion: contactoEdit.dias_atencion || "",
                favorito: isTrue(contactoEdit.favorito),
                categoria_personalizada: contactoEdit.categoria_personalizada || "",
            });
        } else {
            setForm({
                tipo: "veterinario",
                nombre: "",
                apellido: "",
                celular: "",
                telefono_fijo: "",
                email: "",
                direccion: "",
                horarios: "",
                dias_atencion: "",
                favorito: false,
                categoria_personalizada: "",
            });
        }

        setErrores({});
    }, [show, contactoEdit]);

    const setField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));

        setErrores((prev) => ({
            ...prev,
            [field]: "",
        }));
    };

    const validateForm = () => {
        const errors = {};

        if (!form.nombre.trim()) errors.nombre = "Ingresá el nombre";
        if (form.tipo === "otro" && !form.categoria_personalizada.trim()) {
            errors.categoria_personalizada = "Ingresá la categoría";
        }
        if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errors.email = "Email inválido";
        }

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
                favorito: form.favorito ? 1 : 0,
                nombre: form.nombre.trim(),
                apellido: form.apellido.trim(),
                email: form.email.trim(),
                categoria_personalizada: form.categoria_personalizada.trim(),
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
                        <Users size={24} />
                        <div>
                            <div>{isEdit ? "Editar contacto" : "Nuevo contacto"}</div>
                            <small className="text-muted fw-normal">
                                Guardá veterinarios, peluquerías u otros proveedores en tu agenda personal
                            </small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}>
                            <Alert variant="light" className="border rounded-4 mb-0">
                                <strong>Tip:</strong> los contactos se guardan en tu cuenta y están disponibles para todas tus mascotas.
                            </Alert>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Tipo de contacto</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Briefcase size={16} />
                                </InputGroup.Text>
                                <Form.Select
                                    value={form.tipo}
                                    onChange={(e) => setField("tipo", e.target.value)}
                                    disabled={guardando}
                                >
                                    {tipos.map((tipo) => (
                                        <option key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </InputGroup>
                        </Col>

                        {form.tipo === "otro" && (
                            <Col xs={12} md={6}>
                                <Form.Label className="fw-bold">Categoría</Form.Label>
                                <InputGroup hasValidation>
                                    <InputGroup.Text>
                                        <Tag size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        value={form.categoria_personalizada}
                                        onChange={(e) => setField("categoria_personalizada", e.target.value)}
                                        placeholder="Ej: Adiestrador"
                                        isInvalid={!!errores.categoria_personalizada}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errores.categoria_personalizada}
                                    </Form.Control.Feedback>
                                </InputGroup>
                            </Col>
                        )}

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Nombre *</Form.Label>
                            <Form.Control
                                value={form.nombre}
                                onChange={(e) => setField("nombre", e.target.value)}
                                placeholder="Nombre del contacto"
                                isInvalid={!!errores.nombre}
                                disabled={guardando}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errores.nombre}
                            </Form.Control.Feedback>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Apellido / Local</Form.Label>
                            <Form.Control
                                value={form.apellido}
                                onChange={(e) => setField("apellido", e.target.value)}
                                placeholder="Apellido o nombre del local"
                                disabled={guardando}
                            />
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Celular / WhatsApp</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Phone size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="tel"
                                    value={form.celular}
                                    onChange={(e) => setField("celular", e.target.value)}
                                    placeholder="Ej: 11 5555 5555"
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Teléfono fijo</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <Phone size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="tel"
                                    value={form.telefono_fijo}
                                    onChange={(e) => setField("telefono_fijo", e.target.value)}
                                    placeholder="Opcional"
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Email</Form.Label>
                            <InputGroup hasValidation>
                                <InputGroup.Text>
                                    <AtSign size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setField("email", e.target.value)}
                                    placeholder="mail@ejemplo.com"
                                    isInvalid={!!errores.email}
                                    disabled={guardando}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errores.email}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <Form.Label className="fw-bold">Dirección</Form.Label>
                            <InputGroup>
                                <InputGroup.Text>
                                    <MapPin size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    value={form.direccion}
                                    onChange={(e) => setField("direccion", e.target.value)}
                                    placeholder="Dirección del lugar"
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Horarios</Form.Label>
                            <Form.Control
                                value={form.horarios}
                                onChange={(e) => setField("horarios", e.target.value)}
                                placeholder="Ej: 9 a 18 hs"
                                disabled={guardando}
                            />
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-bold">Días de atención</Form.Label>
                            <Form.Control
                                value={form.dias_atencion}
                                onChange={(e) => setField("dias_atencion", e.target.value)}
                                placeholder="Ej: Lunes a viernes"
                                disabled={guardando}
                            />
                        </Col>

                        <Col xs={12}>
                            <div className="p-3 border rounded-4 bg-light">
                                <Form.Check
                                    type="checkbox"
                                    id="favorito-contacto"
                                    checked={form.favorito}
                                    onChange={(e) => setField("favorito", e.target.checked)}
                                    disabled={guardando}
                                    label={
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <Star size={18} />
                                            Marcar como favorito
                                        </span>
                                    }
                                />
                            </div>
                        </Col>
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
                            "Actualizar contacto"
                        ) : (
                            "Crear contacto"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}