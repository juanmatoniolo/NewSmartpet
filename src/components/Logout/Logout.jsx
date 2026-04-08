import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaCog, FaUser, FaHome } from "react-icons/fa";
import "./HeaderLogout.css";

const HeaderLogout = () => {
	const navigate = useNavigate();
	const [menuOpen, setMenuOpen] = useState(false);
	const [fotoPerfil, setFotoPerfil] = useState("");
	const menuRef = useRef(null);
	const userId = localStorage.getItem("userId");

	useEffect(() => {
		let isMounted = true;

		const fetchPerfil = async () => {
			if (!userId) return;

			try {
				const res = await fetch(`http://localhost/api-smartpet/index.php/usuarios/${userId}`);
				const data = await res.json();

				if (isMounted && data && data.foto_perfil) {
					setFotoPerfil(data.foto_perfil);
				}
			} catch (error) {
				console.error("Error al cargar foto de perfil:", error);
			}
		};

		fetchPerfil();

		return () => {
			isMounted = false;
		};
	}, [userId]);

	const handleLogout = () => {
		localStorage.removeItem("userId");
		localStorage.removeItem("userEmail");
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

	const handleToggleMenu = () => {
		setMenuOpen((prev) => !prev);
	};

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
						aria-haspopup="true"
						title="Configuración y sesión"
						type="button"
					>
						<div className="profile-avatar">
							{fotoPerfil ? (
								<img src={fotoPerfil} alt="Foto de perfil" />
							) : (
								<FaUser />
							)}
						</div>
						<span className={`avatar-badge ${menuOpen ? "open" : ""}`} aria-hidden="true">
							▼
						</span>
					</button>

					<div className={`profile-menu ${menuOpen ? "open" : ""}`}>
						<button
							className="menu-item"
							onClick={handleGoToConfiguracion}
							type="button"
						>
							<FaCog />
							<span>Configuración</span>
						</button>

						<button
							className="menu-item logout"
							onClick={handleLogout}
							type="button"
						>
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