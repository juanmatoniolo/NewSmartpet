import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { Button } from "react-bootstrap";
import img from "../../../assets/img5.jpg";
import "./get.css";

function GetData({ id }) {
	const [data, setData] = useState(null); // Estado para almacenar los datos obtenidos
	const [, setCodigosActivacion] = useState([]); // Estado para almacenar los códigos de activación

	const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(url);
				setData(response.data); // Actualiza el estado con los datos obtenidos

				// Extrae y guarda los códigos de activación en un array
				const codigos = Object.keys(response.data).reduce(
					(acc, key) => {
						if (response.data[key]?.codAct) {
							acc.push(response.data[key].codAct);
						}
						return acc;
					},
					[]
				);
				setCodigosActivacion(codigos); // Actualiza el estado con los códigos de activación
			} catch (error) {
				console.error("Error al obtener datos:", error);
			}
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, [id, url]);

	// Renderiza los datos obtenidos
	return (
		<div>
			{data ? (
				<div>
					<section className="container contenedor-cards-user">
						{Object.keys(data).map((key) =>
							data[key]?.codAct ? (
								<Card
									className={data[key].codAct}
									id={data[key].codAct}
									key={key}
									style={{
										width: "17rem",
										marginBottom: "20px",
									}}
								>
									<Card.Img variant="top" src={img} className="img-card-pet"/>
									<Card.Body>
										<Card.Title className="titulo-card">
											{data[key].codAct}
										</Card.Title>
										<Card.Text>
											<p>Nombre: cargando...</p>
											<p>Sexo: cargando...</p>
											<p>Edad: cargando...</p>
											{/* Asegúrate de usar el dato correcto según tu estructura */}
											{/*   <p>DNI: {data[key].dni}</p> */}
										</Card.Text>
										<Button
											variant="primary"
											className="btn-editar"
										>
											Editar Mascotas{" "}
										</Button>
									</Card.Body>
								</Card>
							) : null
						)}
					</section>
				</div>
			) : (
				<p>Cargando datos...</p>
			)}
		</div>
	);
}

export default GetData;
