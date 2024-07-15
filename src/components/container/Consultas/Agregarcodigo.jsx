import React, { useState, useEffect } from "react";
import axios from "axios";
import "./agregar.css"

const Agregarcodigo = ({ id }) => {
	const [codigo, setCodigo] = useState(""); // Estado para almacenar el código a agregar
	const [mensaje, setMensaje] = useState(""); // Estado para mostrar mensajes de éxito o error
	const [codigosActivacion, setCodigosActivacion] = useState([]); // Estado para almacenar los códigos de activación cargados
	const [cargando, setCargando] = useState(true); // Estado para controlar la carga

	const urlMascotas = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get(urlMascotas);
				const fetchedData = response.data;

				// Extrae y guarda los códigos de activación en un array
				const codigos = Object.keys(fetchedData).reduce((acc, key) => {
					if (fetchedData[key]?.codAct) {
						acc.push(fetchedData[key].codAct);
					}
					return acc;
				}, []);
				setCodigosActivacion(codigos); // Actualiza el estado con los códigos de activación
				setCargando(false); // Actualiza el estado de carga
			} catch (error) {
				console.error("Error al obtener datos:", error);
				setMensaje("Error al obtener datos de la base de datos."); // Muestra mensaje de error si falla la obtención de datos
				setCargando(false); // Asegúrate de actualizar el estado de carga incluso si ocurre un error
			}
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, [id, urlMascotas]);

	// Función para manejar el envío del formulario
	const handleSubmit = async (e) => {
		e.preventDefault(); // Evita el comportamiento predeterminado del formulario

		// Validación del formato del código
		const codigoValido = /^[a-zA-Z]{4}[0-9]{4}$/.test(codigo);
		if (!codigoValido) {
			setMensaje("El código debe tener 4 letras seguidas de 4 números.");
			return;
		}

		// Validación de coincidencia del código
		const codigoExiste = codigosActivacion.includes(codigo);
		if (!codigoExiste) {
			setMensaje("El código ingresado no coincide con ningún código de mascota.");
			return;
		}

		const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;
		try {
			// Crea una instancia de axios con una configuración base
			const instance = axios.create({
				baseURL: "https://smartpet-1d59e-default-rtdb.firebaseio.com", // URL base de la base de datos
				timeout: 5000, // Tiempo máximo de espera para la solicitud en milisegundos
				headers: {
					"Content-Type": "application/json", // Tipo de contenido de la solicitud
				},
			});

			// Realiza una solicitud POST para agregar el código en la ruta específica según el 'id'
			const response = await instance.post(urlUsuario, {
				codAct: codigo, // Datos a enviar en el cuerpo de la solicitud
			});

			console.log("Respuesta del servidor:", response.data);
			setMensaje("Código agregado correctamente."); // Actualiza el estado del mensaje
		} catch (error) {
			console.error("Error al agregar código:", error);
			setMensaje(
				"Error al agregar código. Por favor, intenta nuevamente."
			); // Actualiza el estado del mensaje de error
		}
	};

	// Función para manejar cambios en el input de código
	const handleChange = (e) => {
		setCodigo(e.target.value); // Actualiza el estado del código con el valor del input
	};

	return (
		<section className="container section-validador">
			<div>
				{cargando ? (
					<div className="loading-container">
						<p>Aguarde mientras se inicia la base de datos...</p>
						<div className="loading-ring"></div>
					</div>
				) : (
					<>
						<h2>Agregar Código</h2>
						<form onSubmit={handleSubmit}>
							<label htmlFor="codigo">Código:</label>
							<input
								type="text"
								id="codigo"
								value={codigo}
								onChange={handleChange}
								required
							/>
							<button type="submit">Agregar</button>
						</form>
						{mensaje && <p>{mensaje}</p>}
					</>
				)}
			</div>
		</section>
	);
};

export default Agregarcodigo;
