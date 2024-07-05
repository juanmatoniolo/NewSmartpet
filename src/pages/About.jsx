import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./about.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";

function About() {
	return (
		<>
			<Header />
			<Barnav />
			<div className="about-page">
				<header className="about-header">
					<h1>Sobre SmartPet</h1>
					<p>Conoce más sobre nosotros y nuestra misión.</p>
				</header>

				<section className="about-section">
					<div className="about-content">
						<h2>Nuestra Historia</h2>
						<p>
							SmartPet fue fundado con la misión de proporcionar
							soluciones innovadoras para la identificación y
							cuidado de mascotas. Nos esforzamos por hacer la
							vida más fácil para los dueños de mascotas al
							ofrecer collares inteligentes que permiten el acceso
							rápido a la información de la mascota mediante QR y
							NFC.
						</p>
					</div>
				</section>

				<section className="about-section">
					<div className="about-content">
						<h2>Nuestra Misión</h2>
						<p>
							Nuestra misión es mejorar la seguridad y el
							bienestar de las mascotas al ofrecer tecnologías
							avanzadas que permiten a los dueños de mascotas
							acceder y compartir información crucial de manera
							fácil y rápida.
						</p>
					</div>
				</section>

				<section className="about-section">
					<div className="about-content">
						<h2>Nuestros Valores</h2>
						<p>
							En SmartPet, valoramos la innovación, la calidad y
							la confianza. Trabajamos arduamente para asegurarnos
							de que nuestros productos sean confiables y
							efectivos, y nos comprometemos a mantenernos a la
							vanguardia de la tecnología para mascotas.
						</p>
					</div>
				</section>
			</div>
			<Footers />
		</>
	);
}

export default About;
