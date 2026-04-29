// components/MascotaDetailView.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./MascotaDetailView.css";
import { API_URL, getAdminHeaders, getMultipartAdminHeaders, resolveUploadUrl } from "../../config/adminApi";

const MascotaDetailView = ({
    mascota,
    sexoInfo,
    edadTexto,
    imagenSrc,
    getWhatsappLink,
    getPhoneLink,
    getInstagramLink,
    showActions = false,
    onDelete,
    onSave,        // función que recarga la mascota (GET) y actualiza el estado en el padre
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...mascota });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(imagenSrc);
    const [loading, setLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    // Sincronizar formData con la mascota actual (útil después de recargar)
    useEffect(() => {
        if (mascota) {
            setFormData({ ...mascota });
        }
    }, [mascota]);

    // Sincronizar vista previa de imagen con la URL actual
    useEffect(() => {
        setImagePreview(imagenSrc);
    }, [imagenSrc]);

    if (!mascota) return null;

    const getImageUrl = (src) => {
        const resolved = resolveUploadUrl(src);

        if (!resolved) return "/assets/smartpet-default.jpg";

        return `${resolved}${resolved.includes("?") ? "&" : "?"}_=${refreshKey}`;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);

        try {
            const updateData = { ...formData };

            delete updateData.urlImg;
            delete updateData.codigo_unico;

            updateData.id = mascota.id;

            await axios.post(
                API_URL,
                {
                    action: "updatemascota",
                    ...updateData,
                },
                {
                    headers: getAdminHeaders(),
                }
            );

            if (selectedImage) {
                const formDataImg = new FormData();
                formDataImg.append("imagen", selectedImage);

                await axios.post(`${API_URL}/upload-mascota/${mascota.id}`, formDataImg, {
                    headers: getMultipartAdminHeaders(),
                });
            }

            if (onSave) {
                await onSave();
            }

            setRefreshKey(Date.now());
            setIsEditing(false);
            setSelectedImage(null);
        } catch (err) {
            console.error(err);
            alert("Error al guardar: " + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setFormData({ ...mascota });
        setImagePreview(imagenSrc);
        setSelectedImage(null);
    };

    // ========== MODO EDICIÓN ==========
    if (isEditing) {
        return (
            <div className="mascota-detail-enhanced">
                <main className="pet-page">
                    <section className="pet-shell">
                        <section className="pet-card-main">
                            <div className="pet-image-wrap">
                                <img src={imagePreview} alt="Preview" className="pet-image" />
                                <input type="file" accept="image/*" onChange={handleImageChange} className="edit-file-input" />
                                <small>Haz clic para cambiar la foto (dejar vacío mantiene la actual)</small>
                            </div>
                            <div className="pet-content">
                                <span className="pet-status">✏️ Modo edición</span>
                                <input name="nombre" value={formData.nombre || ''} onChange={handleInputChange} className="edit-input" placeholder="Nombre" />
                                <textarea name="descripcion" value={formData.descripcion || ''} onChange={handleInputChange} className="edit-textarea" placeholder="Descripción" />
                                <div className="pet-tags">
                                    <select name="sexo" value={formData.sexo} onChange={handleInputChange} className="edit-select">
                                        <option value={0}>Macho</option>
                                        <option value={1}>Hembra</option>
                                    </select>
                                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento || ''} onChange={handleInputChange} className="edit-input" />
                                    <input name="direccion" value={formData.direccion || ''} onChange={handleInputChange} className="edit-input" placeholder="Dirección" />
                                </div>
                                <div className="pet-contact-highlight">
                                    <h3>Contactos de emergencia</h3>
                                    <label>Persona 1: <input name="persona1" value={formData.persona1 || ''} onChange={handleInputChange} /></label>
                                    <label>Teléfono 1: <input name="persona1tel" value={formData.persona1tel || ''} onChange={handleInputChange} /></label>
                                    <label>Instagram 1: <input name="persona1ig" value={formData.persona1ig || ''} onChange={handleInputChange} /></label>
                                    <label>Persona 2: <input name="persona2" value={formData.persona2 || ''} onChange={handleInputChange} /></label>
                                    <label>Teléfono 2: <input name="persona2tel" value={formData.persona2tel || ''} onChange={handleInputChange} /></label>
                                    <label>Instagram 2: <input name="persona2ig" value={formData.persona2ig || ''} onChange={handleInputChange} /></label>
                                    <label>Mensaje de rescate: <textarea name="mensajeRescate" value={formData.mensajeRescate || ''} onChange={handleInputChange} /></label>
                                </div>
                                <div className="admin-actions">
                                    <button onClick={handleSave} disabled={loading} className="btn-admin save">
                                        {loading ? "Guardando..." : "💾 Guardar"}
                                    </button>
                                    <button onClick={cancelEdit} className="btn-admin cancel">❌ Cancelar</button>
                                </div>
                            </div>
                        </section>
                    </section>
                </main>
            </div>
        );
    }

    // ========== MODO VISUALIZACIÓN ==========
    const currentImageUrl = getImageUrl(imagenSrc);
    return (
        <div className="mascota-detail-enhanced">
            <main className="pet-page">
                <section className="pet-shell">
                    <section className="pet-card-main">
                        <div className="pet-image-wrap">
                            <img src={currentImageUrl} alt={`Foto de ${mascota.nombre}`} className="pet-image" />
                        </div>
                        <div className="pet-content">
                            <span className="pet-status">🐾 Mascota protegida</span>
                            <h1 className="pet-name">{mascota.nombre || "Mascota sin nombre"}</h1>
                            <p className="pet-message">Si la encontraste o tenés información, ayudanos a que vuelva con su familia.</p>
                            <div className="pet-tags">
                                <span className="pet-tag"><span className="pet-tag-icon">{sexoInfo.icono}</span>{sexoInfo.texto}</span>
                                <span className="pet-tag"><span className="pet-tag-icon">🎂</span>{edadTexto}</span>
                                {mascota.direccion && <span className="pet-tag pet-tag-soft"><span className="pet-tag-icon">📍</span>Zona: {mascota.direccion}</span>}
                            </div>
                            <div className="pet-description-card">
                                <h2>Sobre {mascota.nombre}</h2>
                                <p>{mascota.descripcion || "No hay descripción."}</p>
                            </div>
                            <div className="pet-contact-highlight">
                                <h3>Contactá a su familia</h3>
                                <div className="pet-quick-actions">
                                    {mascota.persona1tel && (
                                        <>
                                            <a href={getWhatsappLink(mascota.persona1tel, mascota.mensajeRescate)} className="pet-main-btn" target="_blank">WhatsApp</a>
                                            <a href={getPhoneLink(mascota.persona1tel)} className="pet-alt-btn">Llamar</a>
                                        </>
                                    )}
                                    {mascota.persona1ig && (
                                        <a href={getInstagramLink(mascota.persona1ig)} className="pet-action-btn instagram" target="_blank">Instagram</a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="pet-contacts-section">
                        <div className="pet-section-heading">
                            <h2>Personas de contacto</h2>
                            <p>Podés comunicarte con cualquiera de estas personas.</p>
                        </div>
                        <div className="pet-contacts-grid">
                            {mascota.persona1 && (
                                <article className="pet-contact-card">
                                    <div className="pet-contact-header">
                                        <div className="pet-contact-avatar">👤</div>
                                        <div><h3>{mascota.persona1}</h3><p>Contacto principal</p></div>
                                    </div>
                                    <div className="pet-contact-actions">
                                        {mascota.persona1tel && (
                                            <>
                                                <a href={getWhatsappLink(mascota.persona1tel, mascota.mensajeRescate)} className="pet-action-btn whatsapp" target="_blank">WhatsApp</a>
                                                <a href={getPhoneLink(mascota.persona1tel)} className="pet-action-btn call">Llamar</a>
                                            </>
                                        )}
                                        {mascota.persona1ig && <a href={getInstagramLink(mascota.persona1ig)} className="pet-action-btn instagram" target="_blank">Instagram</a>}
                                    </div>
                                </article>
                            )}
                            {mascota.persona2 && (
                                <article className="pet-contact-card">
                                    <div className="pet-contact-header">
                                        <div className="pet-contact-avatar">👤</div>
                                        <div><h3>{mascota.persona2}</h3><p>Contacto alternativo</p></div>
                                    </div>
                                    <div className="pet-contact-actions">
                                        {mascota.persona2tel && (
                                            <>
                                                <a href={getWhatsappLink(mascota.persona2tel, mascota.mensajeRescate)} className="pet-action-btn whatsapp" target="_blank">WhatsApp</a>
                                                <a href={getPhoneLink(mascota.persona2tel)} className="pet-action-btn call">Llamar</a>
                                            </>
                                        )}
                                        {mascota.persona2ig && <a href={getInstagramLink(mascota.persona2ig)} className="pet-action-btn instagram" target="_blank">Instagram</a>}
                                    </div>
                                </article>
                            )}
                        </div>
                    </section>
                    {showActions && (
                        <div className="admin-actions">
                            <button onClick={() => setIsEditing(true)} className="btn-admin edit">✏️ Editar mascota</button>
                            <button onClick={() => onDelete(mascota.id)} className="btn-admin delete">🗑️ Eliminar mascota</button>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default MascotaDetailView;