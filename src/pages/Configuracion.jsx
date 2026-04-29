import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaCalendarAlt,
    FaCamera,
    FaCheckCircle,
    FaEnvelope,
    FaEye,
    FaEyeSlash,
    FaLock,
    FaSignature,
    FaSpinner,
    FaUser,
    FaExclamationTriangle
} from "react-icons/fa";
import API_BASE from "../config/api";
import HeaderLogout from "../components/Logout/Logout";
import "./Configuracion.css";

const Configuracion = () => {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const isMounted = useRef(true);
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [mensaje, setMensaje] = useState("");
    const [mensajeTipo, setMensajeTipo] = useState("success");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPassword, setErrorPassword] = useState("");
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const showMessage = (text, type = "success") => {
        setMensaje(text);
        setMensajeTipo(type);

        window.clearTimeout(showMessage.timer);
        showMessage.timer = window.setTimeout(() => {
            setMensaje("");
        }, 3500);
    };

    const buildImageUrl = (fotoPerfilValue) => {
        if (!fotoPerfilValue) return "";

        if (
            fotoPerfilValue.startsWith("http://") ||
            fotoPerfilValue.startsWith("https://")
        ) {
            return fotoPerfilValue;
        }

        const cleanPath = fotoPerfilValue.replace(/^\/+/, "");

        if (cleanPath.startsWith("uploads/perfiles/")) {
            return `${API_BASE}/${cleanPath}`;
        }

        return `${API_BASE}/uploads/perfiles/${cleanPath}`;
    };

    const normalizeUser = (user) => ({
        nombre: user?.nombre || "",
        apellido: user?.apellido || "",
        email: user?.email || "",
        confirmEmail: user?.email || "",
        fecha_nacimiento: user?.fecha_nacimiento || "",
        recibir_emails:
            user?.recibir_emails === 1 ||
            user?.recibir_emails === "1" ||
            user?.recibir_emails === true,
        foto_perfil: user?.foto_perfil || ""
    });

    const updateLocalUser = (updatedUser) => {
        const userStr = localStorage.getItem("user");
        const currentUser = userStr ? JSON.parse(userStr) : {};

        localStorage.setItem("userEmail", updatedUser.email || currentUser.email || "");

        localStorage.setItem(
            "user",
            JSON.stringify({
                ...currentUser,
                ...updatedUser
            })
        );

        window.dispatchEvent(new Event("userDataUpdated"));
    };

    const fetchUserData = async () => {
        setLoading(true);
        setMensaje("");

        try {
            const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`);
            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.error || "No se pudieron cargar tus datos");
            }

            const user = data.user || data.data || data;

            if (!user || !user.id) {
                throw new Error("La API no devolvió datos válidos del usuario");
            }

            if (isMounted.current) {
                setFormData(normalizeUser(user));
                updateLocalUser(user);
                setImageTimestamp(Date.now());
            }
        } catch (error) {
            if (isMounted.current) {
                showMessage(error.message || "Error al cargar datos del usuario", "error");
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMounted.current = true;

        if (!userId) {
            navigate("/login");
            return;
        }

        fetchUserData();

        return () => {
            isMounted.current = false;
            window.clearTimeout(showMessage.timer);
        };
    }, [userId, navigate]);

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value
        }));

        if (field === "email" || field === "confirmEmail") {
            setErrorEmail("");
        }
    };


    const refreshUserAfterPhotoUpload = async () => {
        const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`);
        const data = await res.json();

        if (!res.ok || data.success === false) {
            throw new Error(data.error || "No se pudo refrescar el usuario");
        }

        const user = data.user || data.data || data;

        setFormData(normalizeUser(user));
        updateLocalUser(user);
        setImageTimestamp(Date.now());

        window.dispatchEvent(new CustomEvent("userPhotoUpdated", {
            detail: {
                foto_perfil: user.foto_perfil,
                timestamp: Date.now()
            }
        }));

        window.dispatchEvent(new CustomEvent("userDataUpdated", {
            detail: {
                user,
                timestamp: Date.now()
            }
        }));
    };
    const handlePasswordInputChange = (field, value) => {
        setPasswordData((prev) => ({
            ...prev,
            [field]: value
        }));

        setErrorPassword("");
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            showMessage("Formato inválido. Usá JPG, PNG o WEBP", "error");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            showMessage("La imagen no puede superar los 2MB", "error");
            return;
        }

        const formDataImg = new FormData();
        formDataImg.append("imagen", file);

        setUploadingPhoto(true);

        try {
            const res = await fetch(`${API_BASE}/index.php/upload-perfil/${userId}`, {
                method: "POST",
                body: formDataImg
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "No se pudo actualizar la foto");
            }

            const fotoPerfilPath = data.foto_perfil || data.url;

            if (!fotoPerfilPath) {
                throw new Error("La API no devolvió la ruta de la foto");
            }

            setFormData((prev) => ({
                ...prev,
                foto_perfil: fotoPerfilPath
            }));

            updateLocalUser({
                id: userId,
                foto_perfil: fotoPerfilPath
            });

            setImageTimestamp(Date.now());

            await refreshUserAfterPhotoUpload();

            showMessage("Foto actualizada correctamente", "success");
        } catch (error) {
            showMessage(error.message || "Error al subir la imagen", "error");
        } finally {
            setUploadingPhoto(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const validateProfileForm = () => {
        setErrorEmail("");

        const nombre = formData.nombre.trim();
        const apellido = formData.apellido.trim();
        const email = formData.email.trim();
        const confirmEmail = formData.confirmEmail.trim();

        if (!nombre) {
            showMessage("El nombre no puede estar vacío", "error");
            return false;
        }

        if (!apellido) {
            showMessage("El apellido no puede estar vacío", "error");
            return false;
        }

        if (!email) {
            setErrorEmail("El email no puede estar vacío");
            return false;
        }

        if (email !== confirmEmail) {
            setErrorEmail("Los correos electrónicos no coinciden");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setErrorEmail("Formato de email inválido");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateProfileForm()) return;

        setSaving(true);

        try {
            const payload = {
                nombre: formData.nombre.trim(),
                apellido: formData.apellido.trim(),
                email: formData.email.trim(),
                fecha_nacimiento: formData.fecha_nacimiento || null,
                recibir_emails: formData.recibir_emails ? 1 : 0
            };

            const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();

            if (!res.ok || !responseData.success) {
                throw new Error(responseData.error || "Error al guardar cambios");
            }

            const updatedUser = responseData.user || {
                id: userId,
                ...payload,
                foto_perfil: formData.foto_perfil
            };

            if (isMounted.current) {
                setFormData((prev) =>
                    normalizeUser({
                        ...updatedUser,
                        foto_perfil: updatedUser.foto_perfil || prev.foto_perfil
                    })
                );

                updateLocalUser(updatedUser);
                showMessage("Tus datos se guardaron correctamente", "success");
            }
        } catch (error) {
            if (isMounted.current) {
                showMessage(error.message || "Error de conexión", "error");
            }
        } finally {
            if (isMounted.current) {
                setSaving(false);
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        setErrorPassword("");

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
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    usuario_id: userId,
                    current_password: currentPassword,
                    new_password: newPassword
                })
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Error al cambiar la contraseña");
            }

            if (isMounted.current) {
                setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                });

                showMessage("Contraseña actualizada correctamente", "success");
            }
        } catch (error) {
            if (isMounted.current) {
                setErrorPassword(error.message || "Error al cambiar la contraseña");
            }
        } finally {
            if (isMounted.current) {
                setPasswordLoading(false);
            }
        }
    };

    const fotoUrl = formData.foto_perfil
        ? `${buildImageUrl(formData.foto_perfil)}?t=${imageTimestamp}`
        : null;

    const nombreCompleto = `${formData.nombre || ""} ${formData.apellido || ""}`.trim();

    return (
        <>
            <HeaderLogout />

            <main className="config-page">
                <section className="config-shell" aria-labelledby="config-title">
                    <div className="config-hero">
                        <div>
                            <p className="config-kicker">Mi cuenta</p>
                            <h1 id="config-title">Configuración de perfil</h1>
                            <p>
                                Visualizá y actualizá tus datos personales, foto de perfil,
                                preferencias y contraseña.
                            </p>
                        </div>

                        <div className="config-status">
                            {loading ? (
                                <>
                                    <FaSpinner className="spin" />
                                    <span>Cargando datos...</span>
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle />
                                    <span>Perfil activo</span>
                                </>
                            )}
                        </div>
                    </div>

                    {mensaje && (
                        <div className={`config-alert ${mensajeTipo === "error" ? "error" : "success"}`}>
                            {mensajeTipo === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
                            <span>{mensaje}</span>
                        </div>
                    )}

                    <div className="config-grid">
                        <aside className="profile-card">
                            <div className="profile-photo-wrap">
                                <button
                                    type="button"
                                    className="profile-photo"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingPhoto}
                                    aria-label="Cambiar foto de perfil"
                                >
                                    {fotoUrl ? (
                                        <img
                                            src={fotoUrl}
                                            alt={`Foto de perfil de ${nombreCompleto || "usuario"}`}
                                            loading="lazy"
                                            onError={() =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    foto_perfil: ""
                                                }))
                                            }
                                        />
                                    ) : (
                                        <FaUser />
                                    )}

                                    <span className="photo-layer">
                                        {uploadingPhoto ? <FaSpinner className="spin" /> : <FaCamera />}
                                        <span>{uploadingPhoto ? "Subiendo..." : "Cambiar"}</span>
                                    </span>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageUpload}
                                    hidden
                                />
                            </div>

                            <h2>{nombreCompleto || "Usuario SmartPet"}</h2>
                            <p>{formData.email || "Correo no cargado"}</p>

                            <div className="profile-meta">
                                <div>
                                    <span>Fecha nacimiento</span>
                                    <strong>{formData.fecha_nacimiento || "Sin cargar"}</strong>
                                </div>
                                <div>
                                    <span>Notificaciones</span>
                                    <strong>{formData.recibir_emails ? "Activadas" : "Desactivadas"}</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingPhoto}
                            >
                                <FaCamera />
                                {uploadingPhoto ? "Subiendo foto..." : "Subir nueva foto"}
                            </button>
                        </aside>

                        <section className="config-card">
                            <div className="card-heading">
                                <h2>Datos personales</h2>
                                <p>Estos datos se usan para identificar tu cuenta.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="config-form">
                                <div className="form-row">
                                    <div className="field-group">
                                        <label htmlFor="nombre">
                                            <FaUser />
                                            Nombre
                                        </label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => handleChange("nombre", e.target.value)}
                                            placeholder="Tu nombre"
                                            disabled={loading || saving}
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="apellido">
                                            <FaSignature />
                                            Apellido
                                        </label>
                                        <input
                                            id="apellido"
                                            type="text"
                                            value={formData.apellido}
                                            onChange={(e) => handleChange("apellido", e.target.value)}
                                            placeholder="Tu apellido"
                                            disabled={loading || saving}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="field-group">
                                    <label htmlFor="fecha_nacimiento">
                                        <FaCalendarAlt />
                                        Fecha de nacimiento
                                    </label>
                                    <input
                                        id="fecha_nacimiento"
                                        type="date"
                                        value={formData.fecha_nacimiento}
                                        onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
                                        disabled={loading || saving}
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="field-group">
                                        <label htmlFor="email">
                                            <FaEnvelope />
                                            Correo electrónico
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleChange("email", e.target.value)}
                                            placeholder="ejemplo@correo.com"
                                            disabled={loading || saving}
                                            required
                                        />
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="confirmEmail">
                                            <FaEnvelope />
                                            Confirmar correo
                                        </label>
                                        <input
                                            id="confirmEmail"
                                            type="email"
                                            value={formData.confirmEmail}
                                            onChange={(e) => handleChange("confirmEmail", e.target.value)}
                                            placeholder="Repetí tu correo"
                                            className={errorEmail ? "input-error" : ""}
                                            disabled={loading || saving}
                                            required
                                        />
                                        {errorEmail && <small className="field-error">{errorEmail}</small>}
                                    </div>
                                </div>

                                <div className="toggle-card">
                                    <div>
                                        <label htmlFor="recibir_emails" className="toggle-title">
                                            <FaBell />
                                            Recibir notificaciones por email
                                        </label>
                                        <p>Te avisaremos sobre novedades importantes de tu cuenta.</p>
                                    </div>

                                    <label className="switch">
                                        <input
                                            id="recibir_emails"
                                            type="checkbox"
                                            checked={formData.recibir_emails}
                                            onChange={(e) => handleChange("recibir_emails", e.target.checked)}
                                            disabled={loading || saving}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>

                                <div className="actions-row">
                                    <button
                                        type="button"
                                        className="btn-light"
                                        onClick={fetchUserData}
                                        disabled={loading || saving}
                                    >
                                        {loading ? <FaSpinner className="spin" /> : null}
                                        Recargar datos
                                    </button>

                                    <button type="submit" className="btn-primary" disabled={loading || saving}>
                                        {saving ? (
                                            <>
                                                <FaSpinner className="spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            "Guardar cambios"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="config-card password-card">
                            <div className="card-heading">
                                <h2>Seguridad</h2>
                                <p>Cambiá tu contraseña periódicamente para proteger tu cuenta.</p>
                            </div>

                            <form onSubmit={handlePasswordChange} className="config-form">
                                <div className="field-group">
                                    <label htmlFor="currentPassword">
                                        <FaLock />
                                        Contraseña actual
                                    </label>

                                    <div className="password-input">
                                        <input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordData.currentPassword}
                                            onChange={(e) =>
                                                handlePasswordInputChange("currentPassword", e.target.value)
                                            }
                                            placeholder="Ingresá tu contraseña actual"
                                            disabled={passwordLoading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                                            aria-label="Mostrar u ocultar contraseña actual"
                                        >
                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="field-group">
                                        <label htmlFor="newPassword">
                                            <FaLock />
                                            Nueva contraseña
                                        </label>

                                        <div className="password-input">
                                            <input
                                                id="newPassword"
                                                type={showNewPassword ? "text" : "password"}
                                                value={passwordData.newPassword}
                                                onChange={(e) =>
                                                    handlePasswordInputChange("newPassword", e.target.value)
                                                }
                                                placeholder="Mínimo 6 caracteres"
                                                disabled={passwordLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword((prev) => !prev)}
                                                aria-label="Mostrar u ocultar nueva contraseña"
                                            >
                                                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="field-group">
                                        <label htmlFor="confirmNewPassword">
                                            <FaLock />
                                            Confirmar contraseña
                                        </label>

                                        <div className="password-input">
                                            <input
                                                id="confirmNewPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={passwordData.confirmNewPassword}
                                                onChange={(e) =>
                                                    handlePasswordInputChange("confirmNewPassword", e.target.value)
                                                }
                                                placeholder="Repetí la nueva contraseña"
                                                disabled={passwordLoading}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                aria-label="Mostrar u ocultar confirmación"
                                            >
                                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {errorPassword && <small className="field-error">{errorPassword}</small>}

                                <div className="actions-row end">
                                    <button
                                        type="submit"
                                        className="btn-primary"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? (
                                            <>
                                                <FaSpinner className="spin" />
                                                Actualizando...
                                            </>
                                        ) : (
                                            "Actualizar contraseña"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Configuracion;