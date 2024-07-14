import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import SubscriptionForm from "../BodyConsultas";

function Consultas() {
	const { id } = useParams(); // Obtener el id de los parámetros de la URL
	const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario
	const [codigosActivacion, setCodigosActivacion] = useState([]); // Estado para almacenar los códigos de activación únicos



	useEffect(() => {
		const fetchUsuario = async () => {
			try {
				const response = await axios.get(
					`https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`
				);
				setUsuario(response.data); // Almacenar los datos del usuario en el estado
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUsuario(); // Llamar a la función para obtener los datos del usuario
	}, [id]); // Ejecutar useEffect cada vez que cambie el id

	useEffect(() => {
		// Validar y almacenar códigos de activación únicos
		if (usuario) {
			const uniqueCodigos = [];
			Object.keys(usuario).forEach((key) => {
				if (key.startsWith("-")) {
					const codAct = usuario[key].codAct;
					if (!uniqueCodigos.includes(codAct)) {
						uniqueCodigos.push(codAct);
					}
				}
			});
			setCodigosActivacion(uniqueCodigos);
		}
	}, [usuario]); // Ejecutar cada vez que cambien los datos del usuario

	return (
		<>
			<Logout />

			<div>
				{usuario ? (
					<div>
						<h2>Detalles del Usuario</h2>
						<p>Nombre: {usuario.nombreyapellido}</p>
						<p>Usuario: {usuario.dni}</p>
						<p>Correo Electrónico: {usuario.mail}</p>
						<h3>Códigos de Activación:</h3>
						<ul>
							{codigosActivacion.map((codAct, index) => (
								<li key={index}>Código: {codAct}</li>
							))}
						</ul>
						{/* Mostrar otros detalles del usuario según tu estructura de datos */}
					</div>
				) : (
					<p>Cargando usuario...</p>
				)}
			</div>

			<SubscriptionForm />
			<Footers />
		</>
	);
}

export default Consultas;
