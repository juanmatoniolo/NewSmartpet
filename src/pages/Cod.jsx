import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./cod.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";
import { Link } from "react-router-dom";
import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";

function Cod() {
	return (
		<>
			<Header />
			<Barnav />
			<WhatsAppButton mensaje="Hola, quiero comprar un collar para mi mascota" />

			<div className="cod-container container mt-4">
				{/* Proceso de Registro */}
				<section className="cod-section">
					<h2 className="cod-subtitle">Proceso de Registro</h2>
					<p className="cod-text">
						Primero, necesitas{" "}
						<Link to="/Register">crear una cuenta</Link>. El proceso
						de registro es rápido y sencillo; solo necesitas un
						nombre de usuario y una contraseña. Esto te permitirá
						acceder a todas las funciones de Smartpet.
					</p>
				</section>

				{/* Ingreso del Código */}
				<section className="cod-section">
					<h2 className="cod-subtitle">Ingreso del Código</h2>
					<p className="cod-text">
						Una vez registrada tu cuenta, ingresa el código único
						que recibiste al comprar tu collar Smartpet. Este código
						está compuesto por 4 caracteres y 4 números, por
						ejemplo, <strong>@ABC1234</strong>. Es un código único e
						irrepetible que estará vinculado a tu mascota.
					</p>
					<p className="cod-text">
						Este código te permitirá acceder y modificar los datos
						de tu mascota. Sin este código, nadie más podrá cambiar
						la información de tu mascota, garantizando su seguridad
						y privacidad.
					</p>
					<p className="cod-text">
						El código se ingresa una vez y queda guardado en tu
						cuenta para que sea más cómodo para ti.
					</p>
				</section>

				{/* Editar los Datos de tu Mascota */}
				<section className="cod-section">
					<h2 className="cod-subtitle">
						Editar los Datos de tu Mascota
					</h2>
					<p className="cod-text">
						Después de ingresar el código, puedes editar y
						actualizar los datos de tu mascota en cualquier momento.
						Esto incluye su nombre, edad, sexo, descripción y los
						contactos de emergencia.
					</p>
				</section>

				{/* Adquiere tu Collar Smartpet */}
				<section className="cod-section">
					<h2 className="cod-subtitle">
						Adquiere tu Collar Smartpet
					</h2>
					<p className="cod-text">
						Para adquirir un collar Smartpet, solo tienes que tocar
						el ícono de WhatsApp para enviarnos un mensaje y
						coordinar la compra. Estamos aquí para ayudarte y
						asegurarnos de que tu mascota siempre esté segura y bien
						identificada.
					</p>
				</section>
			</div>

			<Footers />
		</>
	);
}

export default Cod;
