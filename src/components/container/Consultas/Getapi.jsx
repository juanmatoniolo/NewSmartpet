import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";
import img from "../../../assets/img5.jpg";
import "./get.css";
import GetMascota from "./getmascotas";

function GetData({ id }) {
	const [data, setData] = useState(null); // Estado para almacenar los datos del usuario
	const [mascotas, setMascotas] = useState({}); // Estado para almacenar los datos de las mascotas
	const [codigosUnicos, setCodigosUnicos] = useState(new Set()); // Estado para almacenar los códigos de activación únicos

	const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;
	const urlMascotasBase = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas`;

	const fetchMascotasData = async (codigos, cachedMascotas) => {
		const mascotasData = { ...cachedMascotas };
		for (const codAct of codigos) {
			if (!cachedMascotas[codAct]) {
				const url = `${urlMascotasBase}.json?orderBy="codAct"&equalTo="${codAct}"`;
				console.log("Fetching URL:", url); // Log URL for debugging
				const responseMascota = await axios.get(url);
				console.log("Response Mascota:", responseMascota.data); // Log response data
				const mascota = Object.values(responseMascota.data)[0];
				if (mascota) {
					mascotasData[codAct] = mascota; // Guarda los datos de la mascota
				}
			}
		}
		return mascotasData;
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Obtiene los datos del usuario
				const responseUsuario = await axios.get(urlUsuario);
				const usuarioData = responseUsuario.data;
				setData(usuarioData); // Actualiza el estado con los datos del usuario

				// Extrae y guarda los códigos de activación únicos en un set
				const codigos = new Set();
				Object.keys(usuarioData).forEach((key) => {
					if (usuarioData[key]?.codAct) {
						codigos.add(usuarioData[key].codAct);
					}
				});
				setCodigosUnicos(codigos); // Actualiza el estado con los códigos de activación únicos

				// Revisa si los datos de las mascotas ya están en localStorage
				const cachedMascotas =
					JSON.parse(localStorage.getItem("mascotasData")) || {};

				// Obtiene los datos de las mascotas usando los códigos de activación si no están en localStorage
				const mascotasData = await fetchMascotasData(
					codigos,
					cachedMascotas
				);
				setMascotas(mascotasData); // Actualiza el estado con los datos de las mascotas
				localStorage.setItem(
					"mascotasData",
					JSON.stringify(mascotasData)
				); // Guarda los datos en localStorage
			} catch (error) {
				console.error("Error al obtener datos:", error);
			}
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, []); // Agrega 'id' como dependencia para volver a ejecutar el efecto cuando cambie

	// Renderiza los datos obtenidos
	return (
		<div>
			{data ? (
				<div>
					<h1 className="container nombre-editable">
						Hola {data.nombreyapellido}, aquí están tus mascotas
					</h1>
					<div className="container mensaje-mensaje">
						<p>
							Debajo del código de activación verás un botón que
							dice "Ver mapa" si la ubicación está disponible, o
							"Ubicación no disponible" si no se compartió la
							ubicación.
						</p>
						<p>
							Recomendamos revisar el perfil de tu mascota desde
							el botón "Mostrar mascota". Si se escanea el collar
							o se abre el enlace, la última ubicación podría
							cambiar a la del nuevo usuario.
						</p>
					</div>

					<section className="container contenedor-cards-user">
						{Array.from(codigosUnicos).map((codAct) => (
							<GetMascota key={codAct} id={codAct} />
						))}
					</section>
				</div>
			) : (
				<div>
					<h1 className="container nombre-editable">
						Hola, aquí están tus mascotas
					</h1>
					<section className="container contenedor-cards-user">
						<Card
							className="card-pet"
							style={{
								width: "17rem",
								marginBottom: "20px",
							}}
						>
							<Card.Img
								variant="top"
								src={img}
								className="img-card-pet"
							/>
							<Card.Body>
								<Card.Title className="titulo-card">
									Nombre: ...
								</Card.Title>
								<Card.Text>
									<p>Ult. ubicación: cargando...</p>
									<p>Código: cargando ... </p>
								</Card.Text>
								<Button
									variant="primary"
									className="btn-editar"
								>
									Editar Mascotas
								</Button>
							</Card.Body>
						</Card>
					</section>
				</div>
			)}
		</div>
	);
}

export default GetData;
