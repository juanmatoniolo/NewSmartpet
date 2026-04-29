import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    InputGroup,
    Spinner,
    Badge,
    Alert
} from "react-bootstrap";
import {
    FileText,
    Calendar,
    User,
    Award,
    Heart,
    PawPrint,
    CheckCircle
} from "lucide-react";
import styles from "./ModalHistorial.module.css";

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
                    mascotaId?.toString() ||
                    "",
                id_contacto: historialEdit.id_contacto?.toString() || "",
                fecha_evento: historialEdit.fecha_evento || "",
                titulo: historialEdit.titulo || "",
                nota: historialEdit.nota || ""
            });
        } else {
            setForm({
                mascota_id:
                    mascotaId?.toString() ||
                    (mascotas.length === 1 ? mascotas[0].id?.toString() : ""),
                id_contacto: "",
                fecha_evento: "",
                titulo: "",
                nota: ""
            });
        }

        setErrores({});
    }, [historialEdit, show, mascotaId, mascotas]);

    const mascotaSeleccionada = useMemo(
        () => mascotas.find((m) => String(m.id) === String(form.mascota_id)),
        [mascotas, form.mascota_id]
    );

    const contactosFiltrados = useMemo(() => {
        if (!form.mascota_id) return contactos;

        return contactos.filter((contacto) => {
            const contactoMascotaId =
                contacto.mascota_id || contacto.id_mascota || contacto.mascotaId || "";

            return !contactoMascotaId || String(contactoMascotaId) === String(form.mascota_id);
        });
    }, [contactos, form.mascota_id]);

    const validateForm = () => {
        const errors = {};

        if (!form.mascota_id) errors.mascota_id = "Seleccioná la mascota";
        if (!form.titulo.trim()) errors.titulo = "El título es obligatorio";
        if (!form.nota.trim()) errors.nota = "El detalle es obligatorio";

        return errors;
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

        setGuardando(true);

        try {
            const payload = {
                ...form,
                mascota_id: Number(form.mascota_id),
                id_mascota: Number(form.mascota_id),
                id_contacto: form.id_contacto ? Number(form.id_contacto) : null
            };

            const ok = await onSave(payload);

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

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            fullscreen="md-down"
            backdrop={guardando ? "static" : true}
            keyboard={!guardando}
            scrollable
            autoFocus={false}
            dialogClassName={styles.dialog}
            contentClassName={styles.content}
        >
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando} className={styles.header}>
                    <Modal.Title className={styles.headerTitle}>
                        <div className={styles.iconWrapper}>
                            <FileText size={30} strokeWidth={1.8} />
                        </div>

                        <div className={styles.title}>
                            <h4>{isEdit ? "Editar registro" : "Nuevo registro en bitácora"}</h4>

                            <div className={styles.badgeContainer}>
                                <Badge bg="light" className={styles.serviceBadge}>
                                    <Award size={12} /> Servicios profesionales
                                </Badge>
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-4">
                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <PawPrint size={18} /> Mascota
                            </div>

                            <InputGroup hasValidation>
                                <InputGroup.Text className={styles.inputGroupText}>
                                    <PawPrint size={16} />
                                </InputGroup.Text>

                                <Form.Select
                                    value={form.mascota_id}
                                    onChange={(e) => setField("mascota_id", e.target.value)}
                                    className={styles.formControl}
                                    isInvalid={!!errores.mascota_id}
                                    disabled={guardando || Boolean(mascotaId)}
                                >
                                    <option value="">Seleccioná la mascota</option>
                                    {mascotas.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            🐾 {m.nombre || `Mascota #${m.id}`}
                                        </option>
                                    ))}
                                </Form.Select>

                                <Form.Control.Feedback type="invalid">
                                    {errores.mascota_id}
                                </Form.Control.Feedback>
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <User size={18} /> Contacto opcional
                                <span className={styles.tooltip}>Asocia este registro a un proveedor</span>
                            </div>

                            <Form.Group>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <User size={16} />
                                    </InputGroup.Text>

                                    <Form.Select
                                        value={form.id_contacto}
                                        onChange={(e) => setField("id_contacto", e.target.value)}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    >
                                        <option value="">Sin contacto asociado</option>
                                        {contactosFiltrados.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {getIconoTipo(c.tipo)} {c.nombre} {c.apellido || ""} -{" "}
                                                {renderTipo(c)}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <Calendar size={18} /> Fecha del evento
                            </div>

                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}>
                                    <Calendar size={16} />
                                </InputGroup.Text>

                                <Form.Control
                                    type="date"
                                    value={form.fecha_evento}
                                    onChange={(e) => setField("fecha_evento", e.target.value)}
                                    className={styles.formControl}
                                    disabled={guardando}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <FileText size={18} /> Detalles del servicio
                            </div>

                            <Form.Group>
                                <Form.Label className={styles.labelRequired}>Título</Form.Label>

                                <Form.Control
                                    value={form.titulo}
                                    onChange={(e) => setField("titulo", e.target.value)}
                                    placeholder="Control de peso, vacunación, peluquería..."
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
                                <Form.Label className={styles.labelRequired}>
                                    Nota / Observaciones
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
                                        rows={5}
                                        value={form.nota}
                                        onChange={(e) => setField("nota", e.target.value)}
                                        placeholder="Describe el servicio realizado, resultados, recomendaciones..."
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

                        {mascotaSeleccionada && form.titulo && (
                            <Col xs={12}>
                                <Alert variant="light" className="mb-0 border rounded-4">
                                    <div className="d-flex align-items-start gap-2">
                                        <CheckCircle size={18} color="#6c5c94" />
                                        <div>
                                            <strong>Resumen:</strong> {form.titulo} para{" "}
                                            <strong>{mascotaSeleccionada.nombre}</strong>.
                                        </div>
                                    </div>
                                </Alert>
                            </Col>
                        )}
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
                        ) : (
                            <>
                                <Heart size={16} className="me-2" />
                                {isEdit ? "Actualizar servicio" : "Registrar servicio"}
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}