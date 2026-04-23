import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUser, FaUsers, FaChartBar, FaHome, FaPaw, FaCamera } from "react-icons/fa";
import { Helmet } from "react-helmet";
import "./AdminHeader.css";

const API_URL = "http://localhost/api-smartpet/index.php";

const AdminHeader = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState("");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const menuRef = useRef(null);
    const fileInputRef = useRef(null);

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    // Cargar foto de perfil desde localStorage o API
    useEffect(() => {
        if (user?.foto_perfil) {
            setFotoPerfil(user.foto_perfil);
        } else if (user?.id) {
            fetch(`${API_URL}/usuarios/${user.id}`)
                .then(r => r.json())
                .then(d => {
                    if (d?.foto_perfil) {
                        setFotoPerfil(d.foto_perfil);
                        // Actualizar localStorage
                        const updatedUser = { ...user, foto_perfil: d.foto_perfil };
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                    }
                })
                .catch(console.error);
        }
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [drawerOpen]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    // Subir nueva foto de perfil
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile) return;
        setUploading(true);
        const formData = new FormData();
        formData.append("imagen", selectedFile);

        try {
            const response = await fetch(`${API_URL}/upload-perfil/${user.id}`, {
                method: "POST",
                body: formData
            });
            const result = await response.json();
            if (result.success && result.url) {
                // Actualizar foto en estado y localStorage
                setFotoPerfil(result.url);
                const updatedUser = { ...user, foto_perfil: result.url };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setShowProfileModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
            } else {
                alert("Error al subir la foto");
            }
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert("Error de conexión");
        } finally {
            setUploading(false);
        }
    };

    const initials = user?.nombre ? user.nombre.charAt(0).toUpperCase() : "A";

    return (
        <>
            <Helmet>
                <title>SmartPet | Admin</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Helmet>

            <header className="ah-header">
                <div className="ah-inner">
                    <div className="ah-left">
                        <button
                            className={`ah-hamburger ${drawerOpen ? "active" : ""}`}
                            onClick={() => setDrawerOpen(v => !v)}
                            aria-label="Menú"
                        >
                            <span /><span /><span />
                        </button>
                        <Link to="/admin" className="ah-brand">
                            Smart<span>Pet</span>
                            <em>Admin</em>
                        </Link>
                    </div>

                    <div className="ah-right">
                        <div className="ah-profile" ref={menuRef}>
                            <button
                                className="ah-avatar-btn"
                                onClick={() => setMenuOpen(v => !v)}
                                aria-expanded={menuOpen}
                            >
                                <div className="ah-avatar">
                                    {fotoPerfil ? <img src={fotoPerfil} alt="avatar" /> : <span>{initials}</span>}
                                </div>
                                <span className="ah-uname">{user?.nombre || "Admin"}</span>
                                <svg className={`ah-chevron ${menuOpen ? "flip" : ""}`} viewBox="0 0 10 6" width="10">
                                    <path d="M0 0l5 6 5-6z" fill="currentColor" />
                                </svg>
                            </button>

                            <div className={`ah-dropdown ${menuOpen ? "open" : ""}`}>
                                <button
                                    className="ah-drop-item"
                                    onClick={() => { setShowProfileModal(true); setMenuOpen(false); }}
                                >
                                    <FaCamera /> Cambiar foto de perfil
                                </button>
                                <Link to="/admin/mis-mascotas" className="ah-drawer-link" onClick={() => setDrawerOpen(false)}>
                                    <FaPaw /> Mis mascotas
                                </Link>
                                <Link to="/admin" className="ah-drop-item" onClick={() => setMenuOpen(false)}>
                                    <FaHome /> Ver sitio
                                </Link>
                                <button className="ah-drop-item danger" onClick={handleLogout}>
                                    <FaSignOutAlt /> Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile drawer */}
            <div className={`ah-drawer ${drawerOpen ? "open" : ""}`}>
                <div className="ah-drawer-head">
                    <div className="ah-drawer-avatar">
                        {fotoPerfil ? <img src={fotoPerfil} alt="avatar" className="imagenperfil" /> : <span>{initials}</span>}
                    </div>
                    <div>
                        <p className="ah-drawer-name">{user?.nombre} {user?.apellido}</p>
                        <p className="ah-drawer-email">{user?.email}</p>
                    </div>
                </div>
                <nav className="ah-drawer-nav">
                    <Link to="/admin" className="ah-drawer-link" onClick={() => setDrawerOpen(false)}>
                        <FaChartBar /> Dashboard
                    </Link>
                    <Link to="/admin/usuarios" className="ah-drawer-link" onClick={() => setDrawerOpen(false)}>
                        <FaUsers /> Usuarios
                    </Link>
                    <Link to="/admin/mis-mascotas" className="ah-drawer-link" onClick={() => setDrawerOpen(false)}>
                        <FaPaw /> Mis mascotas
                    </Link>
                    <Link to="/" className="ah-drawer-link" onClick={() => setDrawerOpen(false)}>
                        <FaHome /> Ver sitio
                    </Link>
                </nav>
                <div className="ah-drawer-foot">
                    <button className="ah-drawer-logout" onClick={handleLogout}>
                        <FaSignOutAlt /> Cerrar sesión
                    </button>
                </div>
            </div>
            {drawerOpen && <div className="ah-overlay" onClick={() => setDrawerOpen(false)} />}

            {/* Modal para cambiar foto de perfil */}
            {showProfileModal && (
                <div className="ah-modal-overlay" onClick={() => setShowProfileModal(false)}>
                    <div className="ah-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Cambiar foto de perfil</h3>
                        <div className="ah-modal-preview">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" />
                            ) : (
                                <div className="ah-modal-avatar-placeholder">
                                    {fotoPerfil ? <img src={fotoPerfil} alt="Current" /> : <span>{initials}</span>}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                        />
                        <button
                            className="ah-modal-btn secondary"
                            onClick={() => fileInputRef.current.click()}
                        >
                            Seleccionar imagen
                        </button>
                        {selectedFile && (
                            <button
                                className="ah-modal-btn primary"
                                onClick={handleUploadPhoto}
                                disabled={uploading}
                            >
                                {uploading ? "Subiendo..." : "Guardar foto"}
                            </button>
                        )}
                        <button
                            className="ah-modal-btn ghost"
                            onClick={() => setShowProfileModal(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminHeader;