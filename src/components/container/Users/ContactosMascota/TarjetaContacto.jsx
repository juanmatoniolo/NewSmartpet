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
    Building2,
    MessageCircle
} from "lucide-react";
import styles from "./TarjetaContacto.module.css";

const isTrue = (value) => value === true || value === 1 || value === "1";

const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

export default function TarjetaContacto({
    contacto = {},
    onToggleFavorito,
    onEditar,
    onEliminar,
    onWhatsApp,
    renderTipo,
    getIconoTipo
}) {
    const nombreCompleto = `${contacto.nombre || ""} ${contacto.apellido || ""}`.trim();
    const nombreVisible = nombreCompleto || contacto.nombre_local || "Contacto sin nombre";

    const tipoVisible =
        typeof renderTipo === "function"
            ? renderTipo(contacto)
            : contacto.tipo || contacto.categoria_personalizada || "Contacto";

    const iconoVisible =
        typeof getIconoTipo === "function"
            ? getIconoTipo(contacto.tipo)
            : "📋";

    const imagenLocal =
        contacto.imagen ||
        contacto.logo ||
        contacto.foto ||
        contacto.imagen_url ||
        contacto.logo_url ||
        "";

    const favorito = isTrue(contacto.favorito);

    const ultimaCita = contacto.ultimaCita?.fecha_evento || contacto.ultima_cita || "";
    const proximaCita = contacto.proximaCita?.fecha_evento || contacto.proxima_cita || "";

    const handleCardClick = (e) => {
        if (e.target.closest("button, a")) return;
        if (typeof onEditar === "function") onEditar(contacto);
    };

    const handleKeyDown = (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;

        e.preventDefault();

        if (typeof onEditar === "function") onEditar(contacto);
    };

    const handleFavorite = (e) => {
        e.stopPropagation();

        if (typeof onToggleFavorito === "function") {
            onToggleFavorito(contacto);
        }
    };

    const handleWhatsApp = (e) => {
        e.stopPropagation();

        if (typeof onWhatsApp === "function") {
            onWhatsApp(contacto.celular || contacto.whatsapp, contacto.nombre || nombreVisible);
        }
    };

    const handleEditar = (e) => {
        e.stopPropagation();

        if (typeof onEditar === "function") {
            onEditar(contacto);
        }
    };

    const handleEliminar = (e) => {
        e.stopPropagation();

        if (typeof onEliminar === "function") {
            onEliminar(contacto.id, nombreVisible);
        }
    };

    return (
        <article
            className={styles.card}
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label={`Editar contacto ${nombreVisible}`}
        >
            <div className={styles.media}>
                {imagenLocal ? (
                    <img
                        src={imagenLocal}
                        alt={nombreVisible}
                        className={styles.mediaImage}
                        loading="lazy"
                        onError={(e) => {
                            e.currentTarget.style.display = "none";
                        }}
                    />
                ) : (
                    <div className={styles.mediaPlaceholder} aria-hidden="true">
                        <span>{iconoVisible}</span>
                    </div>
                )}

                <div className={styles.mediaOverlay} />

                <span className={styles.typeBadge}>
                    {iconoVisible} {tipoVisible}
                </span>

                <button
                    type="button"
                    className={`${styles.favoriteStar} ${favorito ? styles.favoriteStarActive : ""}`}
                    onClick={handleFavorite}
                    aria-label={favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                    title={favorito ? "Quitar de favoritos" : "Marcar como favorito"}
                >
                    <Star size={18} fill={favorito ? "currentColor" : "none"} />
                </button>
            </div>

            <div className={styles.body}>
                <header className={styles.header}>
                    <div className={styles.title}>
                        <h5 className={styles.name}>{nombreVisible}</h5>

                        <p className={styles.locationPreview}>
                            {contacto.direccion ? (
                                <>
                                    <MapPin size={14} />
                                    <span>{contacto.direccion}</span>
                                </>
                            ) : (
                                <>
                                    <Building2 size={14} />
                                    <span>Proveedor registrado</span>
                                </>
                            )}
                        </p>
                    </div>
                </header>

                <div className={styles.infoBlock}>
                    {contacto.celular && (
                        <div className={styles.infoRow}>
                            <Phone size={16} />
                            <span>{contacto.celular}</span>

                            <Button
                                type="button"
                                className={styles.whatsappBtn}
                                size="sm"
                                onClick={handleWhatsApp}
                            >
                                <MessageCircle size={14} />
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

                {(ultimaCita || proximaCita) && (
                    <div className={styles.citasInfo}>
                        {ultimaCita && (
                            <div className={styles.citaLineMuted}>
                                <span>📅 Última visita:</span>
                                <strong>{formatDate(ultimaCita)}</strong>
                            </div>
                        )}

                        {proximaCita && (
                            <div className={styles.citaLineSuccess}>
                                <span>⏰ Próxima cita:</span>
                                <strong>{formatDate(proximaCita)}</strong>
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

                <div className={styles.actions}>
                    <Button
                        type="button"
                        className={styles.actionBtn}
                        onClick={handleEditar}
                    >
                        <Edit2 size={16} />
                        <span>Editar</span>
                    </Button>

                    <Button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={handleEliminar}
                    >
                        <Trash2 size={16} />
                        <span>Eliminar</span>
                    </Button>
                </div>
            </div>
        </article>
    );
}