import React, { useEffect, useState } from "react";
import axios from "axios";
import "./style.css";
import Logout from "../../../Logout/Logout";
import NavRoot from "../NavRoot";

const ListarMascotas = () => {
	// Estado para almacenar las mascotas y el término de búsqueda
	const [mascotas, setMascotas] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("id-asc");

	useEffect(() => {
		const obtenerMascotas = async () => {
			try {
				// Solo obtenemos las mascotas una vez
				const respuesta = await axios.get(
					"https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json"
				);

				// Mapeamos los datos de las mascotas para almacenarlos en el estado
				const mascotasArray = Object.keys(respuesta.data || {}).map((key) => ({
					id: key,
					...respuesta.data[key],
				}));

				// Guardamos las mascotas en el estado
				setMascotas(mascotasArray);
			} catch (error) {
				console.error("Error al obtener las mascotas:", error);
			}
		};
		obtenerMascotas();
	}, []); // Solo se ejecuta una vez al montar el componente

	// Filtramos las mascotas basándonos en el término de búsqueda
	const filteredMascotas = mascotas.filter((mascota) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			String(mascota.id).toLowerCase().includes(searchLower) ||
			(mascota.codAct && String(mascota.codAct).toLowerCase().includes(searchLower))
		);
	});

	// Manejar el cambio de orden (por ID o por imagen)
	const handleSort = (key) => {
		const newSort = sortBy.startsWith(key) && sortBy.endsWith("asc") ? `${key}-desc` : `${key}-asc`;
		setSortBy(newSort);
	};

	// Ordenar las mascotas según el valor de sortBy
	const sortedMascotas = [...filteredMascotas].sort((a, b) => {
		const [sortKey, order] = sortBy.split("-");

		// Primero ordenar por imagen (si tiene imagen primero)
		if (sortKey === "imagen") {
			const aHasImage = a.datosMascotas?.img ? 1 : 0;
			const bHasImage = b.datosMascotas?.img ? 1 : 0;
			if (aHasImage !== bHasImage) {
				return bHasImage - aHasImage; // Primero los que tienen imagen
			}
		}

		// Ordenar por ID
		if (sortKey === "id") {
			const aValue = parseInt(a.id, 10);
			const bValue = parseInt(b.id, 10);
			if (order === "asc") return aValue - bValue;
			return bValue - aValue;
		}

		return 0;
	});

	return (
		<>
			<Logout />
			<NavRoot />
			<div className="container">
				<h2 className="titulo-lista">Lista de Mascotas</h2>
				<div className="controls">
					<input
						type="text"
						placeholder="Buscar por ID o Código..."
						className="search-input"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
				{sortedMascotas.length === 0 ? (
					<p className="no-results">No se encontraron mascotas</p>
				) : (
					<div className="table-responsive">
						<table className="table table-bordered">
							{/* Encabezado de la tabla */}
							<thead>
								<tr>
									<th
										className={sortBy.startsWith("id") ? (sortBy.endsWith("asc") ? "sorted-asc" : "sorted-desc") : ""}
										onClick={() => handleSort("id")}
									>
										ID
									</th>
									<th
										className={sortBy.startsWith("codAct") ? (sortBy.endsWith("asc") ? "sorted-asc" : "sorted-desc") : ""}
										onClick={() => handleSort("codAct")}
									>
										Código
									</th>
									<th
										className={sortBy.startsWith("imagen") ? (sortBy.endsWith("asc") ? "sorted-asc" : "sorted-desc") : ""}
										onClick={() => handleSort("imagen")}
									>
										Imagen
									</th>
									<th>IR</th>
								</tr>
							</thead>

							{/* Cuerpo de la tabla */}
							<tbody>
								{sortedMascotas.map((mascota) => (
									<tr key={mascota.id}>
										<td>{mascota.id || "-"}</td>
										<td>{mascota.codAct || "Sin código"}</td>
										<td>
											{mascota.datosMascotas?.img ? (
												<img
													src={mascota.datosMascotas.img}
													alt={mascota.datosMascotas.nombre || "Mascota"}
													style={{ width: "60px", height: "60px", objectFit: "cover" }}
												/>
											) : (
												"Sin imagen"
											)}
										</td>
										<td></td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</>
	);
};

export default ListarMascotas;
