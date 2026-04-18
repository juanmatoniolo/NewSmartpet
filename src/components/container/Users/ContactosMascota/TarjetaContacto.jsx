import React from "react";
import { Badge, Button } from "react-bootstrap";
import { Phone, MapPin, Clock, Star, Edit2, Trash2 } from "lucide-react";
import styles from "./TarjetaContacto.module.css";

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
        if (e.target.closest('button')) return;
        onEditar(contacto);
    };

    return (
        <div
            className={`${styles.card} card h-100`}
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
            {contacto.favorito && (
                <div className={styles.favoriteStar}>
                    <Star size={20} fill="currentColor" />
                </div>
            )}

            <div className="card-body p-3 p-md-4">
                <div className={styles.header}>
                    <span className={styles.icon}>{getIconoTipo(contacto.tipo)}</span>
                    <div className={styles.title}>
                        <h5 className={styles.name}>
                            {contacto.nombre} {contacto.apellido || ""}
                        </h5>
                        <span className={styles.typeBadge}>{renderTipo(contacto)}</span>
                    </div>
                </div>

                <div className="mt-3">
                    {contacto.celular && (
                        <div className={styles.infoRow}>
                            <Phone size={16} />
                            <span>{contacto.celular}</span>
                            <Button
                                className={styles.whatsappBtn}
                                size="sm"
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
                        <div className={styles.infoRow}>
                            <Phone size={14} />
                            <span>{contacto.telefono_fijo}</span>
                        </div>
                    )}

                    {contacto.direccion && (
                        <div className={styles.infoRow}>
                            <MapPin size={14} />
                            <span>{contacto.direccion}</span>
                        </div>
                    )}

                    {contacto.horarios && (
                        <div className={styles.infoRow}>
                            <Clock size={14} />
                            <span>
                                {contacto.horarios}
                                {contacto.dias_atencion && ` - ${contacto.dias_atencion}`}
                            </span>
                        </div>
                    )}
                </div>

                <div className={styles.citasInfo}>
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

                {contacto.notas && (
                    <div className={styles.notas}>
                        <strong className="d-block mb-1">Notas:</strong>
                        {contacto.notas}
                    </div>
                )}

                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    <Button
                        className={styles.actionBtn}
                        onClick={() => onEditar(contacto)}
                    >
                        <Edit2 size={16} />
                        <span className="d-none d-sm-inline">Editar</span>
                    </Button>
                    <Button
                        className={styles.actionBtn}
                        onClick={() => onEliminar(contacto.id, contacto.nombre)}
                    >
                        <Trash2 size={16} />
                        <span className="d-none d-sm-inline">Eliminar</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}