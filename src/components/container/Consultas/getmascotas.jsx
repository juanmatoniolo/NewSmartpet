import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";
import imgPlaceholder from "../../../assets/img5.jpg"; // Imagen de relleno en caso de no haber imagen en la base de datos
import "./get.css"; // Estilos CSS adicionales

function GetMascota({ id }) {
	const urlMascotasBase =
		"https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json";

	const [mascota, setMascota] = useState(null); // Estado para almacenar los datos de la mascota

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Obtiene todas las mascotas desde la base de datos una sola vez
				const response = await axios.get(urlMascotasBase);
				const mascotasData = response.data;

				// Busca la mascota con el ID específico
				const mascotaEncontrada = Object.values(mascotasData).find(
					(mascota) => mascota.codAct === id
				);

				setMascota(mascotaEncontrada); // Actualiza el estado con los datos de la mascota encontrada
			} catch (error) {
				console.error("Error al obtener datos:", error);
			}
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, [id, urlMascotasBase]);

	// Renderiza los datos obtenidos
	return (
		<div>
			{mascota ? (
				<section className="container contenedor-cards-user">
					<Card
						className="card-pet"
						id={mascota.id}
						style={{
							width: "17rem",
							marginBottom: "20px",
						}}
					>
						<Card.Img
							variant="top"
							src={`data:image/jpeg;base64,${mascota.datosMascotas.img}`}
							onError={(e) => {
								e.target.src = imgPlaceholder; // Carga la imagen de relleno si no hay imagen en base64
							}}
							className="img-card-pet"
						/>
						<Card.Body>
							<Card.Title className="titulo-card">
								{mascota.datosMascotas.nombre ||
									"Debe cargar datos"}
							</Card.Title>
							<Card.Text>
								<p>
									Edad:{" "}
									{mascota.datosMascotas.edad || "Sin datos"}
								</p>
								<p>
									Sexo:{" "}
									{mascota.datosMascotas.sexo || "Sin datos"}
								</p>
								<p>Cod Act: {id}</p>
							</Card.Text>
							<Button variant="primary" className="btn-editar">
								Editar Mascotas
							</Button>
						</Card.Body>
					</Card>
				</section>
			) : (
				// Sección de carga mientras se obtienen los datos
				<Card
					className="card-pet"
					style={{
						width: "17rem",
						marginBottom: "20px",
					}}
				>
					<Card.Img
						variant="top"
						src={imgPlaceholder}
						className="img-card-pet"
					/>
					<Card.Body>
						<Card.Title className="titulo-card">
							Cargando mascota...
						</Card.Title>
						<Card.Text>
							<p>Edad: Sin datos</p>
							<p>Sexo: Sin datos</p>
							<p>Cod Act: {id}</p>
						</Card.Text>
						<Button variant="primary" className="btn-editar">
							Editar Mascotas
						</Button>
					</Card.Body>
				</Card>
			)}
		</div>
	);
}

export default GetMascota;
