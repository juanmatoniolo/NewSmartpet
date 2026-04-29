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
    CheckCircle
} from "lucide-react";
import styles from "./ModalCita.module.css";

export default function ModalCita({
    show,
    onHide,
    citaEdit,
    contactos = [],
    mascotas = [],
    mascotaId = "",
    onSave
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
                    mascotaId?.toString() ||
                    "",
                id_contacto: citaEdit.id_contacto?.toString() || "",
                fecha_evento: citaEdit.fecha_evento || "",
                proxima_fecha: citaEdit.proxima_fecha || "",
                titulo: citaEdit.titulo || "",
                nota: citaEdit.nota || "",
                recordatorio:
                    citaEdit.recordatorio === true ||
                    citaEdit.recordatorio === 1 ||
                    citaEdit.recordatorio === "1"
            });
        } else {
            setForm({
                mascota_id:
                    mascotaId?.toString() ||
                    (mascotas.length === 1 ? mascotas[0].id?.toString() : ""),
                id_contacto: "",
                fecha_evento: "",
                proxima_fecha: "",
                titulo: "",
                nota: "",
                recordatorio: false
            });
        }

        setErrores({});
    }, [citaEdit, show, mascotaId, mascotas]);

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

    const contactoSeleccionado = useMemo(
        () => contactos.find((c) => String(c.id) === String(form.id_contacto)),
        [contactos, form.id_contacto]
    );

    const validateForm = () => {
        const errors = {};

        if (!form.mascota_id) errors.mascota_id = "Seleccioná la mascota";
        if (!form.titulo.trim()) errors.titulo = "El título es obligatorio";
        if (!form.nota.trim()) errors.nota = "El detalle es obligatorio";
        if (!form.fecha_evento.trim()) errors.fecha_evento = "La fecha es obligatoria";

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

        try {
            setGuardando(true);

            const payload = {
                ...form,
                mascota_id: Number(form.mascota_id),
                id_mascota: Number(form.mascota_id),
                id_contacto: form.id_contacto ? Number(form.id_contacto) : null,
                recordatorio: form.recordatorio ? 1 : 0
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
            scrollable
            centered
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
                            <h4>{isEdit ? "Editar cita" : "Nueva cita"}</h4>
                            <small>
                                {mascotaSeleccionada
                                    ? `Actividad para ${mascotaSeleccionada.nombre}`
                                    : "Elegí la mascota y completá los datos del turno"}
                            </small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-3 g-md-4">
                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>🐾</span> Mascota
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

                            {mascotaSeleccionada && (
                                <div className={styles.contactoPreview}>
                                    <strong>🐾 {mascotaSeleccionada.nombre}</strong>
                                    <span>Esta cita quedará asociada a esta mascota</span>
                                </div>
                            )}
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>👤</span> Contacto o proveedor
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

                            {contactoSeleccionado && (
                                <div className={styles.contactoPreview}>
                                    <strong>
                                        {getIconoTipo(contactoSeleccionado.tipo)}{" "}
                                        {contactoSeleccionado.nombre} {contactoSeleccionado.apellido || ""}
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
                                        onChange={(e) => setField("fecha_evento", e.target.value)}
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
                                        onChange={(e) => setField("proxima_fecha", e.target.value)}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>

                                <small className="text-muted d-block mt-1">
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
                                    onChange={(e) => setField("titulo", e.target.value)}
                                    placeholder="Control anual, vacunación, peluquería..."
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
                                        onChange={(e) => setField("nota", e.target.value)}
                                        placeholder="Motivo, tratamiento, observaciones..."
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
                                            <Bell
                                                size={18}
                                                color={form.recordatorio ? "#cd7fa7" : "#8a7a9c"}
                                            />
                                            <span className="fw-semibold">Activar recordatorio</span>
                                            <Badge bg="info" style={{ backgroundColor: "#7f9bc2" }}>
                                                Próximamente
                                            </Badge>
                                        </span>
                                    }
                                    checked={form.recordatorio}
                                    onChange={(e) => setField("recordatorio", e.target.checked)}
                                    disabled={guardando}
                                />

                                <small className="text-muted d-block ms-4 mt-1">
                                    Recibirás una notificación antes de la cita
                                </small>
                            </div>
                        </Col>

                        {mascotaSeleccionada && form.titulo && form.fecha_evento && (
                            <Col xs={12}>
                                <Alert variant="light" className="mb-0 border rounded-4">
                                    <div className="d-flex align-items-start gap-2">
                                        <CheckCircle size={18} color="#6c5c94" />
                                        <div>
                                            <strong>Resumen:</strong> {form.titulo} para{" "}
                                            <strong>{mascotaSeleccionada.nombre}</strong> el{" "}
                                            <strong>{form.fecha_evento}</strong>.
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