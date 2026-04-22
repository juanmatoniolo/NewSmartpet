import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaUser, FaUsers, FaChartBar, FaHome, FaBars } from "react-icons/fa";
import { Helmet } from "react-helmet";
import "./AdminHeader.css";

const AdminHeader = () => {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState("");
    const menuRef = useRef(null);
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (user?.foto_perfil) {
            setFotoPerfil(user.foto_perfil);
        } else if (user?.id) {
            fetch(`http://localhost/api-smartpet/index.php/usuarios/${user.id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data?.foto_perfil) setFotoPerfil(data.foto_perfil);
                })
                .catch(console.error);
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const handleToggleMenu = () => setMenuOpen((prev) => !prev);
    const toggleMobileNav = () => setMobileMenuOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <>
            <Helmet>
                <title>SmartPet | Panel de Administración</title>
                <meta name="description" content="Administra usuarios, mascotas, códigos QR, contactos, historial y veterinarios de SmartPet." />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Helmet>

            <header className="admin-header">
                <div className="admin-header-inner">
                    <div className="admin-header-left">
                        <Link to="/admin" className="admin-logo" aria-label="Inicio del panel">
                            <span className="admin-brand">Smart<span>Pet</span></span>
                            <span className="admin-badge">Admin</span>
                        </Link>

                        {/* Desktop navigation */}
                        <nav className="admin-nav d-none d-md-flex">
                            <Link to="/admin" className="admin-nav-link"><FaChartBar /> Dashboard</Link>
                            <Link to="/admin/usuarios" className="admin-nav-link"><FaUsers /> Usuarios</Link>
                        </nav>

                        {/* Mobile menu button */}
                        <button className="mobile-nav-toggle d-md-none" onClick={toggleMobileNav} aria-label="Menú de navegación">
                            <FaBars />
                        </button>
                    </div>

                    <div className="admin-header-right" ref={menuRef}>
                        <button
                            className="admin-profile-btn"
                            onClick={handleToggleMenu}
                            aria-label="Menú de perfil"
                            aria-expanded={menuOpen}
                        >
                            <div className="admin-avatar">
                                {fotoPerfil ? <img src={fotoPerfil} alt="Avatar" /> : <FaUser />}
                            </div>
                            <span className="admin-name">{user?.nombre || "Admin"}</span>
                            <span className={`avatar-badge ${menuOpen ? "open" : ""}`}>▼</span>
                        </button>

                        <div className={`admin-menu ${menuOpen ? "open" : ""}`}>
                            <Link to="/" className="menu-item"><FaHome /> Ver sitio</Link>
                            <button className="menu-item logout" onClick={handleLogout}><FaSignOutAlt /> Cerrar sesión</button>
                        </div>
                    </div>
                </div>

                {/* Mobile navigation drawer */}
                <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
                    <nav className="mobile-nav">
                        <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}><FaChartBar /> Dashboard</Link>
                        <Link to="/admin/usuarios" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}><FaUsers /> Usuarios</Link>
                    </nav>
                </div>
                {mobileMenuOpen && <div className="mobile-nav-overlay" onClick={() => setMobileMenuOpen(false)}></div>}
            </header>
        </>
    );
};

export default AdminHeader;