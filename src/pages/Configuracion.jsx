import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaCamera,
    FaEnvelope,
    FaBell,
    FaUser,
    FaSignature,
    FaCalendarAlt,
    FaLock,
    FaEye,
    FaEyeSlash
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
    const [errorPassword, setErrorPassword] = useState("");


    const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
    // Timestamp para forzar recarga de imagen
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        email: "",
        confirmEmail: "",
        fecha_nacimiento: "",
        recibir_emails: true,
        foto_perfil: ""
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Estados para mostrar/ocultar contraseñas
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`);
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
                // Actualizar timestamp para refrescar imagen
                setImageTimestamp(Date.now());
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
            const res = await fetch(`${API_BASE}/index.php/upload-perfil/${userId}`, {
                method: "POST",
                body: formDataImg
            });

            const data = await res.json();

            if (data.success && isMounted.current) {
                // Actualizar estado con la nueva URL
                setFormData((prev) => ({
                    ...prev,
                    foto_perfil: data.url
                }));
                // Cambiar timestamp para forzar recarga
                setImageTimestamp(Date.now());

                // Actualizar localStorage
                const userStr = localStorage.getItem("user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    user.foto_perfil = data.url;
                    localStorage.setItem("user", JSON.stringify(user));
                }
                // Disparar evento para actualizar header
                window.dispatchEvent(new Event("userPhotoUpdated"));
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

            const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`, {
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
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        user.nombre = formData.nombre;
                        user.apellido = formData.apellido;
                        user.email = formData.email;
                        localStorage.setItem("user", JSON.stringify(user));
                    }
                    window.dispatchEvent(new Event("userDataUpdated"));
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

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setErrorPassword("");
        setMensaje("");

        const { currentPassword, newPassword, confirmNewPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setErrorPassword("Todos los campos de contraseña son obligatorios");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setErrorPassword("La nueva contraseña y su confirmación no coinciden");
            return;
        }

        if (newPassword.length < 6) {
            setErrorPassword("La nueva contraseña debe tener al menos 6 caracteres");
            return;
        }

        setPasswordLoading(true);

        try {
            const res = await fetch(`${API_BASE}/index.php/change-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usuario_id: userId,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setMensaje("Contraseña actualizada correctamente");
                setPasswordData({ currentPassword: "", newPassword: "", confirmNewPassword: "" });
                setTimeout(() => setMensaje(""), 3000);
            } else {
                setErrorPassword(data.error || "Error al cambiar la contraseña");
            }
        } catch (error) {
            setErrorPassword("Error de conexión al cambiar la contraseña");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePasswordInputChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value
        }));
    };

    // URL de la foto con timestamp para evitar caché
    const fotoUrl = formData.foto_perfil ? `${formData.foto_perfil}?t=${imageTimestamp}` : null;

    return (
        <>
            <HeaderLogout />

            <div className="config-container">
                <div className="config-card">
                    <div className="config-header">
                        <h1>Configuración de perfil</h1>
                        <p>Actualizá tu información personal, contraseña y preferencias de contacto.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="config-form">
                        {/* Foto de perfil */}
                        <div className="config-section photo-section">
                            <label className="photo-label">
                                <div className="photo-wrapper">
                                    {fotoUrl ? (
                                        <img src={fotoUrl} alt="Perfil" />
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

                        {/* Nombre */}
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

                        {/* Apellido */}
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

                        {/* Fecha nacimiento */}
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

                        {/* Email */}
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

                        {/* Confirmar email */}
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
                            {errorEmail && <span className="error-message">{errorEmail}</span>}
                        </div>

                        {/* Notificaciones */}
                        <div className="config-section toggle">
                            <div className="toggle-label">
                                <FaBell />
                                <span>Recibir notificaciones por email</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.recibir_emails}
                                    onChange={(e) => handleChange("recibir_emails", e.target.checked)}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        {/* Sección cambio de contraseña con visibilidad */}
                        <div className="config-section password-section">
                            <div className="section-title">
                                <FaLock />
                                <span>Cambiar contraseña</span>
                            </div>
                            <div className="password-fields">
                                {/* Contraseña actual */}
                                <div className="password-input-wrapper">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        placeholder="Contraseña actual"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    >
                                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {/* Nueva contraseña */}
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        placeholder="Nueva contraseña"
                                        value={passwordData.newPassword}
                                        onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {/* Confirmar nueva contraseña */}
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirmar nueva contraseña"
                                        value={passwordData.confirmNewPassword}
                                        onChange={(e) => handlePasswordInputChange("confirmNewPassword", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="toggle-password"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>

                                {errorPassword && <span className="error-message">{errorPassword}</span>}
                                <button
                                    type="button"
                                    className="btn-change-password"
                                    onClick={handlePasswordChange}
                                    disabled={passwordLoading}
                                >
                                    {passwordLoading ? "Cambiando..." : "Actualizar contraseña"}
                                </button>
                            </div>
                        </div>

                        {mensaje && (
                            <div className={`mensaje ${mensaje.toLowerCase().includes("error") ? "mensaje-error" : ""}`}>
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