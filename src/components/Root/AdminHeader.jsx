import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    FaSignOutAlt,
    FaUsers,
    FaChartBar,
    FaHome,
    FaPaw,
    FaCamera
} from "react-icons/fa";
import { Helmet } from "react-helmet";
import { Modal } from "react-bootstrap";
import "./AdminHeader.css";

import {
    API_URL,
    getAdminHeaders,
    resolveUploadUrl
} from "../../config/adminApi";

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

    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "{}");
        } catch {
            return {};
        }
    }, []);

    const userId = localStorage.getItem("userId") || user?.id || "";

    const cleanupModalEffects = () => {
        document.body.classList.remove("modal-open");
        document.body.style.removeProperty("overflow");
        document.body.style.removeProperty("padding-right");

        document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    };

    const closeProfileModal = () => {
        setShowProfileModal(false);
        setSelectedFile(null);

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(null);

        setTimeout(cleanupModalEffects, 80);
    };

    const updateLocalUser = (nextUser) => {
        const mergedUser = {
            ...user,
            ...nextUser
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));

        if (mergedUser.id) {
            localStorage.setItem("userId", String(mergedUser.id));
        }
    };

    useEffect(() => {
        const loadUserPhoto = async () => {
            if (user?.foto_perfil) {
                setFotoPerfil(resolveUploadUrl(user.foto_perfil));
                return;
            }

            if (!userId) return;

            try {
                const res = await fetch(`${API_URL}/usuarios/${userId}`, {
                    headers: getAdminHeaders()
                });

                const data = await res.json();

                if (data?.foto_perfil) {
                    const fotoUrl = resolveUploadUrl(data.foto_perfil);
                    setFotoPerfil(fotoUrl);
                    updateLocalUser({
                        ...data,
                        foto_perfil: data.foto_perfil
                    });
                }
            } catch (error) {
                console.error("Error al cargar foto de perfil:", error);
            }
        };

        loadUserPhoto();
    }, [userId]);

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        document.body.style.overflow = drawerOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [drawerOpen]);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            cleanupModalEffects();
        };
    }, [previewUrl]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            alert("Formato inválido. Usá JPG, PNG o WEBP.");
            return;
        }

        if (file.size > 3 * 1024 * 1024) {
            alert("La imagen no puede superar los 3MB.");
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile || !userId) return;

        setUploading(true);

        const formData = new FormData();
        formData.append("imagen", selectedFile);

        try {
            const response = await fetch(`${API_URL}/upload-perfil/${userId}`, {
                method: "POST",
                headers: getAdminHeaders(),
                body: formData
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || "Error al subir la foto");
            }

            const rawPhoto = result.foto_perfil || result.user?.foto_perfil || result.url;
            const photoUrl = resolveUploadUrl(rawPhoto);

            setFotoPerfil(`${photoUrl}?t=${Date.now()}`);

            updateLocalUser({
                ...(result.user || {}),
                foto_perfil: rawPhoto
            });

            window.dispatchEvent(new Event("userPhotoUpdated"));

            closeProfileModal();
        } catch (error) {
            console.error("Error uploading photo:", error);
            alert(error.message || "Error de conexión");
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
                            onClick={() => setDrawerOpen((v) => !v)}
                            aria-label="Menú"
                            type="button"
                        >
                            <span />
                            <span />
                            <span />
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
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-expanded={menuOpen}
                                type="button"
                            >
                                <div className="ah-avatar">
                                    {fotoPerfil ? (
                                        <img
                                            src={fotoPerfil}
                                            alt="Avatar"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <span>{initials}</span>
                                    )}
                                </div>

                                <span className="ah-uname">{user?.nombre || "Admin"}</span>

                                <svg
                                    className={`ah-chevron ${menuOpen ? "flip" : ""}`}
                                    viewBox="0 0 10 6"
                                    width="10"
                                >
                                    <path d="M0 0l5 6 5-6z" fill="currentColor" />
                                </svg>
                            </button>

                            <div className={`ah-dropdown ${menuOpen ? "open" : ""}`}>
                                <button
                                    className="ah-drop-item"
                                    type="button"
                                    onClick={() => {
                                        setShowProfileModal(true);
                                        setMenuOpen(false);
                                    }}
                                >
                                    <FaCamera /> Cambiar foto de perfil
                                </button>

                                <Link
                                    to="/admin/mis-mascotas"
                                    className="ah-drop-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <FaPaw /> Mis mascotas
                                </Link>

                                <Link
                                    to="/admin"
                                    className="ah-drop-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <FaHome /> Dashboard
                                </Link>

                                <button
                                    className="ah-drop-item danger"
                                    onClick={handleLogout}
                                    type="button"
                                >
                                    <FaSignOutAlt /> Cerrar sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`ah-drawer ${drawerOpen ? "open" : ""}`}>
                <div className="ah-drawer-head">
                    <div className="ah-drawer-avatar">
                        {fotoPerfil ? (
                            <img src={fotoPerfil} alt="Avatar" className="imagenperfil" />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>

                    <div>
                        <p className="ah-drawer-name">
                            {user?.nombre} {user?.apellido}
                        </p>
                        <p className="ah-drawer-email">{user?.email}</p>
                    </div>
                </div>

                <nav className="ah-drawer-nav">
                    <Link
                        to="/admin"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaChartBar /> Dashboard
                    </Link>

                    <Link
                        to="/admin/usuarios"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaUsers /> Usuarios
                    </Link>

                    <Link
                        to="/admin/mis-mascotas"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaPaw /> Mis mascotas
                    </Link>

                    <Link
                        to="/"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaHome /> Ver sitio
                    </Link>
                </nav>

                <div className="ah-drawer-foot">
                    <button className="ah-drawer-logout" onClick={handleLogout} type="button">
                        <FaSignOutAlt /> Cerrar sesión
                    </button>
                </div>
            </div>

            {drawerOpen && (
                <div
                    className="ah-overlay"
                    onClick={() => setDrawerOpen(false)}
                    role="presentation"
                />
            )}

            <Modal
                show={showProfileModal}
                onHide={closeProfileModal}
                centered
                backdrop="static"
                keyboard={!uploading}
                onExited={cleanupModalEffects}
            >
                <Modal.Header closeButton={!uploading}>
                    <Modal.Title>Cambiar foto de perfil</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="ah-modal-preview">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Vista previa" />
                        ) : (
                            <div className="ah-modal-avatar-placeholder">
                                {fotoPerfil ? <img src={fotoPerfil} alt="Foto actual" /> : <span>{initials}</span>}
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
                        onClick={() => fileInputRef.current?.click()}
                        type="button"
                        disabled={uploading}
                    >
                        Seleccionar imagen
                    </button>

                    {selectedFile && (
                        <button
                            className="ah-modal-btn primary"
                            onClick={handleUploadPhoto}
                            disabled={uploading}
                            type="button"
                        >
                            {uploading ? "Subiendo..." : "Guardar foto"}
                        </button>
                    )}

                    <button
                        className="ah-modal-btn ghost"
                        onClick={closeProfileModal}
                        disabled={uploading}
                        type="button"
                    >
                        Cancelar
                    </button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminHeader;