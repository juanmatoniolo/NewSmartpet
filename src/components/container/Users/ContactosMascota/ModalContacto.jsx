import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Badge, Spinner } from "react-bootstrap";
import { Users, Phone, AtSign, MapPin, Star, Briefcase, Tag } from "lucide-react";
import styles from "./ModalContacto.module.css";

export default function ModalContacto({ show, onHide, contactoEdit, mascotaId, mascotas = [], onSave }) {
    const [form, setForm] = useState({
        tipo: "veterinario",
        nombre: "",
        apellido: "",
        celular: "",
        email: "",
        direccion: "",
        favorito: false,
        categoria_personalizada: "",
        mascota_id: mascotaId || ""
    });
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});

    useEffect(() => {
        if (!show) return;

        if (contactoEdit) {
            setForm({
                tipo: contactoEdit.tipo || "veterinario",
                nombre: contactoEdit.nombre || "",
                apellido: contactoEdit.apellido || "",
                celular: contactoEdit.celular || "",
                email: contactoEdit.email || "",
                direccion: contactoEdit.direccion || "",
                favorito: contactoEdit.favorito || false,
                categoria_personalizada: contactoEdit.categoria_personalizada || "",
                mascota_id: contactoEdit.mascotaId || mascotaId || ""
            });
        } else {
            setForm({
                tipo: "veterinario",
                nombre: "",
                apellido: "",
                celular: "",
                email: "",
                direccion: "",
                favorito: false,
                categoria_personalizada: "",
                mascota_id: mascotaId || (mascotas.length === 1 ? mascotas[0].id : "")
            });
        }
        setErrores({});
    }, [contactoEdit, show, mascotaId, mascotas]);

    const validateForm = () => {
        const errors = {};
        if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio";
        if (form.tipo === "otro" && !form.categoria_personalizada.trim())
            errors.categoria_personalizada = "Ingresá una categoría personalizada";
        if (!form.mascota_id) errors.mascota_id = "Seleccioná una mascota";
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
        try {
            const ok = await onSave(form);
            if (ok) handleClose();
        } finally {
            setGuardando(false);
        }
    };

    const tipos = [
        { value: "veterinario", label: "🏥 Veterinario" },
        { value: "peluqueria", label: "✂️ Peluquería" },
        { value: "paseador", label: "🦮 Paseador" },
        { value: "petshop", label: "🏪 Pet Shop" },
        { value: "guarderia", label: "🏠 Guardería" },
        { value: "otro", label: "📌 Otro" }
    ];

    return (
        <Modal show={show} onHide={handleClose} size="lg" scrollable centered={false} backdrop={guardando ? "static" : true} keyboard={!guardando} dialogClassName={styles.modal}>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton={!guardando} className={styles.header}>
                    <Modal.Title className={styles.headerTitle}>
                        <div className={styles.iconWrapper}><Users size={24} style={{ color: "#cd7fa7" }} /></div>
                        <div className={styles.title}>
                            <h4>{contactoEdit ? "Editar contacto" : "Nuevo contacto"}</h4>
                            <small>Veterinarios, peluquerías, paseadores y más</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={styles.body}>
                    <Row className="g-3 g-md-4">
                        {/* Tipo de contacto */}
                        <Col xs={12}>
                            <div className={styles.sectionTitle}><Briefcase size={16} /> Tipo de contacto</div>
                            <Form.Group>
                                <Form.Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className={styles.formControl} disabled={guardando}>
                                    {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </Form.Select>
                            </Form.Group>
                            {form.tipo === "otro" && (
                                <Form.Control type="text" className={`mt-2 ${styles.fullRounded}`} placeholder="Ej: Criador, Rescate, etc." value={form.categoria_personalizada} onChange={e => setForm({ ...form, categoria_personalizada: e.target.value })} isInvalid={!!errores.categoria_personalizada} disabled={guardando} />
                            )}
                        </Col>

                        {/* Datos básicos */}
                        <Col xs={12}>
                            <div className={styles.sectionTitle}><Tag size={16} /> Datos del contacto</div>
                        </Col>
                        <Col xs={12} md={6}>
                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}><Users size={16} /></InputGroup.Text>
                                <Form.Control type="text" placeholder="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={styles.formControl} isInvalid={!!errores.nombre} disabled={guardando} />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}><Users size={16} /></InputGroup.Text>
                                <Form.Control type="text" placeholder="Apellido" value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} className={styles.formControl} disabled={guardando} />
                            </InputGroup>
                        </Col>

                        <Col xs={12} md={6}>
                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}><Phone size={16} /></InputGroup.Text>
                                <Form.Control type="tel" placeholder="Teléfono / WhatsApp" value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} className={styles.formControl} disabled={guardando} />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}><AtSign size={16} /></InputGroup.Text>
                                <Form.Control type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={styles.formControl} disabled={guardando} />
                            </InputGroup>
                        </Col>
                        <Col xs={12}>
                            <InputGroup>
                                <InputGroup.Text className={styles.inputGroupText}><MapPin size={16} /></InputGroup.Text>
                                <Form.Control type="text" placeholder="Dirección" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className={styles.formControl} disabled={guardando} />
                            </InputGroup>
                        </Col>

                        {/* Mascota asociada */}
                        {!mascotaId && mascotas.length > 0 && (
                            <Col xs={12}>
                                <div className={styles.sectionTitle}><Tag size={16} /> Asociar a mascota</div>
                                <Form.Select value={form.mascota_id} onChange={e => setForm({ ...form, mascota_id: e.target.value })} className={styles.formControl} isInvalid={!!errores.mascota_id} disabled={guardando}>
                                    <option value="">Seleccionar mascota</option>
                                    {mascotas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                                </Form.Select>
                            </Col>
                        )}

                        {/* Favorito */}
                        <Col xs={12}>
                            <div className={styles.reminderBox}>
                                <Form.Check type="checkbox" id="favorito-check" label={<span className="d-flex align-items-center gap-2 flex-wrap"><Star size={18} color={form.favorito ? "#cd7fa7" : "#8a7a9c"} /><span className="fw-semibold">Marcar como favorito</span><Badge bg="info" style={{ backgroundColor: "#7f9bc2" }}>Destacado</Badge></span>} checked={form.favorito} onChange={e => setForm({ ...form, favorito: e.target.checked })} disabled={guardando} />
                                <small className="text-muted d-block ms-4 mt-1">Los contactos favoritos aparecen primero en la lista</small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer className={styles.footer}>
                    <Button variant="outline-secondary" className={styles.cancelBtn} onClick={handleClose} disabled={guardando}>Cancelar</Button>
                    <Button type="submit" className={styles.saveBtn} disabled={guardando}>
                        {guardando ? <><Spinner animation="border" size="sm" className="me-2" />Guardando...</> : (contactoEdit ? "Actualizar" : "Crear contacto")}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}