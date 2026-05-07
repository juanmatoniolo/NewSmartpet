import React, { useEffect } from "react";
import "./about.css";
import SmartHeader from "../components/nav/SmartHeader";
import Footers from "../components/footer/Footer";
import equipo from "../assets/img-jm-minerva.jpg";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";

const WA_LINK = "https://wa.me/+5493412275598?text=Hola%20estoy%20interesado%20en%20adquirir%20un%20collar%20smartpet";

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

			<main className="ab-main">

				{/* HERO */}
				<section className="ab-hero" aria-labelledby="about-title">
					<p className="ab-eyebrow">Nuestra historia</p>
					<h1 id="about-title" className="ab-hero-title">
						Nació de perder a <span className="ab-highlight">Minerva</span>
					</h1>
					<p className="ab-hero-sub">
						Un error en una chapita, una mascota perdida, y la determinación de que no le pasara a nadie más.
						Así empezó SmartPet.
					</p>
				</section>

				<div className="ab-content">

					{/* HISTORIA */}
					<section className="ab-section" aria-labelledby="historia-title">
						<div className="ab-section-inner ab-section-inner--reverse">
							<div className="ab-text">
								<span className="sp-label">La historia</span>
								<h2 id="historia-title" className="ab-section-title">
									Mayo de 2023 — Minerva desaparece
								</h2>
								<p>
									En mayo de 2023, Minerva, mi querida perrita, se perdió en Rosario.
									La chapita de identificación tenía un error en el número de teléfono,
									lo que complicó mucho su regreso a casa. Por suerte, cuando las personas
									marcaron el segundo número, lograron contactarme y la recuperé.
								</p>
								<p>
									Ese mismo año estaba aprendiendo a programar. Un video en TikTok sobre
									chips NFC, un curso de desarrollo web y esta experiencia se combinaron
									en una sola idea: crear un collar que nunca falle en lo más importante,
									que alguien pueda contactarte al instante.
								</p>
								<p>
									El camino no fue fácil. Escribir el código, diseñar la plataforma,
									y luego encontrar el material físico ideal. Después de mucha
									investigación, llegué a la resina epoxi: duradera, colorida,
									y perfecta para proteger el chip NFC.
								</p>
							</div>
							<div className="ab-image-wrap">
								<img
									src={equipo}
									alt="Juan Manuel Toniolo con Minerva, la perrita que inspiró SmartPet"
									className="ab-image"
									loading="lazy"
									width="400"
									height="300"
								/>
								<div className="ab-image-caption">Juan Manuel y Minerva 🐾</div>
							</div>
						</div>
					</section>

					{/* MISION Y VISION */}
					<section className="ab-section ab-section--alt" aria-labelledby="mision-title">
						<div className="ab-cards-grid">
							<div className="ab-card">
								<div className="ab-card-icon">🎯</div>
								<h2 id="mision-title" className="ab-card-title">Misión</h2>
								<p>
									Garantizar que si tu mascota se pierde, quien la encuentre pueda
									contactarte de inmediato. Con un simple escaneo del collar — QR o NFC —
									acceden a su información y te llega un aviso al instante.
								</p>
							</div>
							<div className="ab-card">
								<div className="ab-card-icon">🔭</div>
								<h2 className="ab-card-title">Visión</h2>
								<p>
									Que los dueños puedan actualizar los datos de su mascota en cualquier
									momento, sin reemplazar el collar. La información siempre correcta,
									siempre accesible, de por vida.
								</p>
							</div>
							<div className="ab-card">
								<div className="ab-card-icon">🛠️</div>
								<h2 className="ab-card-title">Productos</h2>
								<p>
									Collares de resina epoxi o sublimados, personalizados con el nombre
									de tu mascota y un código QR. Al escanearlo, se accede a su perfil
									con tus datos de contacto.
								</p>
							</div>
						</div>
					</section>

					{/* EQUIPO */}
					<section className="ab-section" aria-labelledby="equipo-title">
						<div className="ab-founder">
							<span className="sp-label">El equipo</span>
							<h2 id="equipo-title" className="ab-section-title">
								Un proyecto hecho con propósito
							</h2>
							<div className="ab-founder-card">
								<div className="ab-founder-avatar">JM</div>
								<div className="ab-founder-info">
									<h3 className="ab-founder-name">Juan Manuel Toniolo</h3>
									<p className="ab-founder-role">Fundador & Desarrollador</p>
									<p>
										Trabajo solo en la programación, pero con el apoyo de amigos y
										familia que creen en este proyecto. Avanzo a mi ritmo —
										tengo empleo a tiempo completo — pero cada hora libre la
										dedico a SmartPet con la misma convicción del primer día.
									</p>
									<button
										className="ab-cta"
										onClick={() => window.open(WA_LINK, "_blank", "noopener,noreferrer")}
										type="button"
										aria-label="Escribir a Juan Manuel por WhatsApp"
									>
										Escribirme por WhatsApp 💬
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* VALORES */}
					<section className="ab-section ab-section--alt" aria-labelledby="valores-title">
						<span className="sp-label" style={{ display: "block", textAlign: "center", marginBottom: "0.5rem" }}>
							Lo que nos mueve
						</span>
						<h2 id="valores-title" className="ab-section-title" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
							Nuestros valores
						</h2>
						<div className="ab-valores-grid">
							<div className="ab-valor">
								<span className="ab-valor-icon">❤️</span>
								<h3>Empatía</h3>
								<p>Cada collar nació de una experiencia real. Sabemos lo que se siente perder una mascota.</p>
							</div>
							<div className="ab-valor">
								<span className="ab-valor-icon">🔍</span>
								<h3>Honestidad</h3>
								<p>Sin promesas exageradas. SmartPet no es GPS continuo — es un aviso inmediato cuando alguien escanea el collar.</p>
							</div>
							<div className="ab-valor">
								<span className="ab-valor-icon">⚡</span>
								<h3>Simplicidad</h3>
								<p>Sin apps, sin baterías, sin suscripciones. Tecnología que funciona sin que tengas que pensar en ella.</p>
							</div>
							<div className="ab-valor">
								<span className="ab-valor-icon">🌱</span>
								<h3>Crecimiento</h3>
								<p>Un emprendimiento que avanza despacio pero con propósito, mejorando con cada collar que sale.</p>
							</div>
						</div>
					</section>

				</div>
			</main>

			<Footers />
		</>
	);
}

export default About;