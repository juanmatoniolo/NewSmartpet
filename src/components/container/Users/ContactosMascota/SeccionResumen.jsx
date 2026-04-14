import React from "react";
import { Row, Col, Card, Badge, ProgressBar, Button } from "react-bootstrap";
import { Calendar, Syringe, Users, Clock, Plus, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function SeccionResumen({
    citasProximas,
    vacunasPendientes,
    contactos,
    bitacora,
    vacunas,
    calcularSaludVacunas,
    onNuevoContacto,
    onNuevaCita,
    onNuevaVacuna,
    onNuevoHistorial
}) {
    // Helper para obtener la última cita (próxima o última registrada)
    const proximaCita = citasProximas.length > 0 ? citasProximas[0] : null;
    const vacunasCompletadas = vacunas.filter(v => v.completada).length;
    const porcentajeVacunas = calcularSaludVacunas();
    const ultimoRegistro = bitacora.length > 0 ? bitacora[bitacora.length - 1] : null;
    const favoritosCount = contactos.filter(c => c.favorito).length;

    // Función para formatear fecha
    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
    };

    return (
        <>
            <Row className="g-3 mb-4">
                {/* Tarjeta Próximas Citas */}
                <Col xs={12} md={6} lg={3}>
                    <Card
                        className="h-100 border-primary tarjeta-resumen"
                        style={{ cursor: "pointer" }}
                        onClick={onNuevaCita}
                    >
                        <Card.Body className="p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-primary-light">
                                        <Calendar size={24} className="text-primary" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 text-muted small">Próximas Citas</h6>
                                        <h3 className="mb-0 mt-1 fw-bold text-primary">{citasProximas.length}</h3>
                                    </div>
                                </div>
                            </div>
                            {proximaCita ? (
                                <div className="mt-3">
                                    <div className="d-flex align-items-center gap-2 p-2 rounded bg-light">
                                        <AlertCircle size={16} className="text-warning flex-shrink-0" />
                                        <div className="small">
                                            <strong>{proximaCita.titulo}</strong>
                                            <div className="text-muted">{formatDate(proximaCita.fecha_evento)}</div>
                                        </div>
                                    </div>
                                    {citasProximas.length > 1 && (
                                        <div className="text-center mt-2">
                                            <Badge bg="light" text="dark" className="small">+{citasProximas.length - 1} más</Badge>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center mt-3 py-2 text-muted small">Sin citas programadas</div>
                            )}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="w-100 mt-3 rounded-pill"
                                onClick={(e) => { e.stopPropagation(); onNuevaCita(); }}
                            >
                                <Plus size={16} className="me-1" /> Nueva Cita
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta Vacunas */}
                <Col xs={12} md={6} lg={3}>
                    <Card
                        className="h-100 border-success tarjeta-resumen"
                        style={{ cursor: "pointer" }}
                        onClick={onNuevaVacuna}
                    >
                        <Card.Body className="p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-success-light">
                                        <Syringe size={24} className="text-success" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 text-muted small">Vacunas</h6>
                                        <h3 className="mb-0 mt-1 fw-bold text-success">
                                            {vacunasCompletadas}/{vacunas.length}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                            {vacunas.length > 0 ? (
                                <div className="mt-3">
                                    <ProgressBar now={porcentajeVacunas} className="small-progress" variant="success" />
                                    <div className="d-flex justify-content-between mt-2 small">
                                        <span className="text-muted">{porcentajeVacunas}% completado</span>
                                        {vacunasPendientes.length > 0 && (
                                            <Badge bg="warning" text="dark">{vacunasPendientes.length} pendiente{vacunasPendientes.length !== 1 ? 's' : ''}</Badge>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center mt-3 py-2 text-muted small">Sin vacunas registradas</div>
                            )}
                            <Button
                                variant="outline-success"
                                size="sm"
                                className="w-100 mt-3 rounded-pill"
                                onClick={(e) => { e.stopPropagation(); onNuevaVacuna(); }}
                            >
                                <Plus size={16} className="me-1" /> Nueva Vacuna
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta Contactos */}
                <Col xs={12} md={6} lg={3}>
                    <Card
                        className="h-100 border-info tarjeta-resumen"
                        style={{ cursor: "pointer" }}
                        onClick={onNuevoContacto}
                    >
                        <Card.Body className="p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-info-light">
                                        <Users size={24} className="text-info" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 text-muted small">Contactos</h6>
                                        <h3 className="mb-0 mt-1 fw-bold text-info">{contactos.length}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="d-flex justify-content-between align-items-center mb-2 small">
                                    <span className="text-muted">⭐ Favoritos</span>
                                    <Badge bg="light" text="dark">{favoritosCount}</Badge>
                                </div>
                                <div className="d-flex flex-wrap gap-1">
                                    {['veterinario', 'peluqueria', 'paseador', 'petshop'].map(tipo => {
                                        const cantidad = contactos.filter(c => c.tipo === tipo).length;
                                        if (cantidad === 0) return null;
                                        const icono = { veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪" }[tipo];
                                        return (
                                            <Badge key={tipo} bg="light" text="dark" className="small">
                                                {icono} {cantidad}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>
                            <Button
                                variant="outline-info"
                                size="sm"
                                className="w-100 mt-3 rounded-pill"
                                onClick={(e) => { e.stopPropagation(); onNuevoContacto(); }}
                            >
                                <Plus size={16} className="me-1" /> Nuevo Contacto
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Tarjeta Bitácora */}
                <Col xs={12} md={6} lg={3}>
                    <Card
                        className="h-100 border-secondary tarjeta-resumen"
                        style={{ cursor: "pointer" }}
                        onClick={onNuevoHistorial}
                    >
                        <Card.Body className="p-3 p-md-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <div className="icon-circle bg-dark-light">
                                        <FileText size={24} className="text-dark" />
                                    </div>
                                    <div>
                                        <h6 className="mb-0 text-muted small">Bitácora</h6>
                                        <h3 className="mb-0 mt-1 fw-bold text-dark">{bitacora.length}</h3>
                                    </div>
                                </div>
                            </div>
                            {ultimoRegistro ? (
                                <div className="mt-3">
                                    <div className="p-2 rounded bg-light small">
                                        <Clock size={14} className="me-1 text-muted" />
                                        <strong>Último registro:</strong>
                                        <div className="text-muted mt-1 small">
                                            {ultimoRegistro.fecha_evento
                                                ? new Date(ultimoRegistro.fecha_evento).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : 'Sin fecha'
                                            }
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center mt-3 py-2 text-muted small">Sin registros</div>
                            )}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="w-100 mt-3 rounded-pill"
                                onClick={(e) => { e.stopPropagation(); onNuevoHistorial(); }}
                            >
                                <Plus size={16} className="me-1" /> Nuevo Registro
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
}