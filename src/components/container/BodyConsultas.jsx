import React from "react";
import "./body.css";

function SubscriptionForm() {
	return (
		<div className="container">
			<section className="container how-it-works">
				<h2>Cómo funciona SmartPet</h2>
				<p>
					SmartPet es una aplicación diseñada para facilitar la
					gestión y seguridad de tus mascotas. Aquí te explicamos paso
					a paso:
				</p>
				<ol>
					<li>
						<strong>Registro:</strong> Crea una cuenta con tu
						información básica y obtén un código único junto con el
						collar de tu mascota.
					</li>
					<li>
						<strong>Configuración del Collar:</strong> Ingresa el
						código en nuestra plataforma para empezar a personalizar
						los detalles de tu mascota.
					</li>
					<li>
						<strong>Detalles de tu Mascota:</strong> Completa la
						información esencial como nombre, edad, sexo y datos
						médicos importantes.
					</li>
					<li>
						<strong>Contactos de Emergencia:</strong> Añade hasta
						dos contactos con acceso rápido para emergencias.
					</li>
					<li>
						<strong>Actualizaciones:</strong> Mantén actualizados
						los datos de tu mascota en cualquier momento desde tu
						cuenta.
					</li>
					<li>
						<strong>Ubicación Reciente:</strong> Próximamente,
						podrás ver en tiempo real dónde fue escaneado el collar
						de tu mascota utilizando Google Maps.
					</li>
				</ol>
				<p>
					Con SmartPet, puedes estar tranquilo sabiendo que la
					información vital de tu mascota está siempre accesible y
					actualizada. Regístrate hoy mismo y protege a tu compañero
					peludo con la mejor tecnología disponible.
				</p>
			</section>
		</div>
	);
}

export default SubscriptionForm;
