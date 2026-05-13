import React, { useEffect, useMemo, useState } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    InputGroup,
    Spinner,
    Alert
} from "react-bootstrap";
import {
    Syringe,
    Calendar,
    FileText,
    Package,
    Hash,
    User,
    CheckCircle,
    PawPrint
} from "lucide-react";
import styles from "./ModalVacuna.module.css";

export default function ModalVacuna({
    show,
    onHide,
    vacunaEdit,
    mascotas = [],
    mascotaId = "",
    onSave
}) {
    const [form, setForm] = useState({
        mascota_id: "",
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
                mascota_id:
                    vacunaEdit.mascota_id?.toString() ||
                    vacunaEdit.id_mascota?.toString() ||
                    mascotaId?.toString() ||
                    "",
                nombre: vacunaEdit.titulo || "",
                fecha_aplicacion: vacunaEdit.proxima_fecha || "",
                proxima_dosis: vacunaEdit.fecha_evento || "",
                laboratorio: vacunaEdit.laboratorio || "",
                lote: vacunaEdit.lote || "",
                veterinario: vacunaEdit.nota || "",
                notas: vacunaEdit.notas || "",
                completada:
                    vacunaEdit.completada === true ||
                    vacunaEdit.completada === 1 ||
                    vacunaEdit.completada === "1"
            });
        } else {
            setForm({
                mascota_id:
                    mascotaId?.toString() ||
                    (mascotas.length === 1 ? mascotas[0].id?.toString() : ""),
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
    }, [vacunaEdit, show, mascotaId, mascotas]);

    const mascotaSeleccionada = useMemo(
        () => mascotas.find((m) => String(m.id) === String(form.mascota_id)),
        [mascotas, form.mascota_id]
    );

    const validateForm = () => {
        const errors = {};

        if (!form.mascota_id) errors.mascota_id = "Seleccioná la mascota";
        if (!form.nombre.trim()) errors.nombre = "El nombre de la vacuna es obligatorio";

        return errors;
    };

    const handleClose = () => {
        if (guardando) return;
        onHide();
    };

    const setField = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value
        }));

        if (validated) {
            setErrores((prev) => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = validateForm();
        setValidated(true);
        setErrores(errors);

        if (Object.keys(errors).length > 0) return;

        setGuardando(true);

        try {
            const payload = {
                mascota_id: Number(form.mascota_id),
                id_mascota: Number(form.mascota_id),
                titulo: form.nombre.trim(),
                fecha_evento: form.proxima_dosis || null,
                proxima_fecha: form.fecha_aplicacion || null,
                nota: form.veterinario || "",
                laboratorio: form.laboratorio || "",
                lote: form.lote || "",
                notas: form.notas || "",
                completada: form.completada ? 1 : 0
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
                            <Syringe size={24} style={{ color: "#6fbf8c" }} strokeWidth={2.2} />
                        </div>

                        <div className={styles.title}>
                            <h4>{isEdit ? "Editar vacuna" : "Nueva vacuna"}</h4>
                            <small>
                                {mascotaSeleccionada
                                    ? `Vacuna asociada a ${mascotaSeleccionada.nombre}`
                                    : "Elegí la mascota y registrá su vacuna"}
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
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>💉</span> Vacuna
                            </div>

                            <Form.Group controlId="nombreVacuna">
                                <Form.Label className="fw-semibold mb-2">
                                    Nombre <span className="text-danger">*</span>
                                </Form.Label>

                                <InputGroup hasValidation>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Syringe size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        value={form.nombre}
                                        onChange={(e) => setField("nombre", e.target.value)}
                                        placeholder="Antirrábica, Óctuple, Séxtuple..."
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

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📅</span> Fechas
                            </div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="fechaAplicacion">
                                <Form.Label className="fw-semibold mb-2">Fecha de aplicación</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="date"
                                        value={form.fecha_aplicacion}
                                        onChange={(e) => setField("fecha_aplicacion", e.target.value)}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="proximaDosis">
                                <Form.Label className="fw-semibold mb-2">Próxima dosis</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        type="date"
                                        value={form.proxima_dosis}
                                        onChange={(e) => setField("proxima_dosis", e.target.value)}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>

                                <small className="text-muted d-block mt-1">
                                    Fecha estimada para refuerzo
                                </small>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📦</span> Producto
                            </div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="laboratorio">
                                <Form.Label className="fw-semibold mb-2">Laboratorio</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Package size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        value={form.laboratorio}
                                        onChange={(e) => setField("laboratorio", e.target.value)}
                                        placeholder="Laboratorio"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="lote">
                                <Form.Label className="fw-semibold mb-2">Lote</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Hash size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        value={form.lote}
                                        onChange={(e) => setField("lote", e.target.value)}
                                        placeholder="Número de lote"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📝</span> Información adicional
                            </div>
                        </Col>

                        <Col xs={12}>
                            <Form.Group controlId="veterinario">
                                <Form.Label className="fw-semibold mb-2">Veterinario que la aplicó</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <User size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        value={form.veterinario}
                                        onChange={(e) => setField("veterinario", e.target.value)}
                                        placeholder="Nombre del profesional"
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <Form.Group controlId="notas">
                                <Form.Label className="fw-semibold mb-2">Notas</Form.Label>

                                <InputGroup>
                                    <InputGroup.Text
                                        className={styles.inputGroupText}
                                        style={{ alignItems: "flex-start", paddingTop: "0.65rem" }}
                                    >
                                        <FileText size={16} />
                                    </InputGroup.Text>

                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        value={form.notas}
                                        onChange={(e) => setField("notas", e.target.value)}
                                        placeholder="Reacciones, observaciones, seguimiento..."
                                        className={styles.formControl}
                                        style={{ resize: "vertical" }}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div
                                className={`${styles.completedBox} ${form.completada ? styles.completedBoxActive : ""
                                    }`}
                            >
                                <Form.Check
                                    type="checkbox"
                                    id="completada-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2">
                                            <CheckCircle
                                                size={18}
                                                color={form.completada ? "#6fbf8c" : "#8a7a9c"}
                                            />
                                            <span className="fw-semibold">Marcar como aplicada</span>
                                        </span>
                                    }
                                    checked={form.completada}
                                    onChange={(e) => setField("completada", e.target.checked)}
                                    disabled={guardando}
                                />

                                <small className="text-muted d-block ms-4 mt-1">
                                    {form.completada
                                        ? "Esta vacuna se marcará como completada"
                                        : "Marcá esta opción cuando la vacuna haya sido aplicada"}
                                </small>
                            </div>
                        </Col>

                        {mascotaSeleccionada && form.nombre && (
                            <Col xs={12}>
                                <Alert variant="light" className="mb-0 border rounded-4">
                                    <strong>Resumen:</strong> {form.nombre} para{" "}
                                    <strong>{mascotaSeleccionada.nombre}</strong>
                                    {form.fecha_aplicacion ? ` el ${form.fecha_aplicacion}` : ""}.
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
                            "Actualizar vacuna"
                        ) : (
                            "Crear vacuna"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}