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
							<h2>{mascota.datosMascotas.nombre}</h2>
							
							{mascota.datosMascotas.img && (
								<img
									src={mascota.datosMascotas.img}
									alt={mascota.datosMascotas.nombre}
									className="img-img-img"
								/>
							)}
							
							<h3>Código de Activación:</h3>
							<p>{mascota.codAct}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ListarMascotas;
