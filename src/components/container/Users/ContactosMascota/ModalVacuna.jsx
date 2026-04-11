import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

export default function ModalVacuna({ show, onHide, vacunaEdit, mascotaId, onSave }) {
    const [form, setForm] = useState({ nombre: "", fecha_aplicacion: "", proxima_dosis: "", laboratorio: "", lote: "", veterinario: "", notas: "", completada: false });
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
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
            setForm({ nombre: "", fecha_aplicacion: "", proxima_dosis: "", laboratorio: "", lote: "", veterinario: "", notas: "", completada: false });
        }
    }, [vacunaEdit, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.nombre.trim()) return;
        setGuardando(true);
        const payload = { titulo: form.nombre, fecha_evento: form.fecha_aplicacion, proxima_fecha: form.proxima_dosis, nota: form.veterinario, laboratorio: form.laboratorio, lote: form.lote, notas: form.notas, completada: form.completada };
        const ok = await onSave(payload);
        setGuardando(false);
        if (ok) onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton><Modal.Title>{vacunaEdit ? "Editar" : "Nueva"} Vacuna</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        <Col xs={12}><Form.Label>Nombre de la vacuna *</Form.Label><Form.Control value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Antirrábica" /></Col>
                        <Col xs={12} md={6}><Form.Label>Fecha de aplicación</Form.Label><Form.Control type="date" value={form.fecha_aplicacion} onChange={e => setForm({ ...form, fecha_aplicacion: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Próxima dosis</Form.Label><Form.Control type="date" value={form.proxima_dosis} onChange={e => setForm({ ...form, proxima_dosis: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Laboratorio</Form.Label><Form.Control value={form.laboratorio} onChange={e => setForm({ ...form, laboratorio: e.target.value })} /></Col>
                        <Col xs={12} md={6}><Form.Label>Lote</Form.Label><Form.Control value={form.lote} onChange={e => setForm({ ...form, lote: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Veterinario que la aplicó</Form.Label><Form.Control value={form.veterinario} onChange={e => setForm({ ...form, veterinario: e.target.value })} /></Col>
                        <Col xs={12}><Form.Label>Notas</Form.Label><Form.Control as="textarea" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} /></Col>
                        <Col xs={12}><Form.Check type="checkbox" label="✅ Marcar como completada" checked={form.completada} onChange={e => setForm({ ...form, completada: e.target.checked })} /></Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                    <Button type="submit" variant="warning" disabled={guardando}>{guardando ? "Guardando..." : "Guardar"}</Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}