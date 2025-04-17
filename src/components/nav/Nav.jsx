import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Button, NavDropdown } from "react-bootstrap";
import "./nav.css";
import Img from "../../assets/Imagenes";

function SmartHeader() {
	const [menuOpen, setMenuOpen] = useState(false);
	const navigate = useNavigate();

	const handleNavClick = (sectionId) => {
		setMenuOpen(false);
		navigate("/");
		setTimeout(() => {
			document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
		}, 300);
	};

	return (
		<header className="smart-header">
			{/* Navbar con gradiente y con estilo similar al ejemplo */}
			<Navbar expand="lg" className="navbar-gradient container-navbar-header" sticky="top">
				<div className="container-fluid container-header">
					<div className="contenedor-img-header">

						<Navbar.Brand href="#home" className="d-flex align-items-center">
							<img src={Img.img1} alt="SmartPet Logo" className="logo-img" />
						</Navbar.Brand>

						{/* Botones siempre visibles */}
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
					<div className="contendor-links-header">
						<Navbar.Toggle aria-controls="basic-navbar-nav" className="menu-hamburguesa" />

						<Navbar.Collapse id="basic-navbar-nav hamburguesa">
							<Nav className="me-auto hamburguesa">
								<Nav.Link as={Link} to="/" onClick={() => setMenuOpen(false)}>
									Inicio
								</Nav.Link>
								<button className="btn btn-link nav-link" onClick={() => handleNavClick("About")}>
									Nosotros
								</button>
								<button className="btn btn-link nav-link" onClick={() => handleNavClick("Contact")}>
									Contacto
								</button>
								<button className="btn btn-link nav-link" onClick={() => handleNavClick("Buy")}>
									Comprar
								</button>
							</Nav>
						</Navbar.Collapse>
					</div>
				</div>
			</Navbar>
		</header>
	);
}

export default SmartHeader;
