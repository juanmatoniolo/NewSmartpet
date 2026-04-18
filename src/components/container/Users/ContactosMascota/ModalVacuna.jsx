import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { Syringe, Calendar, FileText, Package, Hash, User, CheckCircle } from "lucide-react";
import styles from "./ModalVacuna.module.css";

export default function ModalVacuna({ show, onHide, vacunaEdit, onSave }) {
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

    const handleClose = () => {
        if (guardando) return;
        onHide();
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
            if (ok) handleClose();
        } finally {
            setGuardando(false);
        }
    };

    const handleChange = (field) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        const nextForm = { ...form, [field]: value };

        setForm(nextForm);

        if (validated) {
            const nextErrors = {};
            if (!nextForm.nombre.trim()) nextErrors.nombre = "El nombre de la vacuna es obligatorio";
            setErrores(nextErrors);
        }
    };

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
                            <Syringe size={24} style={{ color: "#6fbf8c" }} strokeWidth={2.2} />
                        </div>
                        <div className={styles.title}>
                            <h4>{isEdit ? "Editar" : "Nueva"} vacuna</h4>
                            <small>Registra el plan de vacunación de tu mascota</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-3 g-md-4">
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
                                        onChange={handleChange("nombre")}
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
                                        onChange={handleChange("fecha_aplicacion")}
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
                                        onChange={handleChange("proxima_dosis")}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>

                                <small className="text-muted d-block mt-1" style={{ fontSize: "0.75rem" }}>
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
                                        onChange={handleChange("laboratorio")}
                                        placeholder="Laboratorio Richmond..."
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
                                        onChange={handleChange("lote")}
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
                                        onChange={handleChange("veterinario")}
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
                                        onChange={handleChange("notas")}
                                        placeholder="Reacciones, observaciones, seguimiento..."
                                        className={styles.formControl}
                                        style={{ resize: "vertical" }}
                                        disabled={guardando}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className={`${styles.completedBox} ${form.completada ? styles.completedBoxActive : ""}`}>
                                <Form.Check
                                    type="checkbox"
                                    id="completada-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2">
                                            <CheckCircle size={18} color={form.completada ? "#6fbf8c" : "#8a7a9c"} />
                                            <span className="fw-semibold">Marcar como aplicada</span>
                                        </span>
                                    }
                                    checked={form.completada}
                                    onChange={handleChange("completada")}
                                    disabled={guardando}
                                />

                                <small className="text-muted d-block ms-4 mt-1" style={{ fontSize: "0.75rem" }}>
                                    {form.completada
                                        ? "Esta vacuna se marcará como completada"
                                        : "Marcá esta opción cuando la vacuna haya sido aplicada"}
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
                        ) : isEdit ? "Actualizar" : "Crear vacuna"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}