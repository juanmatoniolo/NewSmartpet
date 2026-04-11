import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalHistorial({ show, onHide, historialEdit, contactos, mascotaId, onSave }) {
    const [form, setForm] = useState({ id_contacto: "", fecha_evento: "", titulo: "", nota: "" });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (historialEdit) {
            setForm({
                id_contacto: historialEdit.id_contacto?.toString() || "",
                fecha_evento: historialEdit.fecha_evento || "",
                titulo: historialEdit.titulo || "",
                nota: historialEdit.nota || ""
            });
        } else {
            setForm({ id_contacto: "", fecha_evento: "", titulo: "", nota: "" });
        }
    }, [historialEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.nota.trim()) return;
        setGuardando(true);
        const ok = await onSave(form);
        setGuardando(false);
        if (ok) onHide();
    };

    const getIconoTipo = (tipo) => ({ veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪", guarderia: "🏠" }[tipo] || "📋");

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton><Modal.Title>{historialEdit ? "Editar" : "Nuevo"} Registro</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}><Form.Label>Contacto relacionado</Form.Label><Form.Select value={form.id_contacto} onChange={e => setForm({ ...form, id_contacto: e.target.value })}><option value="">Sin contacto</option>{contactos.map(c => <option key={c.id} value={c.id}>{getIconoTipo(c.tipo)} {c.nombre} {c.apellido}</option>)}</Form.Select></Col>
                        <Col xs={12}><Form.Label>Fecha</Form.Label><Form.Control type="date" value={form.fecha_evento} onChange={e => setForm({ ...form, fecha_evento: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Título *</Form.Label><Form.Control value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Nota *</Form.Label><Form.Control as="textarea" rows={5} value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} /></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button type="submit" variant="dark" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}