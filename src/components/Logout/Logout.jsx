import React from "react";
import Img from "../../assets/Imagenes";
import { Link } from "react-router-dom";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Container } from "react-bootstrap";
import "../container/body.css"


function Logout() {
	return (
		<>
			<header className="headersmart">
				<div className="imglogo">
					<Link to="/Consultas">
						{" "}
						<img
							src={Img.img1}
							className="imglogopng"
							alt="Logo smartpet"
						/>
					</Link>
				</div>
				<div className="login">
					<div className="registrar">
						<Link to="/">
							<button className="btn btn2">Logout</button>
						</Link>
					</div>
				</div>
			</header>

			<Navbar expand="sm" className="navbar-container">
				<Container fluid>
					<Navbar.Toggle aria-controls="offcanvasNavbar-expand-xl" />
					<Navbar.Offcanvas
						id="offcanvasNavbar-expand-xl"
						aria-labelledby="offcanvasNavbarLabel-expand-xl"
						placement="end"
					>
						<Offcanvas.Header closeButton>
							<Offcanvas.Title id="offcanvasNavbarLabel-expand-xl">
								Usuario + Smartpet
							</Offcanvas.Title>
						</Offcanvas.Header>
						<Offcanvas.Body>
							<Nav className="linkscontainer">
								<Nav.Link as={Link} to="/">
									Home
								</Nav.Link>
								<Nav.Link as={Link} to="/about">
									Mis mascotas
								</Nav.Link>
							</Nav>
						</Offcanvas.Body>
					</Navbar.Offcanvas>
				</Container>
			</Navbar>
		</>
	);
}

export default Logout;
