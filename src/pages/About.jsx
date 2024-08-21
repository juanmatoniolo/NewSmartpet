import React from "react";
import "./about.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";

import equipo from "../assets/img-jm-minerva.jpg";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";
// Puedes agregar más imágenes aquí si es necesario

function About() {
	return (
		<>
			<Header />
			<Barnav />
			<WhatsAppButton
				mensaje={"Hola estoy interesado en adquirir un collar smartpet"}
			/>
			<div className="container-fluid contenedror-container">
				<div class="about-us-container">
					<div class="row-container-us">
						<div class="column">
							<div class="about-us-card">
								<div class="card-body">
									<h2 class="card-title">
										Historia de SmartPet
									</h2>
									<p class="card-text">
										En mayo de 2023, Minerva, mi querida
										perrita, se perdió en Rosario. La
										chapita de identificación tenía un error
										en el número de teléfono, lo que
										complicó su regreso a casa. Por suerte,
										cuando las personas marcaron el segundo
										número, lograron contactarme y recuperé
										a Minerva. Este incidente, junto con mi
										reciente incursión en la programación,
										me inspiró a crear SmartPet.
									</p>
									<p class="card-text">
										La chispa para SmartPet surgió de un
										video en TikTok sobre chips NFC, un
										curso de programación web, y la
										experiencia de haber perdido a Minerva.
										Decidí combinar estos elementos y
										desarrollar una solución tecnológica
										para evitar que otros pasaran por lo
										mismo.
									</p>
									<p class="card-text">
										El viaje no fue fácil. Después de
										escribir el código y diseñar la
										estructura web, necesitaba
										materializarlo. Tras muchas horas de
										investigación, encontré la resina epoxi,
										ideal para crear collares coloridos y
										proteger el chip NFC.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div class="column">
						<div class="about-us-card">
							<div class="card-body">
								<h2 class="card-title">Misión y Visión</h2>
								<p class="card-text">
									En SmartPet, nuestra misión es garantizar
									que, si tu mascota se pierde, la persona que
									la encuentre pueda acceder rápidamente a su
									información de contacto. Con un simple
									escaneo del collar (a través de QR o NFC),
									podrán visitar la página de la mascota y
									comunicarse contigo de inmediato.
								</p>
								<p class="card-text">
									Nuestra visión a largo plazo es permitir que
									los dueños de mascotas actualicen fácilmente
									la información de sus mascotas en cualquier
									momento. Queremos que puedas mantener el
									collar actualizado sin tener que
									reemplazarlo, asegurando que los datos estén
									siempre correctos y accesibles.
								</p>
							</div>
						</div>
					</div>

					<div class="column">
						<div class="about-us-card">
							<div class="card-body">
								<h2 class="card-title">El Equipo</h2>
								<div class="row row-peq">
									<div class="column">
										<p class="card-text">
											Soy Juan Manuel Toniolo, el creador
											de SmartPet. Aunque trabajo solo en
											la programación, he recibido un gran
											apoyo de amigos y familiares que
											creen en este proyecto. Avanzo
											lentamente debido a mi empleo a
											tiempo completo, pero continúo
											dedicando mis tiempos libres a este
											emprendimiento apasionante.
										</p>
									</div>
									<div class="column image-container">
										<img
											src={equipo}
											alt="Equipo SmartPet"
											class="about-us-image"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div class="row-container-us">
						<div class="column">
							<div class="about-us-card">
								<div class="card-body">
									<h2 class="card-title">
										Productos y Servicios
									</h2>
									<p class="card-text">
										En SmartPet, ofrecemos collares de
										resina epoxi o sublimados,
										personalizados con el nombre de tu
										mascota y un código QR. Al escanear el
										QR, se accede a una página con los datos
										de contacto de la mascota, permitiendo
										una comunicación rápida y eficiente.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Footers />
		</>
	);
}

export default About;
