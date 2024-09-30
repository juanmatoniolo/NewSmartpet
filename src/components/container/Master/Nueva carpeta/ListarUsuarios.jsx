import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const ListarUsuarios = () => {
	const [usuarios, setUsuarios] = useState([]); // Almacena los usuarios
	const [mostrarUsuarios, setMostrarUsuarios] = useState(false); // Controla si mostrar u ocultar usuarios

	// Función para obtener los usuarios desde la base de datos
	const obtenerUsuarios = async () => {
		if (mostrarUsuarios) {
			// Si ya están visibles, oculta los usuarios
			setUsuarios([]);
			setMostrarUsuarios(false); // Cambia el estado para ocultarlos
		} else {
			// Si no están visibles, realiza la solicitud GET
			try {
				const respuesta = await axios.get(
					"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json"
				);
				const usuariosArray = Object.keys(respuesta.data).map((key) => ({
					id: key,
					...respuesta.data[key],
				}));
				setUsuarios(usuariosArray.slice(0, 10)); // Muestra hasta 10 usuarios
				setMostrarUsuarios(true); // Cambia el estado para mostrarlos
			} catch (e) {
				console.log(e);
			}
		}
	};

	return (
		<>
			<button onClick={obtenerUsuarios} className="btn-obtener">
				{mostrarUsuarios ? "Ocultar Usuarios" : "Obtener Usuarios"}
			</button>

			<div className="cards-container">
				{usuarios.map((usuario, index) => (
					<div key={usuario.id} className="user-card">
						<div className="card-header">
							<h2>
								{index + 1}. {usuario.nombre}
							</h2>
						</div>
						<div className="card-body">
							<p>Usuario: {usuario.dni}</p>
							<p>Contraseña: {usuario.contrasenia}</p>
							<hr />
							<h3>Códigos de Activación:</h3>
							{Object.values(usuario).map((item, subIndex) => {
								if (item.codAct) {
									const urlBase1 = "https://juanmatoniolo.github.io/";
									const urlBase2 = "https://smartpetrosario.github.io/";
									let codigo = item.codAct;

									// Si el código comienza con alguna de las URLs base, quitarlas
									if (codigo.startsWith(urlBase1)) {
										codigo = codigo.replace(urlBase1, "");
									} else if (codigo.startsWith(urlBase2)) {
										codigo = codigo.replace(urlBase2, "");
									}

									// Mostrar solo códigos que tengan más de 8 caracteres o sean URLs
									return (
										<p key={subIndex}>
											Código: {codigo.length > 8 ? codigo : item.codAct}
										</p>
									);
								}
								return null;
							})}
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default ListarUsuarios;
