import React from "react";
import { Card, Badge, Button } from "react-bootstrap";
import { Phone, MapPin, Clock, Star, Edit2, Trash2 } from "lucide-react";

export default function TarjetaContacto({ contacto, onToggleFavorito, onEditar, onEliminar, onWhatsApp, renderTipo, getIconoTipo }) {
    // Manejador para clic en la tarjeta (excepto botones)
    const handleCardClick = (e) => {
        // Evitar que el clic en la tarjeta se propague si viene de un botón
        // Pero como los botones tienen su propio manejador, no hay conflicto.
        // Llamamos a onEditar solo si el objetivo NO es un botón ni sus hijos.
        const target = e.target;
        if (target.closest('.btn')) return; // Si se hizo clic dentro de un botón, no ejecutar edición
        onEditar();
    };

    return (
        <Card
            className="h-100 shadow-sm position-relative tarjeta-contacto-clickeable"
            onClick={handleCardClick}
            style={{ cursor: 'pointer' }}
        >
            {contacto.favorito && (
                <div className="position-absolute top-0 end-0 p-2">
                    <Star size={20} fill="gold" color="gold" />
                </div>
            )}
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                            <span style={{ fontSize: "1.5rem" }}>{getIconoTipo(contacto.tipo)}</span>
                            <Card.Title className="mb-0 fs-6">{contacto.nombre} {contacto.apellido || ""}</Card.Title>
                        </div>
                        <Badge bg="info" text="dark" className="small">{renderTipo(contacto)}</Badge>
                    </div>
                </div>
                {contacto.celular && (
                    <div className="mb-2">
                        <Phone size={14} className="me-1" /><small>{contacto.celular}</small>
                        <Button
                            variant="outline-success"
                            size="sm"
                            className="ms-2 px-2 py-0"
                            onClick={(e) => { e.stopPropagation(); onWhatsApp(contacto.celular, contacto.nombre); }}
                        >
                            WhatsApp
                        </Button>
                    </div>
                )}
                {contacto.telefono_fijo && <div className="mb-2 small"><Phone size={14} className="me-1" />{contacto.telefono_fijo}</div>}
                {contacto.direccion && <div className="mb-2 small"><MapPin size={14} className="me-1" />{contacto.direccion}</div>}
                {contacto.horarios && <div className="mb-2 small"><Clock size={14} className="me-1" />{contacto.horarios}{contacto.dias_atencion && ` - ${contacto.dias_atencion}`}</div>}
                {contacto.ultimaCita && <div className="small text-muted mt-2">📅 Última visita: {new Date(contacto.ultimaCita.fecha_evento).toLocaleDateString('es-AR')}</div>}
                {contacto.proximaCita && <div className="small text-success">⏰ Próxima cita: {new Date(contacto.proximaCita.fecha_evento).toLocaleDateString('es-AR')}</div>}
                {contacto.notas && <div className="mt-2 p-2 bg-light rounded small"><strong>Notas:</strong> {contacto.notas}</div>}
                <div className="d-flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant={contacto.favorito ? "warning" : "outline-warning"}
                        size="sm"
                        onClick={() => onToggleFavorito(contacto)}
                    >
                        <Star size={16} />
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={onEditar}
                    >
                        <Edit2 size={16} />
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => onEliminar(contacto.id, contacto.nombre)}
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );
}