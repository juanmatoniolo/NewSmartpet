import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const ListarMascotas = () => {
	const [mascotas, setMascotas] = useState([]);

	const obtenerMascotas = async () => {
		try {
			const respuesta = await axios.get(
				"https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json"
			);
			const mascotasArray = Object.keys(respuesta.data).map((key) => ({
				id: key,
				...respuesta.data[key],
			}));
			setMascotas(mascotasArray);
		} catch (error) {
			console.error("Error al obtener las mascotas:", error);
		}
	};

	return (
		<div className="container">
			<button onClick={obtenerMascotas}>Obtener Mascotas</button>

			<div className="cards-container">
				{mascotas.map((mascota) => (
					<div key={mascota.id} className="card">
						<div className="card-body">
							{/* Verifica si datosMascotas existe antes de acceder a sus propiedades */}
							<h2>
								{mascota.datosMascotas?.nombre ||
									"Nombre no disponible"}
							</h2>

							{/* Verifica si img existe antes de intentar mostrar la imagen */}
							{mascota.datosMascotas?.img && (
								<img
									src={mascota.datosMascotas.img}
									alt={
										mascota.datosMascotas.nombre ||
										"Imagen de mascota"
									}
									className="img-img-img"
								/>
							)}

							<h3>Código de Activación:</h3>
							<p>{mascota.codAct || "Código no disponible"}</p>

							{/* Añade enlaces de teléfono */}
							{mascota.datosMascotas?.telefono1 && (
								<p>
									<a
										href={`https://wa.me/+549${mascota.datosMascotas.telefono1}`}
										target="_blank"
										rel="noreferrer"

									>
										Whatsapp {" "}
										{mascota.datosMascotas.telefono1}
									</a>
								</p>
							)}

							{mascota.datosMascotas?.telefono2 && (
								<p>
									<a
										href={`https://wa.me/+549${mascota.datosMascotas.telefono2}`}
										target="_blank"
										rel="noreferrer"
									>
										Whatsapp {" "}
										{mascota.datosMascotas.telefono2}
									</a>
								</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ListarMascotas;
