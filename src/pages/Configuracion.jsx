import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCamera,
    FaEnvelope,
    FaBell,
    FaUser,
    FaSignature,
    FaCalendarAlt
} from "react-icons/fa";
import "./Configuracion.css";
import HeaderLogout from "../components/Logout/Logout";

const Configuracion = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const isMounted = useRef(true);

    const [loading, setLoading] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [errorEmail, setErrorEmail] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        confirmEmail: "",
        fecha_nacimiento: "",
        recibir_emails: true,
        foto_perfil: ""
    });

    useEffect(() => {
        isMounted.current = true;

        if (!userId) {
            navigate("/login");
            return;
        }

        fetchUserData();

        return () => {
            isMounted.current = false;
        };
    }, [userId, navigate]);

    const fetchUserData = async () => {
        try {
            const res = await fetch(`http://localhost/api-smartpet/index.php/usuarios/${userId}`);
            const data = await res.json();

            if (isMounted.current && data) {
                setFormData((prev) => ({
                    ...prev,
                    nombre: data.nombre || "",
                    apellido: data.apellido || "",
                    email: data.email || "",
                    confirmEmail: data.email || "",
                    fecha_nacimiento: data.fecha_nacimiento || "",
                    recibir_emails: data.recibir_emails === 1 || data.recibir_emails === true,
                    foto_perfil: data.foto_perfil || ""
                }));
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formDataImg = new FormData();
        formDataImg.append("imagen", file);

        setLoading(true);

        try {
            const res = await fetch(`http://localhost/api-smartpet/index.php/upload-perfil/${userId}`, {
                method: "POST",
                body: formDataImg
            });

            const data = await res.json();

            if (data.success && isMounted.current) {
                setFormData((prev) => ({
                    ...prev,
                    foto_perfil: data.url
                }));
                setMensaje("Foto actualizada correctamente");
                setTimeout(() => setMensaje(""), 3000);
            } else {
                if (isMounted.current) {
                    setMensaje(data.error || "No se pudo actualizar la foto");
                }
            }
        } catch (error) {
            if (isMounted.current) {
                setMensaje("Error al subir la imagen");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorEmail("");
        setMensaje("");

        if (formData.email !== formData.confirmEmail) {
            setErrorEmail("Los correos electrónicos no coinciden");
            return;
        }

        if (!formData.email.trim()) {
            setErrorEmail("El email no puede estar vacío");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorEmail("Formato de email inválido");
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: formData.email.trim(),
                fecha_nacimiento: formData.fecha_nacimiento || null,
                recibir_emails: formData.recibir_emails ? 1 : 0
            };

            const res = await fetch(`http://localhost/api-smartpet/index.php/usuarios/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (res.ok) {
                if (isMounted.current) {
                    setMensaje("Configuración guardada correctamente");
                    localStorage.setItem("userEmail", formData.email);
                    setTimeout(() => setMensaje(""), 3000);
                }
            } else {
                if (isMounted.current) {
                    setMensaje(responseData.error || "Error al guardar cambios");
                }
            }
        } catch (error) {
            if (isMounted.current) {
                setMensaje("Error de conexión");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <>
            <HeaderLogout />

            <div className="config-container">
                <div className="config-card">
                    <div className="config-header">
                        <h1>Configuración de perfil</h1>
                        <p>Actualizá tu información personal y tus preferencias de contacto.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="config-form">
                        <div className="config-section photo-section">
                            <label className="photo-label">
                                <div className="photo-wrapper">
                                    {formData.foto_perfil ? (
                                        <img src={formData.foto_perfil} alt="Perfil" />
                                    ) : (
                                        <div className="photo-placeholder">
                                            <FaCamera />
                                        </div>
                                    )}

                                    <div className="photo-overlay">
                                        <FaCamera />
                                        <span>Cambiar foto</span>
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    hidden
                                />
                            </label>
                        </div>

                        <div className="config-section">
                            <label>
                                <FaUser />
                                <span>Nombre</span>
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => handleChange("nombre", e.target.value)}
                                placeholder="Tu nombre"
                                required
                            />
                        </div>

                        <div className="config-section">
                            <label>
                                <FaSignature />
                                <span>Apellido</span>
                            </label>
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => handleChange("apellido", e.target.value)}
                                placeholder="Tu apellido"
                                required
                            />
                        </div>

                        <div className="config-section">
                            <label>
                                <FaCalendarAlt />
                                <span>Fecha de nacimiento</span>
                            </label>
                            <input
                                type="date"
                                value={formData.fecha_nacimiento}
                                onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
                            />
                        </div>

                        <div className="config-section">
                            <label>
                                <FaEnvelope />
                                <span>Correo electrónico</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="ejemplo@correo.com"
                                required
                            />
                        </div>

                        <div className="config-section">
                            <label>
                                <FaEnvelope />
                                <span>Confirmar correo</span>
                            </label>
                            <input
                                type="email"
                                value={formData.confirmEmail}
                                onChange={(e) => handleChange("confirmEmail", e.target.value)}
                                placeholder="Repite tu correo"
                                className={errorEmail ? "input-error" : ""}
                                required
                            />
                            {errorEmail && (
                                <span className="error-message">{errorEmail}</span>
                            )}
                        </div>

                        <div className="config-section toggle">
                            <div className="toggle-label">
                                <FaBell />
                                <span>Recibir notificaciones por email</span>
                            </div>

                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.recibir_emails}
                                    onChange={(e) =>
                                        handleChange("recibir_emails", e.target.checked)
                                    }
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {mensaje && (
                            <div
                                className={`mensaje ${mensaje.toLowerCase().includes("error") ? "mensaje-error" : ""
                                    }`}
                            >
                                {mensaje}
                            </div>
                        )}

                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Configuracion;