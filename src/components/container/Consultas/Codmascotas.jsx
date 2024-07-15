import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import "./get.css";

function Codmascotas({ id }) {
	const [data, setData] = useState([]); // Estado para almacenar los datos cargados
	const [loading, setLoading] = useState(false); // Estado para manejar el estado de carga

	const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true); // Indica que la carga de datos está en progreso
			try {
				const response = await axios.get(url);
				const fetchedData = response.data;

				// Convertir el objeto de datos en un array para el renderizado incremental
				const dataArray = Object.keys(fetchedData).map((key) => ({
					id: key,
					...fetchedData[key],
				}));

				// Actualizar el estado con los datos cargados
				setData(dataArray);
			} catch (error) {
				console.error("Error al obtener datos:", error);
			}
			setLoading(false); // Indica que la carga de datos ha terminado
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, [id, url]);

	return (
		<div>
			{loading && <p>Cargando datos...</p>}
			<section className="container contenedor-cards-user">
				{data.map((item) =>
					item?.codAct ? (
						<Card
							style={{
								width: "17rem",
								marginBottom: "20px",
							}}
						>
							<Card.Body>
								<Card.Title className="titulo-card">
									{item.codAct}
								</Card.Title>
							</Card.Body>
						</Card>
					) : null
				)}
			</section>
		</div>
	);
}

export default Codmascotas;
