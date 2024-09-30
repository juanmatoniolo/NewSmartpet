import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const ListarMascotas = () => {
	const [mascotas, setMascotas] = useState([]); // Almacena las mascotas
	const [mostrarMascotas, setMostrarMascotas] = useState(false); // Controla si mostrar u ocultar mascotas

	// Función para obtener las mascotas desde la base de datos
	const obtenerMascotas = async () => {
		if (mostrarMascotas) {
			// Si ya están visibles, oculta las mascotas
			setMascotas([]);
			setMostrarMascotas(false); // Cambia el estado para ocultarlas
		} else {
			// Si no están visibles, realiza la solicitud GET
			try {
				const respuesta = await axios.get(
					"https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json"
				);
				const mascotasArray = Object.keys(respuesta.data).map((key) => ({
					id: key,
					...respuesta.data[key],
				}));
				setMascotas(mascotasArray); // Muestra todas las mascotas
				setMostrarMascotas(true); // Cambia el estado para mostrarlas
			} catch (error) {
				console.error("Error al obtener las mascotas:", error);
			}
		}
	};

	return (
		<div className="container">
			<button onClick={obtenerMascotas} className="btn-obtener">
				{mostrarMascotas ? "Ocultar Mascotas" : "Obtener Mascotas"}
			</button>

			<div className="cards-container">
				{mostrarMascotas && mascotas.map((mascota) => (
					<div key={mascota.id} className="card">
						<div className="card-body">
							{/* Muestra solo el código de activación */}
							<h3>Código de Activación:</h3>
							<p>{mascota.codAct || "Código no disponible"}</p>

							{/* Verifica si img existe antes de intentar mostrar la imagen, ajustando el tamaño */}
							{mascota.datosMascotas?.img && (
								<img
									src={mascota.datosMascotas.img}
									alt={
										mascota.datosMascotas.nombre ||
										"Imagen de mascota"
									}
									className="img-img-img" // Estilo para la imagen
								/>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ListarMascotas;
