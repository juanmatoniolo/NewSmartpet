import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalContacto({ show, onHide, contactoEdit, onSave }) {
    const [form, setForm] = useState({
        tipo: "veterinario", categoria_personalizada: "", nombre: "", apellido: "", celular: "", telefono_fijo: "",
        direccion: "", horarios: "", dias_atencion: "", notas: "", favorito: false
    });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (contactoEdit) {
            setForm({
                tipo: contactoEdit.tipo || "veterinario",
                categoria_personalizada: contactoEdit.categoria_personalizada || "",
                nombre: contactoEdit.nombre || "",
                apellido: contactoEdit.apellido || "",
                celular: contactoEdit.celular || "",
                telefono_fijo: contactoEdit.telefono_fijo || "",
                direccion: contactoEdit.direccion || "",
                horarios: contactoEdit.horarios || "",
                dias_atencion: contactoEdit.dias_atencion || "",
                notas: contactoEdit.notas || "",
                favorito: contactoEdit.favorito || false
            });
        } else {
            setForm({ tipo: "veterinario", categoria_personalizada: "", nombre: "", apellido: "", celular: "", telefono_fijo: "", direccion: "", horarios: "", dias_atencion: "", notas: "", favorito: false });
        }
    }, [contactoEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;
        setGuardando(true);
        const ok = await onSave(form);
        setGuardando(false);
        if (ok) onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton><Modal.Title>{contactoEdit ? "Editar" : "Nuevo"} Contacto</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12} md={6}><Form.Label>Tipo *</Form.Label><Form.Select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}><option value="veterinario">🏥 Veterinario</option><option value="peluqueria">✂️ Peluquería</option><option value="paseador">🦮 Paseador</option><option value="petshop">🏪 Pet Shop</option><option value="guarderia">🏠 Guardería</option><option value="otro">📋 Otro</option></Form.Select></Col>
                        {form.tipo === "otro" && <Col xs={12} md={6}><Form.Label>Categoría personalizada *</Form.Label><Form.Control value={form.categoria_personalizada} onChange={e => setForm({ ...form, categoria_personalizada: e.target.value })} placeholder="Ej: Adiestrador" /></Col>}
                        <Col xs={12} md={6}><Form.Label>Nombre *</Form.Label><Form.Control value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Apellido</Form.Label><Form.Control value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Celular</Form.Label><Form.Control value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Teléfono fijo</Form.Label><Form.Control value={form.telefono_fijo} onChange={e => setForm({ ...form, telefono_fijo: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Dirección</Form.Label><Form.Control value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Días de atención</Form.Label><Form.Control value={form.dias_atencion} onChange={e => setForm({ ...form, dias_atencion: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Horarios</Form.Label><Form.Control value={form.horarios} onChange={e => setForm({ ...form, horarios: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Notas</Form.Label><Form.Control as="textarea" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></Col>
                        <Col xs={12}><Form.Check type="checkbox" label="⭐ Marcar como favorito" checked={form.favorito} onChange={e => setForm({ ...form, favorito: e.target.checked })} /></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button type="submit" variant="success" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}