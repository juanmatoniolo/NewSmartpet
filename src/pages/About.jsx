// About.jsx
import React, { useEffect } from "react";
import "./about.css";
import SmartHeader from "../components/nav/SmartHeader";
import Footers from "../components/footer/Footer";
import equipo from "../assets/img-jm-minerva.jpg";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";

function About() {
	useEffect(() => {
		document.title = "Nosotros | SmartPet - Collares inteligentes para mascotas";
		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				"Conocé la historia de SmartPet, nuestra misión y el equipo detrás de los collares inteligentes con QR y NFC para mascotas."
			);
		}
	}, []);

	return (
		<>
			<SmartHeader />
			<WhatsAppButton mensaje="Hola estoy interesado en adquirir un collar smartpet" />
			<main className="about-page">
				<div className="about-container">
					<h1 className="about-heading">Sobre SmartPet</h1>
					<section className="about-grid">
						<article className="about-card">
							<h2>Historia de SmartPet</h2>
							<p>
								En mayo de 2023, Minerva, mi querida perrita, se perdió en Rosario.
								La chapita de identificación tenía un error en el número de teléfono,
								lo que complicó su regreso a casa. Por suerte, cuando las personas
								marcaron el segundo número, lograron contactarme y recuperé a Minerva.
								Este incidente, junto con mi reciente incursión en la programación,
								me inspiró a crear SmartPet.
							</p>
							<p>
								La chispa para SmartPet surgió de un video en TikTok sobre chips NFC,
								un curso de programación web, y la experiencia de haber perdido a Minerva.
								Decidí combinar estos elementos y desarrollar una solución tecnológica
								para evitar que otros pasaran por lo mismo.
							</p>
							<p>
								El viaje no fue fácil. Después de escribir el código y diseñar la
								estructura web, necesitaba materializarlo. Tras muchas horas de
								investigación, encontré la resina epoxi, ideal para crear collares
								coloridos y proteger el chip NFC.
							</p>
						</article>

						<article className="about-card">
							<h2>Misión y Visión</h2>
							<p>
								En SmartPet, nuestra misión es garantizar que, si tu mascota se pierde,
								la persona que la encuentre pueda acceder rápidamente a su información
								de contacto. Con un simple escaneo del collar (a través de QR o NFC),
								podrán visitar la página de la mascota y comunicarse contigo de inmediato.
							</p>
							<p>
								Nuestra visión a largo plazo es permitir que los dueños de mascotas
								actualicen fácilmente la información de sus mascotas en cualquier momento.
								Queremos que puedas mantener el collar actualizado sin tener que
								reemplazarlo, asegurando que los datos estén siempre correctos y accesibles.
							</p>
						</article>

						<article className="about-card about-card--team">
							<h2>El Equipo</h2>
							<div className="team-content">
								<div className="team-text">
									<p>
										Soy Juan Manuel Toniolo, el creador de SmartPet. Aunque trabajo solo
										en la programación, he recibido un gran apoyo de amigos y familiares
										que creen en este proyecto. Avanzo lentamente debido a mi empleo a
										tiempo completo, pero continúo dedicando mis tiempos libres a este
										emprendimiento apasionante.
									</p>
								</div>
								<div className="team-image">
									<img
										src={equipo}
										alt="Juan Manuel Toniolo, creador de SmartPet"
										loading="lazy"
										width="400"
										height="300"
									/>
								</div>
							</div>
						</article>

						<article className="about-card about-card--full">
							<h2>Productos y Servicios</h2>
							<p>
								En SmartPet, ofrecemos collares de resina epoxi o sublimados,
								personalizados con el nombre de tu mascota y un código QR. Al escanear
								el QR, se accede a una página con los datos de contacto de la mascota,
								permitiendo una comunicación rápida y eficiente.
							</p>
						</article>
					</section>
				</div>
			</main>
			<Footers />
		</>
	);
}

export default About;