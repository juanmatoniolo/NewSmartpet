import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";
import imgPlaceholder from "../../../assets/img5.jpg"; // Imagen de relleno en caso de no haber imagen en la base de datos
import "./get.css"; // Estilos CSS adicionales
import EditarDatos from "./EditarDatos";
import MostrarMascota from "./MostrarMascota"; // Importa el nuevo componente

function GetMascota({ id }) {
	const urlMascotasBase =
		"https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json";

	const [mascota, setMascota] = useState(null); // Estado para almacenar los datos de la mascota
	const [showModal, setShowModal] = useState(false); // Estado para controlar la visibilidad del modal de edición
	const [showModalMostrar, setShowModalMostrar] = useState(false); // Estado para controlar la visibilidad del modal de mostrar

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
	}, [id]);

	const handleShowModal = () => setShowModal(true);
	const handleCloseModal = () => setShowModal(false);

	const handleShowModalMostrar = () => setShowModalMostrar(true);
	const handleCloseModalMostrar = () => setShowModalMostrar(false);

	const handleSave = async () => {
		try {
			// Vuelve a cargar los datos después de guardar
			const response = await axios.get(urlMascotasBase);
			const mascotasData = response.data;

			// Busca la mascota actualizada con el ID específico
			const mascotaActualizada = Object.values(mascotasData).find(
				(mascota) => mascota.codAct === id
			);

			setMascota(mascotaActualizada); // Actualiza el estado con los datos actualizados
		} catch (error) {
			console.error("Error al actualizar los datos:", error);
		}
	};

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
							src={mascota.datosMascotas.img || imgPlaceholder} // Usa imagen de relleno si no hay imagen
							className="img-card-pet"
						/>
						<Card.Body>
							<Card.Title className="titulo-card">
								{mascota.datosMascotas.nombre ||
									"Debe cargar datos"}
							</Card.Title>
							<Card.Text>
								<p>
									Cod Act:{" "}
									{mascota.codAct.length > 10
										? "Primeros usuarios"
										: mascota.codAct}
								</p>

								<p>
									{mascota.datosMascotas.lat &&
									mascota.datosMascotas.lon ? (
										<a
											href={`https://maps.google.com/?q=${mascota.datosMascotas.lat},${mascota.datosMascotas.lon}`}
											target="_blank"
											rel="noopener noreferrer"
										>
											Ver en mapa
										</a>
									) : (
										<span>Ubicación no disponible</span>
									)}
								</p>
							</Card.Text>
							<Button
								variant="primary"
								className="btn-editar"
								onClick={handleShowModal}
							>
								Editar Mascotas
							</Button>
							<Button
								variant="primary"
								className="btn-editar2"
								onClick={handleShowModalMostrar} // Muestra el modal de MostrarMascota
							>
								Mostrar Mascota
							</Button>
						</Card.Body>
					</Card>

					<EditarDatos
						show={showModal}
						handleClose={handleCloseModal}
						mascota={mascota} // Pasa los datos de la mascota al modal
						id={mascota.id}
						onSave={handleSave} // Pasa la función de actualización al modal
					/>

					<MostrarMascota
						show={showModalMostrar}
						handleClose={handleCloseModalMostrar}
						mascota={mascota} // Pasa los datos de la mascota al modal
					/>
				</section>
			) : (
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
							Cargando ...
						</Card.Title>
						<Card.Text>
							<p>Cod Act: {id}</p>
						</Card.Text>
						<Button
							variant="primary"
							className="btn-editar"
							disabled
						>
							Editar Mascotas
						</Button>
					</Card.Body>
				</Card>
			)}
		</div>
	);
}

export default GetMascota;
