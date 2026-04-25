import React from "react";
import { Button } from "react-bootstrap";
import {
    Phone,
    MapPin,
    Clock,
    Star,
    Edit2,
    Trash2,
    Mail,
    Building2
} from "lucide-react";
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
        if (e.target.closest("button")) return;
        onEditar(contacto);
    };

    const imagenLocal =
        contacto.imagen ||
        contacto.logo ||
        contacto.foto ||
        contacto.imagen_url ||
        contacto.logo_url ||
        "";

    const nombreCompleto = `${contacto.nombre || ""} ${contacto.apellido || ""}`.trim();

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
            <div className={styles.media}>
                {imagenLocal ? (
                    <img
                        src={imagenLocal}
                        alt={nombreCompleto || "Imagen del local"}
                        className={styles.mediaImage}
                    />
                ) : (
                    <div className={styles.mediaPlaceholder}>
                        <span>{getIconoTipo(contacto.tipo)}</span>
                    </div>
                )}

                <div className={styles.mediaOverlay} />

                <span className={styles.typeBadge}>
                    {renderTipo(contacto)}
                </span>

                <button
                    type="button"
                    className={`${styles.favoriteStar} ${contacto.favorito ? styles.favoriteStarActive : ""}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorito(contacto);
                    }}
                    aria-label={contacto.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                    title={contacto.favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                >
                    <Star size={18} fill={contacto.favorito ? "currentColor" : "none"} />
                </button>
            </div>

            <div className={styles.body}>
                <div className={styles.header}>
                    <div className={styles.title}>
                        <h5 className={styles.name}>
                            {nombreCompleto || "Contacto sin nombre"}
                        </h5>

                        {contacto.direccion ? (
                            <p className={styles.locationPreview}>
                                <MapPin size={14} />
                                <span>{contacto.direccion}</span>
                            </p>
                        ) : (
                            <p className={styles.locationPreview}>
                                <Building2 size={14} />
                                <span>Proveedor registrado</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className={styles.infoBlock}>
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
                            <Phone size={16} />
                            <span>{contacto.telefono_fijo}</span>
                        </div>
                    )}

                    {contacto.email && (
                        <div className={styles.infoRow}>
                            <Mail size={16} />
                            <span>{contacto.email}</span>
                        </div>
                    )}

                    {contacto.direccion && (
                        <div className={styles.infoRow}>
                            <MapPin size={16} />
                            <span>{contacto.direccion}</span>
                        </div>
                    )}

                    {(contacto.horarios || contacto.dias_atencion) && (
                        <div className={styles.infoRow}>
                            <Clock size={16} />
                            <span>
                                {contacto.horarios}
                                {contacto.horarios && contacto.dias_atencion ? " · " : ""}
                                {contacto.dias_atencion}
                            </span>
                        </div>
                    )}
                </div>

                {(contacto.ultimaCita?.fecha_evento || contacto.proximaCita?.fecha_evento) && (
                    <div className={styles.citasInfo}>
                        {contacto.ultimaCita?.fecha_evento && (
                            <div className={styles.citaLineMuted}>
                                📅 Última visita:{" "}
                                {new Date(contacto.ultimaCita.fecha_evento).toLocaleDateString("es-AR")}
                            </div>
                        )}

                        {contacto.proximaCita?.fecha_evento && (
                            <div className={styles.citaLineSuccess}>
                                ⏰ Próxima cita:{" "}
                                {new Date(contacto.proximaCita.fecha_evento).toLocaleDateString("es-AR")}
                            </div>
                        )}
                    </div>
                )}

                {contacto.notas && (
                    <div className={styles.notas}>
                        <strong>Notas</strong>
                        <p>{contacto.notas}</p>
                    </div>
                )}

                <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                    <Button
                        className={styles.actionBtn}
                        onClick={() => onEditar(contacto)}
                    >
                        <Edit2 size={16} />
                        <span>Editar</span>
                    </Button>

                    <Button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => onEliminar(contacto.id, contacto.nombre)}
                    >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}