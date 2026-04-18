import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Spinner } from "react-bootstrap";
import { FileText, Calendar, User } from "lucide-react";
import styles from "./ModalBase.module.css";

export default function ModalHistorial({ show, onHide, historialEdit, contactos = [], onSave }) {
    const [form, setForm] = useState({
        id_contacto: "",
        fecha_evento: "",
        titulo: "",
        nota: ""
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (!show) return;

        if (historialEdit) {
            setForm({
                id_contacto: historialEdit.id_contacto?.toString() || "",
                fecha_evento: historialEdit.fecha_evento || "",
                titulo: historialEdit.titulo || "",
                nota: historialEdit.nota || ""
            });
        } else {
            setForm({
                id_contacto: "",
                fecha_evento: "",
                titulo: "",
                nota: ""
            });
        }

        setErrores({});
    }, [historialEdit, show]);

    const validateForm = () => {
        const errors = {};
        if (!form.titulo.trim()) errors.titulo = "El título es obligatorio";
        if (!form.nota.trim()) errors.nota = "El detalle es obligatorio";
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

        setGuardando(true);
        const ok = await onSave(form);
        setGuardando(false);

        if (ok) handleClose();
    };

    const getIconoTipo = (tipo) => {
        const mapa = { veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪", guarderia: "🏠" };
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
                            <FileText size={26} style={{ color: "#64748b" }} strokeWidth={2.5} />
                        </div>
                        <div className={styles.title}>
                            <h4>{historialEdit ? "Editar" : "Nuevo"} Registro</h4>
                            <small>Agrega una entrada a la bitácora de salud</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body className={styles.body}>
                    <Row className="g-4">
                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>👤</span> Contacto (opcional)
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
                        </Col>

                        <Col xs={12}>
                            <div className={styles.sectionTitle}>
                                <span>📅</span> Fecha
                            </div>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">Fecha del evento</Form.Label>
                                <InputGroup>
                                    <InputGroup.Text className={styles.inputGroupText}>
                                        <Calendar size={16} />
                                    </InputGroup.Text>
                                    <Form.Control
                                        type="date"
                                        value={form.fecha_evento}
                                        onChange={(e) => setForm({ ...form, fecha_evento: e.target.value })}
                                        className={styles.formControl}
                                        disabled={guardando}
                                    />
                                </InputGroup>
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
                                    placeholder="Ej: Control de peso, Cambio de alimento..."
                                    className={styles.fullRounded}
                                    isInvalid={!!errores.titulo}
                                    disabled={guardando}
                                />
                                <Form.Control.Feedback type="invalid">{errores.titulo}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label className="fw-semibold mb-2">
                                    Nota <span className="text-danger">*</span>
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
                                        onChange={(e) => setForm({ ...form, nota: e.target.value })}
                                        placeholder="Describe el evento, observaciones, resultados..."
                                        className={styles.formControl}
                                        style={{ resize: "none" }}
                                        isInvalid={!!errores.nota}
                                        disabled={guardando}
                                    />
                                    <Form.Control.Feedback type="invalid">{errores.nota}</Form.Control.Feedback>
                                </InputGroup>
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
                        ) : historialEdit ? "Actualizar" : "Crear Registro"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}