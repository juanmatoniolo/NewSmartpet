import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./collares.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";
import Imagenes from "../assets/Imagenes";
import Carousel3D from "../assets/collares/modelos";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";

function Collares() {
	return (
		<>
			<Header />
			<Barnav />
			<WhatsAppButton mensaje="Hola, quier comprar un collar de smartpet" />
			<div className="container">
				<section className="smartpet-info py-5">
					<div className="container">
						<h2 className="section-title text-center mb-4">
							¡Rastrea a tu mascota en tiempo real!
						</h2>
						<p className="section-description ">
							¿Sabías que con SmartPet puedes saber la última
							ubicación donde se escaneó el collar de tu mascota?
							Nuestro collar cuenta con un servicio exclusivo que
							almacena automáticamente esta información,
							brindándote la tranquilidad de poder rastrear a tu
							mascota en todo momento. Solo tú, el dueño, puedes
							acceder a esta valiosa información y mantener el
							control total.
						</p>
					</div>
				</section>

				<h1 className="text-center textoh1modelos">
					ALGUNOS DE NUESTROS MODELOS:
				</h1>
				<div className="container">
					<Carousel3D />
				</div>

				<section className="text-center my-5">
					<h3 className="info-text">
						¿Sabías que puedes enviarnos tu diseño y nosotros lo
						sublimamos? Así, tu colgante es 100% personalizable.
						Además, también contamos con la opción de resina epoxi.
					</h3>
				</section>

				<section className="smartpet-info py-5">
					<div className="container">
						<h2 className="section-title text-center mb-4">
							¿Qué es SmartPet?
						</h2>
						<p className="section-description">
							SmartPet es una innovadora aplicación que te permite
							guardar todos los datos importantes de tu mascota en
							un solo lugar. Lo más destacado es que, al escanear
							el collar de tu mascota con cualquier dispositivo,
							la ubicación del escaneo se guarda automáticamente.
							Esto te permite mantener un registro preciso de los
							lugares donde tu mascota ha sido vista, brindándote
							una herramienta poderosa para rastrear su ubicación
							en caso de pérdida. Esta función es exclusivamente
							accesible para los dueños de la mascota, quienes son
							los únicos que pueden visualizar esta información
							crucial. Además, solo los dueños pueden editar los
							datos o cambiar la foto de perfil de su mascota,
							asegurando total privacidad y control.
						</p>
					</div>
				</section>
			</div>

			<h2 className="section-title">¿Como funciona? </h2>

			<section className="collares-videos  col-10 col-sm-10 col-md-8 col-lg-8 mt-5">
					<video controls className="video-fluid controlarVideo">
						<source src={Imagenes.video} type="video/mp4" />
						Tu navegador no soporta la etiqueta de video.
					</video>
			</section>

			<Footers />
		</>
	);
}

export default Collares;
