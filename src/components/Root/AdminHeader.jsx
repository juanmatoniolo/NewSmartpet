// src/components/Root/AdminHeader.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import axios from "axios";
import {
    FaBars,
    FaCamera,
    FaHome,
    FaPaw,
    FaSignOutAlt,
    FaTimes,
    FaBoxOpen,
} from "react-icons/fa";

import API_BASE, { getImageUrl, withCacheBust } from "../../config/api";
import "./AdminHeader.css";

const API_URL = `${API_BASE}/index.php`;
const DEFAULT_AVATAR = "/default.jpg";

const getStoredUser = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        return {};
    }
};

const getInitials = (user) => {
    const nombre = user?.nombre || "";
    const apellido = user?.apellido || "";

    const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`.trim();

    return initials ? initials.toUpperCase() : "SP";
};

function AdminHeader() {
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const fileInputRef = useRef(null);

    const [user, setUser] = useState(getStoredUser);
    const [menuOpen, setMenuOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");

    const initials = useMemo(() => getInitials(user), [user]);

    const fotoPerfil = useMemo(() => {
        const foto = user?.foto_perfil || localStorage.getItem("userPhoto") || "";
        return foto ? withCacheBust(getImageUrl(foto, DEFAULT_AVATAR), foto) : "";
    }, [user?.foto_perfil]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleLogout = () => {
        localStorage.clear();
        setMenuOpen(false);
        setDrawerOpen(false);
        navigate("/login", { replace: true });
    };

    const closeProfileModal = () => {
        if (uploading) return;

        setShowProfileModal(false);
        setSelectedFile(null);
        setError("");

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const cleanupModalEffects = () => {
        setSelectedFile(null);
        setError("");

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setError("Formato inválido. Usá JPG, PNG o WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no puede superar los 5MB.");
            e.target.value = "";
            return;
        }

        if (previewUrl?.startsWith("blob:")) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError("");
    };

    const handleUploadPhoto = async () => {
        if (!selectedFile || !user?.id) return;

        setUploading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("imagen", selectedFile);

            const res = await axios.post(`${API_URL}/upload-perfil/${user.id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "X-User-Id": user.id,
                },
            });

            if (res.data?.success === false) {
                throw new Error(res.data?.error || "No se pudo actualizar la foto.");
            }

            const updatedUser = res.data?.user || {
                ...user,
                foto_perfil: res.data?.foto_perfil || user.foto_perfil,
            };

            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("userPhoto", updatedUser.foto_perfil || "");

            closeProfileModal();
        } catch (err) {
            console.error("Error al subir foto:", err);
            setError(
                err.response?.data?.error ||
                err.message ||
                "No se pudo actualizar la foto de perfil."
            );
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <header className="ah-header">
                <div className="ah-container">
                    <div className="ah-left">
                        <button
                            className="ah-menu"
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            aria-label="Abrir menú"
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
                                    to="/admin/productos"
                                    className="ah-drop-item"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    <FaBoxOpen /> Productos
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
                            <img src={fotoPerfil} alt="Avatar" />
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

                    <button
                        type="button"
                        className="ah-drawer-close"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <FaTimes />
                    </button>
                </div>

                <nav className="ah-drawer-nav">
                    <button
                        className="ah-drawer-link"
                        type="button"
                        onClick={() => {
                            setShowProfileModal(true);
                            setDrawerOpen(false);
                        }}
                    >
                        <FaCamera /> Cambiar foto de perfil
                    </button>

                    <Link
                        to="/admin/mis-mascotas"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaPaw /> Mis mascotas
                    </Link>

                    <Link
                        to="/admin/productos"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaBoxOpen /> Productos
                    </Link>

                    <Link
                        to="/admin"
                        className="ah-drawer-link"
                        onClick={() => setDrawerOpen(false)}
                    >
                        <FaHome /> Dashboard
                    </Link>
                </nav>

                <div className="ah-drawer-foot">
                    <button className="ah-drawer-logout" onClick={handleLogout}>
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
                                {fotoPerfil ? (
                                    <img src={fotoPerfil} alt="Foto actual" />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {error && <p className="ah-modal-error">{error}</p>}

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
}

export default AdminHeader;