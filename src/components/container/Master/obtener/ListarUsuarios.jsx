import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const ListarUsuarios = () => {
	const [usuarios, setUsuarios] = useState([]);
	const [mostrarUsuarios, setMostrarUsuarios] = useState(false);
	const [activo, setActivo] = useState(null);
	const [filtroTexto, setFiltroTexto] = useState(""); // NUEVO: texto del input de búsqueda

	const obtenerUsuarios = async () => {
		if (mostrarUsuarios) {
			setUsuarios([]);
			setMostrarUsuarios(false);
		} else {
			try {
				const res = await axios.get(
					"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json"
				);
				const usuariosArray = Object.entries(res.data || {}).map(([id, data]) => ({
					id,
					...data,
				}));
				setUsuarios(usuariosArray.slice(0, 100));
				setMostrarUsuarios(true);
			} catch (error) {
				console.error("Error al obtener usuarios:", error);
			}
		}
	};

	const toggleActivo = (id) => {
		setActivo((prev) => (prev === id ? null : id));
	};

	const limpiarCodigo = (codigo) => {
		return (
			codigo
				?.replace("https://juanmatoniolo.github.io/", "")
				?.replace("https://smartpetrosario.github.io/", "") || ""
		);
	};

	// NUEVO: filtrado por nombre o DNI
	const usuariosFiltrados = usuarios.filter((u) => {
		const texto = filtroTexto.toLowerCase();
		return (
			u.nombre?.toLowerCase().includes(texto) ||
			u.dni?.toLowerCase().includes(texto)
		);
	});

	return (
		<div className="usuarios-wrapper">
			<button onClick={obtenerUsuarios} className="btn-toggle">
				{mostrarUsuarios ? "Ocultar Usuarios" : "Obtener Usuarios"}
			</button>

			{/* Input de búsqueda */}
			{mostrarUsuarios && (
				<input
					type="text"
					placeholder="Buscar por nombre o DNI..."
					value={filtroTexto}
					onChange={(e) => setFiltroTexto(e.target.value)}
					className="input-buscador"
				/>
			)}

			{mostrarUsuarios && (
				<div className="accordion-container">
					{usuariosFiltrados.map((usuario, index) => (
						<div key={usuario.id} className="accordion-item">
							<div
								className="accordion-header"
								onClick={() => toggleActivo(usuario.id)}
							>
								<span>
									{index + 1}. {usuario.nombre || "Sin nombre"}
								</span>
								<span>{activo === usuario.id ? "−" : "+"}</span>
							</div>

							{activo === usuario.id && (
								<div className="accordion-body">
									<p>
										<strong>DNI:</strong> {usuario.dni}
									</p>
									<p>
										<strong>Contraseña:</strong> {usuario.contrasenia}
									</p>
									<h4>Códigos de Activación:</h4>
									{Object.values(usuario)
										.filter((item) => item?.codAct)
										.map((item, i) => (
											<p key={i}>
												<strong>Código:</strong> {limpiarCodigo(item.codAct)}
											</p>
										))}
								</div>
							)}
						</div>
					))}

					{usuariosFiltrados.length === 0 && (
						<p style={{ padding: "1rem", color: "#999" }}>
							No se encontraron resultados.
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default ListarUsuarios;
