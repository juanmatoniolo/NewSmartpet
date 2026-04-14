import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, Badge } from "react-bootstrap";
import { Syringe, Calendar, FileText, Package, Hash, User, CheckCircle } from "lucide-react";

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
        setGuardando(false);
        if (ok) onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton style={{ borderBottom: '2px solid var(--border-light)', background: 'linear-gradient(135deg, var(--light-bg) 0%, white 100%)' }}>
                    <Modal.Title className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded-circle" style={{ backgroundColor: 'rgba(155, 142, 194, 0.15)' }}>
                            <Syringe size={24} style={{ color: 'var(--success-color)' }} />
                        </div>
                        <div>
                            <h5 className="mb-0">{vacunaEdit ? "Editar" : "Nueva"} Vacuna</h5>
                            <small className="text-muted">Registra el plan de vacunación</small>
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 py-4">
                    <Row className="g-3">
                        <Col xs={12}>
                            <h6 className="text-muted mb-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                💉 Vacuna
                            </h6>
                            <Form.Label className="fw-semibold">Nombre de la vacuna *</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <Syringe size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    value={form.nombre}
                                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Ej: Antirrábica, Óctuple, Sextuple"
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <h6 className="text-muted mb-3 mt-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                📅 Fechas
                            </h6>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Fecha de aplicación</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <Calendar size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={form.fecha_aplicacion}
                                    onChange={e => setForm({ ...form, fecha_aplicacion: e.target.value })}
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Próxima dosis</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <Calendar size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    type="date"
                                    value={form.proxima_dosis}
                                    onChange={e => setForm({ ...form, proxima_dosis: e.target.value })}
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                            <small className="text-muted">Fecha estimada para refuerzo</small>
                        </Col>

                        <Col xs={12}>
                            <h6 className="text-muted mb-3 mt-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                📦 Producto
                            </h6>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Laboratorio</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <Package size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    value={form.laboratorio}
                                    onChange={e => setForm({ ...form, laboratorio: e.target.value })}
                                    placeholder="Ej: Laboratorio Richmond"
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Lote</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <Hash size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    value={form.lote}
                                    onChange={e => setForm({ ...form, lote: e.target.value })}
                                    placeholder="Número de lote"
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>

                        <Col xs={12}>
                            <h6 className="text-muted mb-3 mt-2" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                📝 Información Adicional
                            </h6>
                        </Col>
                        <Col xs={12}>
                            <Form.Label className="fw-semibold">Veterinario que la aplicó</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)' }}>
                                    <User size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    value={form.veterinario}
                                    onChange={e => setForm({ ...form, veterinario: e.target.value })}
                                    placeholder="Nombre del profesional"
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12}>
                            <Form.Label className="fw-semibold">Notas</Form.Label>
                            <InputGroup>
                                <InputGroup.Text style={{ backgroundColor: 'var(--light-bg)', border: '1px solid var(--border-light)', alignItems: 'flex-start', paddingTop: '0.6rem' }}>
                                    <FileText size={16} />
                                </InputGroup.Text>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={form.notas}
                                    onChange={e => setForm({ ...form, notas: e.target.value })}
                                    placeholder="Reacciones, observaciones..."
                                    style={{ borderRadius: '0 0.5rem 0.5rem 0' }}
                                />
                            </InputGroup>
                        </Col>
                        <Col xs={12}>
                            <div className="p-3 rounded" style={{ backgroundColor: form.completada ? 'rgba(155, 142, 194, 0.1)' : 'var(--light-bg)', border: `2px dashed ${form.completada ? 'var(--success-color)' : 'var(--border-light)'}` }}>
                                <Form.Check
                                    type="checkbox"
                                    id="completada-check"
                                    label={
                                        <span className="d-flex align-items-center gap-2">
                                            <CheckCircle size={18} color={form.completada ? "var(--success-color)" : "var(--text-muted)"} />
                                            <span className="fw-semibold">Marcar como aplicada</span>
                                        </span>
                                    }
                                    checked={form.completada}
                                    onChange={e => setForm({ ...form, completada: e.target.checked })}
                                />
                                <small className="text-muted ms-4">
                                    {form.completada ? "Esta vacuna se marcará como completada" : "Marca esta opción cuando la vacuna haya sido aplicada"}
                                </small>
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '2px solid var(--border-light)', padding: '1.25rem' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={onHide}
                        style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="warning"
                        disabled={guardando}
                        style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem', minWidth: '120px' }}
                    >
                        {guardando ? "Guardando..." : vacunaEdit ? "Actualizar" : "Crear Vacuna"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}