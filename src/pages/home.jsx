import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";
import "./home.css";
import Imagenes from "../assets/Imagenes";

import { Container, Row, Col, Button } from "react-bootstrap";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";
import ControlledCarousel from "../components/Carrusel/carrusel";

function Homepage() {
	return (
		<div className="Homepage">
			<Header />
			<Barnav />
			<WhatsAppButton />
			<div>
				<header className="header">
					<h1 className="title">Bienvenido a SmartPet</h1>
					<p className="subtitle">
						Collares inteligentes para tus mascotas
					</p>
					<Button
						variant="primary"
						onClick={() => {
							window.open(
								"https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmarPet!",
								"_blank"
							);
						}}
						className="cta-button"
					>
						Comprar Ahora
					</Button>
				</header>

				<section className="section section-body">
					<Container>
						<Row>
							<Col md={7} sm={12} lg={8}>
								<h2>¿Qué es SmartPet?</h2>
								<p>
									SmartPet es un colgante identificatorio para
									mascotas que ofrece dos opciones para
									acceder a la información de tu mascota.
									Puedes escanear el código QR con la cámara
									de tu teléfono o utilizar el chip
									inteligente basado en NFC. Al acercar tu
									teléfono al chip NFC, serás redirigido
									automáticamente a una base de datos en línea
									donde se encuentran los datos de la mascota.
									De esta manera, cualquier persona puede
									acceder a la información utilizando el QR o
									el NFC.
								</p>
							</Col>
							<Col md={5} sm={12} lg={4}>
								<div className="container-carrusel">
									<ControlledCarousel
										a={Imagenes.imgs5}
										b={Imagenes.imgs1}
										c={Imagenes.imgs3}
										d={Imagenes.imgs2}
										IMGCarrusel="ImgCarrusel "
									/>
								</div>
								<img
									src={Imagenes.imgs5}
									alt="SmartPet Collars"
									className="img-fluid imgs-body esconder"
								/>
							</Col>
						</Row>
					</Container>
				</section>

				<section className="section section-body bg-light">
					<Container>
						<Row>
							<Col md={5} sm={12} lg={4} className="esconder">
								<img
									src={Imagenes.imgs1}
									alt="Pet with SmartPet Collar"
									className="img-fluid imgs-body esconder"
								/>
							</Col>
							<Col md={7} sm={12} lg={8}>
								<h2>¿Cómo funciona SmartPet?</h2>
								<p>
									El usuario recibe el colgante con un código
									de 4 letras y 3 números, único e
									irrepetible. El usuario se registra en la
									página de SmartPet y agrega el código para
									poder configurar su mascota. La base de
									datos contiene una imagen de la mascota,
									nombre, sexo, ciudad, edad, descripción
									(tratamientos importantes), y contactos de 2
									personas con botones de acceso directo a
									Instagram, llamada telefónica y WhatsApp.
								</p>
							</Col>
						</Row>
					</Container>
				</section>

				<section className="section section-body ">
					<Container>
						<Row>
							<Col md={7} sm={12} lg={8}>
								<h2>Características Únicas</h2>
								<p>
									La digitalización de los datos no sensibles
									y útiles de tu mascota con solo escanear un
									QR o acercar el teléfono celular al collar.
									Están hechos con resina epoxi, altamente
									personalizables, y también ofrecemos
									collares sublimados con diseños
									personalizados.
								</p>
							</Col>
							<Col md={5} sm={12} lg={4} className="esconder">
								<img
									src={Imagenes.imgs4}
									alt="Customizable SmartPet Collars"
									className="img-fluid imgs-body esconder"
								/>
							</Col>
						</Row>
					</Container>
				</section>

				<section className="section section-body bg-light">
					<Container>
						<Row>
							<Col md={5} sm={8} lg={4} className="esconder">
								<img
									src={Imagenes.imgs3}
									alt="Pet with SmartPet Collar"
									className="img-fluid imgs-body esconder"
								/>
							</Col>
							<Col md={7} sm={12} lg={8} col={6}>
								<h2>Opciones de Personalización</h2>
								<p>
									Puedes escoger el color, tamaño, el uso o no
									de chip NFC, y editar el contenido de la
									base de datos de tu mascota. La producción
									de un collar personalizado lleva de 3 a 5
									días. Los collares sublimados se entregan en
									1 a 2 días.
								</p>
							</Col>
						</Row>
					</Container>
				</section>
			</div>
			<Footers />
		</div>
	);
}

export default Homepage;
