import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
	FaSignOutAlt,
	FaCog,
	FaUser,
	FaCalendarAlt,
	FaHome
} from "react-icons/fa";
import API_BASE from "../../config/api";
import "./HeaderLogout.css";

const HeaderLogout = () => {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [fotoPerfil, setFotoPerfil] = useState("");
	const [nombreUsuario, setNombreUsuario] = useState("Usuario");
	const [refreshKey, setRefreshKey] = useState(Date.now());

	const menuRef = useRef(null);
	const userId = localStorage.getItem("userId");

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

	const cargarDatosUsuario = useCallback(async () => {
		if (!userId) return;

		try {
			const res = await fetch(`${API_BASE}/index.php/usuarios/${userId}`);
			const data = await res.json();

			if (!res.ok || data.success === false) {
				throw new Error(data.error || "No se pudo cargar el usuario");
			}

			const user = data.user || data.data || data;
			const nombreCompleto = `${user.nombre || ""} ${user.apellido || ""}`.trim();

			setNombreUsuario(nombreCompleto || "Usuario");

			if (user.foto_perfil) {
				setFotoPerfil(buildImageUrl(user.foto_perfil));
				setRefreshKey(Date.now());
			} else {
				setFotoPerfil("");
			}

			localStorage.setItem("user", JSON.stringify(user));
		} catch (error) {
			console.error("Error al cargar perfil:", error);

			const userStr = localStorage.getItem("user");

			if (!userStr) return;

			try {
				const localUser = JSON.parse(userStr);
				const nombreCompleto = `${localUser.nombre || ""} ${localUser.apellido || ""}`.trim();

				setNombreUsuario(nombreCompleto || "Usuario");

				if (localUser.foto_perfil) {
					setFotoPerfil(buildImageUrl(localUser.foto_perfil));
					setRefreshKey(Date.now());
				} else {
					setFotoPerfil("");
				}
			} catch {
				setNombreUsuario("Usuario");
				setFotoPerfil("");
			}
		}
	}, [userId]);

	useEffect(() => {
		cargarDatosUsuario();
	}, [cargarDatosUsuario]);

	useEffect(() => {
		const handleUserUpdate = (event) => {
			if (event?.detail?.foto_perfil) {
				setFotoPerfil(buildImageUrl(event.detail.foto_perfil));
				setRefreshKey(Date.now());
			}

			cargarDatosUsuario();
		};

		window.addEventListener("userPhotoUpdated", handleUserUpdate);
		window.addEventListener("userDataUpdated", handleUserUpdate);

		return () => {
			window.removeEventListener("userPhotoUpdated", handleUserUpdate);
			window.removeEventListener("userDataUpdated", handleUserUpdate);
		};
	}, [cargarDatosUsuario]);

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("userId");
		localStorage.removeItem("userEmail");
		localStorage.removeItem("user");
		navigate("/login");
	};

	const handleGoHome = (e) => {
		e.preventDefault();

		if (userId) {
			navigate(`/Consultas/${userId}`);
		} else {
			navigate("/");
		}

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
			const res = await fetch(`${API_BASE}/index.php/mascotas?usuario_id=${userId}`);
			const data = await res.json();

			const mascotas = Array.isArray(data) ? data : data.mascotas || data.data || [];

			if (mascotas.length > 0) {
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

	const handleGoToInicio = () => {
		if (userId) {
			navigate(`/Consultas/${userId}`);
		} else {
			navigate("/");
		}

		setMenuOpen(false);
	};

	const handleToggleMenu = () => {
		setMenuOpen((prev) => !prev);
	};

	const fotoUrl = fotoPerfil ? `${fotoPerfil}?v=${refreshKey}` : null;

	return (
		<header className="smart-header">
			<div className="sp-inner">
				<div className="sp-left">
					<Link
						to="/"
						onClick={handleGoHome}
						className="sp-logo"
						aria-label="SmartPet - Ir al inicio"
					>
						<span className="sp-brand">
							Smart<span>Pet</span>
						</span>
					</Link>
				</div>

				<div className="header-right" ref={menuRef}>
					<button
						className="profile-btn"
						onClick={handleToggleMenu}
						aria-label="Menú de usuario"
						aria-expanded={menuOpen}
						type="button"
					>
						<div className="profile-avatar">
							{fotoUrl ? (
								<img
									key={fotoUrl}
									src={fotoUrl}
									alt={`Foto de perfil de ${nombreUsuario}`}
									loading="lazy"
									onError={() => setFotoPerfil("")}
								/>
							) : (
								<FaUser />
							)}
						</div>

						<span className="user-name">{nombreUsuario}</span>

						<span
							className={`avatar-badge ${menuOpen ? "open" : ""}`}
							aria-hidden="true"
						>
							▼
						</span>
					</button>

					<div className={`profile-menu ${menuOpen ? "open" : ""}`}>
						<button className="menu-item" onClick={handleGoToInicio} type="button">
							<FaHome />
							<span>Inicio</span>
						</button>

						<button className="menu-item" onClick={handleGoToConfiguracion} type="button">
							<FaCog />
							<span>Configuración</span>
						</button>

						<button className="menu-item" onClick={handleGoToAgenda} type="button">
							<FaCalendarAlt />
							<span>Agenda</span>
						</button>

						<button className="menu-item logout" onClick={handleLogout} type="button">
							<FaSignOutAlt />
							<span>Cerrar sesión</span>
						</button>
					</div>
				</div>
			</div>
		</header>
	);
};

export default HeaderLogout;