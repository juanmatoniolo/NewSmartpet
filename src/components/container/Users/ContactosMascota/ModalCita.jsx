import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalCita({ show, onHide, citaEdit, contactos, mascotaId, onSave }) {
    const [form, setForm] = useState({ id_contacto: "", fecha_evento: "", proxima_fecha: "", titulo: "", nota: "", recordatorio: false });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (citaEdit) {
            setForm({
                id_contacto: citaEdit.id_contacto?.toString() || "",
                fecha_evento: citaEdit.fecha_evento || "",
                proxima_fecha: citaEdit.proxima_fecha || "",
                titulo: citaEdit.titulo || "",
                nota: citaEdit.nota || "",
                recordatorio: citaEdit.recordatorio || false
            });
        } else {
            setForm({ id_contacto: "", fecha_evento: "", proxima_fecha: "", titulo: "", nota: "", recordatorio: false });
        }
    }, [citaEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.titulo.trim() || !form.nota.trim()) return;
        setGuardando(true);
        const ok = await onSave(form);
        setGuardando(false);
        if (ok) onHide();
    };

    const getIconoTipo = (tipo) => ({ veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪", guarderia: "🏠" }[tipo] || "📋");
    const renderTipo = (c) => c.tipo === "otro" ? (c.categoria_personalizada || "Otro") : ({ veterinario: "Veterinario", peluqueria: "Peluquería", paseador: "Paseador", petshop: "Pet Shop", guarderia: "Guardería" }[c.tipo] || "Sin tipo");

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton><Modal.Title>{citaEdit ? "Editar" : "Nueva"} Cita</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}><Form.Label>Contacto relacionado</Form.Label><Form.Select value={form.id_contacto} onChange={e => setForm({ ...form, id_contacto: e.target.value })}><option value="">Sin contacto</option>{contactos.map(c => <option key={c.id} value={c.id}>{getIconoTipo(c.tipo)} {c.nombre} {c.apellido} - {renderTipo(c)}</option>)}</Form.Select></Col>
                        <Col xs={12} md={6}><Form.Label>Fecha de la cita *</Form.Label><Form.Control type="date" value={form.fecha_evento} onChange={e => setForm({ ...form, fecha_evento: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Próxima cita</Form.Label><Form.Control type="date" value={form.proxima_fecha} onChange={e => setForm({ ...form, proxima_fecha: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Título *</Form.Label><Form.Control value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Detalle *</Form.Label><Form.Control as="textarea" rows={4} value={form.nota} onChange={e => setForm({ ...form, nota: e.target.value })} /></Col>
                        <Col xs={12}><Form.Check type="checkbox" label="🔔 Activar recordatorio" checked={form.recordatorio} onChange={e => setForm({ ...form, recordatorio: e.target.checked })} /></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button type="submit" variant="primary" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}