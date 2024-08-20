import React from "react";
import axios from "axios";
import { useState } from "react";
import "./style.css";

const ListarUsuarios = () => {
	const [usuarios, setUsuarios] = useState([]);

	const obtenerUsuarios = async () => {
		try {
			const respuesta = await axios.get(
				"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json"
			);
			const usuariosArray = Object.keys(respuesta.data).map((key) => ({
				id: key,
				...respuesta.data[key],
			}));
			setUsuarios(usuariosArray.slice(0, 10));
		} catch (e) {
			console.log(e);
		}
	};
	return (
		<>
			<button onClick={obtenerUsuarios}>Obtener Usuarios</button>

			<div className="cards-container">
				{usuarios.map((usuario) => (
					<div key={usuario.id} className="card">
						<div className="card-body">
							<h2>{usuario.nombreyapellido}</h2>
							<p>Usuario: {usuario.dni}</p>
							<p>Contraseña: {usuario.contrasenia}</p>
							<hr />
							<h3>Códigos de Activación:</h3>
							{Object.values(usuario).map((item, index) =>
								item.codAct ? (
									<p key={index}>Código: {item.codAct}</p>
								) : null
							)}
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default ListarUsuarios;
