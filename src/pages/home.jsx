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
			<WhatsAppButton
				mensaje={"Hola estoy interesado en adquirir un collar SmartPet"}
			/>
			<div>
				<header className="header">
					<h1 className="title">Bienvenido a SmartPet</h1>
					<p className="subtitle">
						Innovación en Identificación para tus Mascotas
					</p>
					<Button
						variant="primary"
						onClick={() => {
							window.open(
								"https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!",
								"_blank"
							);
						}}
						className="cta-button"
					>
						Comprar Ahora
					</Button>
				</header>

				<section className="section section-body">
					<Container className="container-fluid
					">
						<Row className="fila-home">
							<Col md={7} sm={12} lg={8} className="columna-home">
								<h2>¿Qué es SmartPet?</h2>
								<p>
									SmartPet lleva la identificación de mascotas al siguiente nivel con la
									digitalización de su información. A través de un colgante personalizado con
									código QR y la opción de integrar un chip de aproximación para celulares
									ínteligentes, cualquier persona puede acceder a los datos esenciales de la
									mascota con un simple escaneo o acercando su teléfono. La base de datos
									asociada permite a los dueños actualizar la información de su mascota
									cuantas veces lo necesiten, asegurando que siempre esté al día. Además,
									cuenta con una función que guarda la última ubicación donde se escaneó,
									brindando una herramienta adicional en caso de extravío. Con botones de
									contacto directo a llamadas, WhatsApp e Instagram, SmartPet facilita la
									comunicación instantánea con los dueños, ayudando a reunir mascotas con sus
									familias de manera rápida y eficiente.
								</p>
							</Col>
							<Col md={5} sm={12} lg={4} className="columna-home2">
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
							<Col
								md={5}
								sm={12}
								lg={4}
								className="d-none d-md-block columna-home2"
							>
								<img
									src={Imagenes.imgs1}
									alt="Pet with SmartPet Collar"
									className="img-fluid imgs-body"
								/>
							</Col>
							<Col md={7} sm={12} lg={8} className="columna-home">
								<h2>¿Cómo Funciona SmartPet?</h2>
								<p>
									Registro Único: Al adquirir tu colgante SmartPet, recibirás un código único de 4
									letras y 3 números.
								</p>
								<p>
									Configuración Sencilla: Regístrate en nuestra página web y asocia el código a tu
									cuenta para configurar el perfil de tu mascota.
								</p>
								<p>
									Perfil Personalizado: Completa la información de tu mascota, incluyendo:
									<ul>
										<li>Foto</li>
										<li>Nombre</li>
										<li>Sexo</li>
										<li>Ciudad</li>
										<li>Edad</li>
										<li>Descripción (tratamientos importantes, características especiales)</li>
										<li>Contactos de hasta 2 personas, con accesos directos a Instagram, llamadas
											telefónicas y WhatsApp.</li>
									</ul>
								</p>
								<p>Actualización Continua: Puedes editar y actualizar la información de tu mascota en
									cualquier momento, asegurando que siempre esté vigente.</p>
							</Col>
						</Row>
					</Container>
				</section>

				<section className="section section-body">
					<Container>
						<Row  className="fila-home">
							<Col md={7} sm={12} lg={8}>
								<h2>Características Destacadas</h2>
								<p>
									La digitalización de los datos no sensibles y útiles de tu mascota con solo
									escanear un QR o acercar el teléfono celular al collar. Están hechos con resina
									epoxi, altamente personalizables, y también ofrecemos collares sublimados con
									diseños personalizados.
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
						<Row  className="fila-home">
							<Col md={5} sm={8} lg={4} className="esconder">
								<img
									src={Imagenes.imgs3}
									alt="Pet with SmartPet Collar"
									className="img-fluid imgs-body esconder"
								/>
							</Col>
							<Col md={7} sm={12} lg={8}>
								<h2>Opciones de Personalización</h2>
								<p>
									Puedes escoger el color, tamaño, el uso o no de chip NFC, y editar el contenido de
									la base de datos de tu mascota. La producción de un collar personalizado lleva de
									3 a 5 días. Los collares sublimados se entregan en 1 a 2 días.
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
