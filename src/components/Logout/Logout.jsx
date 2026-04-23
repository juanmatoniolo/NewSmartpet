import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCog, FaUser, FaCalendarAlt, FaHome } from "react-icons/fa";
import "./HeaderLogout.css";

const HeaderLogout = () => {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [fotoPerfil, setFotoPerfil] = useState("");
	const [nombreUsuario, setNombreUsuario] = useState("");
	const [refreshKey, setRefreshKey] = useState(Date.now());
	const menuRef = useRef(null);
	const userId = localStorage.getItem("userId");

	const cargarDatosUsuario = async () => {
		if (!userId) return;
		try {
			const res = await fetch(`http://localhost/api-smartpet/index.php/usuarios/${userId}`);
			const data = await res.json();
			if (data) {
				setNombreUsuario(`${data.nombre} ${data.apellido || ""}`.trim());
				if (data.foto_perfil) {
					setFotoPerfil(data.foto_perfil);
					setRefreshKey(Date.now());
				}
			}
		} catch (error) {
			console.error("Error al cargar perfil:", error);
		}
	};

	useEffect(() => {
		cargarDatosUsuario();
	}, [userId]);

	useEffect(() => {
		const handlePhotoUpdate = () => cargarDatosUsuario();
		window.addEventListener("userPhotoUpdated", handlePhotoUpdate);
		return () => window.removeEventListener("userPhotoUpdated", handlePhotoUpdate);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("userId");
		localStorage.removeItem("userEmail");
		navigate("/login");
	};

	const handleGoHome = (e) => {
		e.preventDefault();
		if (userId) navigate(`/Consultas/${userId}`);
		else navigate("/");
		setMenuOpen(false);
	};

	const handleGoToConfiguracion = () => {
		navigate("/configuracion");
		setMenuOpen(false);
	};

	const handleGoToAgenda = async () => {
		if (!userId) {
			alert("No hay usuario autenticado");
			setMenuOpen(false);
			return;
		}

		try {
			const res = await fetch(`http://localhost/api-smartpet/index.php/mascotas?usuario_id=${userId}`);
			const mascotas = await res.json();

			if (Array.isArray(mascotas) && mascotas.length > 0) {
				// Redirige a la agenda de la primera mascota
				navigate(`/agenda/${mascotas[0].id}`);
			} else {
				alert("No tienes mascotas registradas. Agrega una desde tu panel.");
			}
		} catch (error) {
			console.error("Error al obtener mascotas:", error);
			alert("No se pudo cargar la información de tus mascotas.");
		}

		setMenuOpen(false);
	};

	const handleToggleMenu = () => setMenuOpen(prev => !prev);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const fotoUrl = fotoPerfil ? `${fotoPerfil}?t=${refreshKey}` : null;

	return (
		<header className="smart-header">
			<div className="sp-inner">
				<div className="sp-left">
					<Link to="/" onClick={handleGoHome} className="sp-logo" aria-label="SmartPet - Ir al inicio">
						<span className="sp-brand">Smart<span>Pet</span></span>
					</Link>
				</div>

				<div className="header-right" ref={menuRef}>
					<button className="profile-btn" onClick={handleToggleMenu} aria-label="Menú de usuario" aria-expanded={menuOpen} type="button">
						<div className="profile-avatar">
							{fotoUrl ? <img src={fotoUrl} alt="Foto de perfil" /> : <FaUser />}
						</div>
						<span className="user-name">{nombreUsuario || "Usuario"}</span>
						<span className={`avatar-badge ${menuOpen ? "open" : ""}`} aria-hidden="true">▼</span>
					</button>

					<div className={`profile-menu ${menuOpen ? "open" : ""}`}>
						<button className="menu-item" onClick={handleGoToConfiguracion} type="button">
							<FaCog /> <span>Configuración</span>
						</button>
						<button className="menu-item" onClick={handleGoToAgenda} type="button">
							<FaCalendarAlt /> <span>Agenda</span>
						</button>
						<button className="menu-item logout" onClick={handleLogout} type="button">
							<FaSignOutAlt /> <span>Cerrar sesión</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default HeaderLogout;