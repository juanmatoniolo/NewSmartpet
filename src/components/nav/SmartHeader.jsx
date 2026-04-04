import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SmartHeader.css";
import Img from "../../assets/Imagenes";

function SmartHeader() {
	const navigate = useNavigate();

	const handleNavClick = (sectionId) => {
		navigate("/");
		setTimeout(() => {
			document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
		}, 300);
	};

	return (
		<header className="sp-header" role="banner">
			<div className="sp-inner">

				{/* Logo */}
				<Link to="/" className="sp-logo" aria-label="SmartPet - Inicio">
					{/* <img src={Img.img1} alt="SmartPet" className="sp-logo-img" /> */}
					<span className="sp-brand">Smart<span>Pet</span></span>
				</Link>

				{/* Nav links */}
				<nav className="sp-nav" aria-label="Navegación principal">
					<button className="sp-navlink" onClick={() => handleNavClick("About")}>Nosotros</button>
					<button className="sp-navlink" onClick={() => handleNavClick("Contact")}>Contacto</button>
					<button className="sp-navlink" onClick={() => handleNavClick("Buy")}>Comprar</button>
				</nav>

				{/* Auth */}
				<div className="sp-auth">
					<Link to="/login">
						<button className="sp-btn-in" aria-label="Iniciar sesión">Entrar</button>
					</Link>
					<div className="sp-divider" aria-hidden="true" />
					<Link to="/Register">
						<button className="sp-btn-reg" aria-label="Crear cuenta">Registro</button>
					</Link>
				</div>

			</div>
		</header>
	);
}

export default SmartHeader;