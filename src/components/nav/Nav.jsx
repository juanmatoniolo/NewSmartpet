import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import "./nav.css";
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
		<header className="smart-header">
			<Navbar className="navbar-gradient container-navbar-header" sticky="top">
				<div className="container-fluid container-header">
					<div className="contenedor-header-1">

						{/* Logo */}
						<Navbar.Brand href="/" className="d-flex align-items-center contenedor-img-header">
							<img src={Img.img1} alt="SmartPet Logo" className="logo-img" />
						</Navbar.Brand>
						<div className="auth-buttons d-flex gap-2">
							<Link to="/login">
								<Button variant="light" className="rounded-pill px-4 fw-bold btn1">
									Entrar
								</Button>
							</Link>
							<Link to="/Register">
								<Button variant="outline-light" className="rounded-pill px-4 fw-bold btn2">
									Registro
								</Button>
							</Link>
						</div>
					</div>

					{/* Enlaces del menú (siempre visibles) */}
					<Nav className="d-flex gap-4 contendor-links-header align-items-center">

						<button className="btn btn-link nav-link fw-bold text-white" onClick={() => handleNavClick("About")}>
							Nosotros
						</button>
						<button className="btn btn-link nav-link fw-bold text-white" onClick={() => handleNavClick("Contact")}>
							Contacto
						</button>
						<button className="btn btn-link nav-link fw-bold text-white" onClick={() => handleNavClick("Buy")}>
							Comprar
						</button>
					</Nav>

					{/* Botones de autenticación */}

				</div>
			</Navbar>
		</header>
	);
}

export default SmartHeader;
