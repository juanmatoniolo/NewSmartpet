import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./mm.css";

function MostrarMascota({ show, handleClose, mascota }) {
	const handleWhatsapp = (numero, mensaje) => {
		const whatsappUrl = `https://wa.me/+549${numero}?text=${mensaje}`;
		window.open(whatsappUrl, "_blank");
	};

	const handleLlamar = (telefono) => {
		const telUrl = `tel:${telefono}`;
		window.open(telUrl, "_self");
	};

	const handleIg = (ig) => {
		if (ig && ig.startsWith("@")) {
			ig = ig.substring(1); // Elimina el @ si está presente
		}
		const igUrl = `https://www.instagram.com/${ig}`;
		window.open(igUrl, "_blank");
	};

	return (
		<Modal show={show} fullscreen onHide={handleClose}>
			<Modal.Header closeButton>
				<Modal.Title>Detalles de la Mascota</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{mascota ? (
					<>
						<main className="container container-main">
							<section className="datos-principales">
								<div className="imagenen-mascota">
									<img
										src={mascota.datosMascotas.img}
										alt={mascota.datosMascotas.nombre}
										style={{
											width: "100%",
											height: "auto",
										}} // Asegura que la imagen se ajuste al contenedor
									/>
								</div>

								<div className="datos-mascota">
									<h4 className="nombre-mascota">
										{mascota.datosMascotas.nombre}
									</h4>
									<p className="edad-mascota">
										<span>🎂 </span>
										{mascota.datosMascotas.edad}
									</p>
									<p className="sexo-mascota">
										<span>➰ </span>
										{mascota.datosMascotas.sexo}
									</p>
									<p className="ubicacion-masctoa">
										<span>📍 </span>
										{mascota.datosMascotas.ubicacion}
									</p>
								</div>
							</section>

							<section className="descripcion">
								<p className="descripcion-mascota">
									{mascota.datosMascotas.descripcion}
								</p>
							</section>

							<section className="contactos-masctoa">
								<h2 className="contacto text-center">
									Contactos
								</h2>
								<div className="contenenedor-contacto">
									<p className="nombre-contacto">
										{mascota.datosMascotas.persona1}
									</p>
									<div className="redes-sociales">
										<button
											className="btn btn-primary whatsapp-redes"
											onClick={() =>
												handleWhatsapp(
													mascota.datosMascotas
														.telefono1,
													mascota.datosMascotas
														.mensaje
												)
											}
										>
											Whatsapp
										</button>
										<button
											className="btn btn-primary llamar-redes"
											onClick={() =>
												handleLlamar(
													mascota.datosMascotas
														.telefono1
												)
											}
										>
											Llamar
										</button>
										<button
											className="btn btn-primary ig"
											onClick={() =>
												handleIg(
													mascota.datosMascotas.ig1
												)
											}
										>
											Instagram
										</button>
									</div>
								</div>

								{/* Contacto 2 */}
								<div className="contenenedor-contacto">
									<p className="nombre-contacto">
										{mascota.datosMascotas.persona2}
									</p>
									<div className="redes-sociales">
										<button
											className="btn btn-primary whatsapp-redes"
											onClick={() =>
												handleWhatsapp(
													mascota.datosMascotas
														.telefono2,
													mascota.datosMascotas
														.mensaje
												)
											}
										>
											Whatsapp
										</button>
										<button
											className="btn btn-primary llamar-redes"
											onClick={() =>
												handleLlamar(
													mascota.datosMascotas
														.telefono2
												)
											}
										>
											Llamar
										</button>
										<button
											className="btn btn-primary ig"
											onClick={() =>
												handleIg(
													mascota.datosMascotas.ig2
												)
											}
										>
											Instagram
										</button>
									</div>
								</div>
							</section>
						</main>
					</>
				) : (
					<p>Cargando detalles...</p>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleClose}>
					Cerrar
				</Button>
			</Modal.Footer>
		</Modal>
	);
}

export default MostrarMascota;
