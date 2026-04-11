import React from "react";
import { Row, Col, Card, Badge, ProgressBar, Button } from "react-bootstrap";
import { Calendar, Syringe, Users, Clock, Plus, FileText } from "lucide-react";

export default function SeccionResumen({ citasProximas, vacunasPendientes, contactos, bitacora, vacunas, calcularSaludVacunas, onNuevoContacto, onNuevaCita, onNuevaVacuna, onNuevoHistorial }) {
    return (
        <>
            <Row className="g-3">
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100 border-primary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <Calendar size={32} className="text-primary" />
                                <Badge bg="primary">{citasProximas.length}</Badge>
                            </div>
                            <h6>Próximas Citas</h6>
                            {citasProximas.slice(0, 2).map(c => <div key={c.id} className="small text-muted">• {c.titulo} - {c.fecha_evento}</div>)}
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100 border-success">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <Syringe size={32} className="text-success" />
                                <Badge bg="warning">{vacunasPendientes.length}</Badge>
                            </div>
                            <h6>Vacunas</h6>
                            <ProgressBar now={calcularSaludVacunas()} label={`${calcularSaludVacunas()}%`} variant="success" />
                            <small className="text-muted mt-1 d-block">{vacunas.filter(v => v.completada).length} de {vacunas.length} completadas</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100 border-info">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <Users size={32} className="text-info" />
                                <Badge bg="info">{contactos.length}</Badge>
                            </div>
                            <h6>Contactos</h6>
                            <small className="text-muted">{contactos.filter(c => c.favorito).length} favoritos</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <Card className="h-100 border-secondary">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                                <Clock size={32} className="text-secondary" />
                                <Badge bg="secondary">{bitacora.length}</Badge>
                            </div>
                            <h6>Registros</h6>
                            <small className="text-muted">Bitácora general</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <h5 className="mb-3">Acciones Rápidas</h5>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button variant="success" onClick={onNuevoContacto}><Plus size={18} /> Contacto</Button>
                        <Button variant="primary" onClick={onNuevaCita}><Calendar size={18} /> Cita</Button>
                        <Button variant="warning" onClick={onNuevaVacuna}><Syringe size={18} /> Vacuna</Button>
                        <Button variant="dark" onClick={onNuevoHistorial}><FileText size={18} /> Registro</Button>
                    </div>
                </Col>
            </Row>
        </>
    );
}