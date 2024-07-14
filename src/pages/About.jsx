import React from "react";
import "./about.css";
import { Container, Row, Col, Card, Image } from "react-bootstrap";
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
			<WhatsAppButton mensaje={'Hola estoy interesado en adquirir un collar smartpet'} />
			<Container className="about-us-container">
				<Row className="roe-container-us">
					<Col>
						<Card className="about-us-card">
							<Card.Body>
								<Card.Title>Historia de SmartPet</Card.Title>
								<Card.Text>
									En mayo de 2023, Minerva, mi querida
									perrita, se perdió en Rosario. La chapita de
									identificación tenía un error en el número
									de teléfono, lo que complicó su regreso a
									casa. Por suerte, cuando las personas
									marcaron el segundo número, lograron
									contactarme y recuperé a Minerva. Este
									incidente, junto con mi reciente incursión
									en la programación, me inspiró a crear
									SmartPet.
								</Card.Text>
								<Card.Text>
									La chispa para SmartPet surgió de un video
									en TikTok sobre chips NFC, un curso de
									programación web, y la experiencia de haber
									perdido a Minerva. Decidí combinar estos
									elementos y desarrollar una solución
									tecnológica para evitar que otros pasaran
									por lo mismo.
								</Card.Text>
								<Card.Text>
									El viaje no fue fácil. Después de escribir
									el código y diseñar la estructura web,
									necesitaba materializarlo. Tras muchas horas
									de investigación, encontré la resina epoxi,
									ideal para crear collares coloridos y
									proteger el chip NFC.
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				</Row>

				<Col md={5}>
					<Card className="about-us-card">
						<Card.Body>
							<Card.Title>Misión y Visión</Card.Title>
							<Card.Text>
								En SmartPet, nuestra misión es garantizar que,
								si tu mascota se pierde, la persona que la
								encuentre pueda acceder rápidamente a su
								información de contacto. Con un simple escaneo
								del collar (a través de QR o NFC), podrán
								visitar la página de la mascota y comunicarse
								contigo de inmediato.
							</Card.Text>
							<Card.Text>
								Nuestra visión a largo plazo es permitir que los
								dueños de mascotas actualicen fácilmente la
								información de sus mascotas en cualquier
								momento. Queremos que puedas mantener el collar
								actualizado sin tener que reemplazarlo,
								asegurando que los datos estén siempre correctos
								y accesibles.
							</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col md={6}>
					<Card className="about-us-card">
						<Card.Body>
							<Card.Title>El Equipo</Card.Title>
							<Row>
								<Col md={6}>
									<Card.Text>
										Soy Juan Manuel Toniolo, el creador de
										SmartPet. Aunque trabajo solo en la
										programación, he recibido un gran apoyo
										de amigos y familiares que creen en este
										proyecto. Avanzo lentamente debido a mi
										empleo a tiempo completo, pero continúo
										dedicando mis tiempos libres a este
										emprendimiento apasionante.
									</Card.Text>
								</Col>
								<Col
									md={6}
									className="d-flex align-items-center"
								>
									<Image
										src={equipo}
										className="about-us-image"
										fluid
									/>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>
				<Row>
					<Col>
						<Card className="about-us-card">
							<Card.Body>
								<Card.Title>Productos y Servicios</Card.Title>
								<Card.Text>
									En SmartPet, ofrecemos collares de resina
									epoxi o sublimados, personalizados con el
									nombre de tu mascota y un código QR. Al
									escanear el QR, se accede a una página con
									los datos de contacto de la mascota,
									permitiendo una comunicación rápida y
									eficiente.
								</Card.Text>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			</Container>
			<Footers />
		</>
	);
}

export default About;
