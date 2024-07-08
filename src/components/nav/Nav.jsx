import React from "react";
import "./nav.css";

import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";

function Barnav() {
	return (
		<Navbar expand="xl" className="navbar-container">
			<Container fluid>
				<Navbar.Toggle aria-controls="offcanvasNavbar-expand-xl" />
				<Navbar.Offcanvas
					id="offcanvasNavbar-expand-xl"
					aria-labelledby="offcanvasNavbarLabel-expand-xl"
					placement="end"
				>
					<Offcanvas.Header closeButton>
						<Offcanvas.Title id="offcanvasNavbarLabel-expand-xl">
							SmartPet
						</Offcanvas.Title>
					</Offcanvas.Header>
					<Offcanvas.Body>
						<Nav className="linkscontainer">
							<Nav.Link as={Link} to="/">
								Home
							</Nav.Link>
							<Nav.Link as={Link} to="/about">
								Nosotros
							</Nav.Link>
							<Nav.Link as={Link} to="/Collares">
								Modelos
							</Nav.Link>
							<Nav.Link as={Link} to="/Cod">
								Tengo un código
							</Nav.Link>
						</Nav>
					</Offcanvas.Body>
				</Navbar.Offcanvas>
			</Container>
		</Navbar>
	);
}

export default Barnav;
