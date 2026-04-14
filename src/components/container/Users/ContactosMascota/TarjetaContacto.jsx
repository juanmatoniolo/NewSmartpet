import React from "react";
import { Badge, Button } from "react-bootstrap";
import { Phone, MapPin, Clock, Star, Edit2, Trash2 } from "lucide-react";
import "../ContactosMascota.css";

export default function TarjetaContacto({
    contacto,
    onToggleFavorito,
    onEditar,
    onEliminar,
    onWhatsApp,
    renderTipo,
    getIconoTipo
}) {
    const handleCardClick = (e) => {
        // Evita que el click en botones internos dispare el evento del card
        if (e.target.closest('.btn')) return;
        onEditar(contacto);
    };

    return (
        <div
            className="tarjeta-contacto card h-100 shadow-sm"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onEditar(contacto);
                }
            }}
        >
            {/* Indicador de favorito (estrella fija en esquina) */}
            {contacto.favorito && (
                <div className="position-absolute top-0 end-0 p-2">
                    <Star size={20} fill="gold" color="gold" />
                </div>
            )}

            <div className="card-body p-3 p-md-4">
                {/* Cabecera: icono + nombre + tipo */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="contacto-icono fs-3">{getIconoTipo(contacto.tipo)}</span>
                            <h5 className="mb-0 fw-semibold">
                                {contacto.nombre} {contacto.apellido || ""}
                            </h5>
                        </div>
                        <Badge bg="info" text="dark" className="py-1 px-2 rounded-pill small">
                            {renderTipo(contacto)}
                        </Badge>
                    </div>
                </div>

                {/* Información de contacto */}
                <div className="contacto-info mt-3">
                    {contacto.celular && (
                        <div className="d-flex align-items-center mb-3 flex-wrap gap-2">
                            <div className="d-flex align-items-center">
                                <Phone size={16} className="me-2 text-muted flex-shrink-0" />
                                <span className="small">{contacto.celular}</span>
                            </div>
                            <Button
                                variant="outline-success"
                                size="sm"
                                className="btn-whatsapp px-3 py-1 rounded-pill"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onWhatsApp(contacto.celular, contacto.nombre);
                                }}
                            >
                                WhatsApp
                            </Button>
                        </div>
                    )}

                    {contacto.telefono_fijo && (
                        <div className="d-flex align-items-center mb-2">
                            <Phone size={14} className="me-2 text-muted flex-shrink-0" />
                            <span className="small">{contacto.telefono_fijo}</span>
                        </div>
                    )}

                    {contacto.direccion && (
                        <div className="d-flex align-items-start mb-2">
                            <MapPin size={14} className="me-2 text-muted flex-shrink-0 mt-1" />
                            <span className="small">{contacto.direccion}</span>
                        </div>
                    )}

                    {contacto.horarios && (
                        <div className="d-flex align-items-start mb-2">
                            <Clock size={14} className="me-2 text-muted flex-shrink-0 mt-1" />
                            <span className="small">
                                {contacto.horarios}
                                {contacto.dias_atencion && ` - ${contacto.dias_atencion}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Fechas de citas */}
                <div className="citas-info mt-3 small">
                    {contacto.ultimaCita?.fecha_evento && (
                        <div className="text-muted mb-1">
                            📅 Última visita: {new Date(contacto.ultimaCita.fecha_evento).toLocaleDateString("es-AR")}
                        </div>
                    )}
                    {contacto.proximaCita?.fecha_evento && (
                        <div className="text-success fw-medium">
                            ⏰ Próxima cita: {new Date(contacto.proximaCita.fecha_evento).toLocaleDateString("es-AR")}
                        </div>
                    )}
                </div>

                {/* Notas */}
                {contacto.notas && (
                    <div className="notas mt-3 p-2 bg-light rounded small">
                        <strong className="d-block mb-1">Notas:</strong>
                        {contacto.notas}
                    </div>
                )}

                {/* Botones de acción - área táctil ampliada */}
                <div className="acciones-botones d-flex gap-3 mt-4 pt-2 border-top" onClick={(e) => e.stopPropagation()}>
                    <Button
                        variant={contacto.favorito ? "warning" : "outline-warning"}
                        size="sm"
                        className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                        onClick={() => onToggleFavorito(contacto)}
                        aria-label={contacto.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                    >
                        <Star size={16} />
                        <span className="d-none d-sm-inline">Favorito</span>
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                        onClick={() => onEditar(contacto)}
                        aria-label="Editar contacto"
                    >
                        <Edit2 size={16} />
                        <span className="d-none d-sm-inline">Editar</span>
                    </Button>
                    <Button
                        variant="outline-danger"
                        size="sm"
                        className="flex-grow-1 py-2 rounded-pill d-flex align-items-center justify-content-center gap-2"
                        onClick={() => onEliminar(contacto.id, contacto.nombre)}
                        aria-label="Eliminar contacto"
                    >
                        <Trash2 size={16} />
                        <span className="d-none d-sm-inline">Eliminar</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}