import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button, Modal } from "react-bootstrap"; // Importamos Modal
import "./agregar.css";

const Agregarcodigo = ({ id }) => {
	const [codigo, setCodigo] = useState(""); // Estado para almacenar el código a agregar
	const [mensaje, setMensaje] = useState(""); // Estado para mostrar mensajes de éxito o error
	const [cargando, setCargando] = useState(false); // Estado para controlar la carga
	const [codigosUnicos, setCodigosUnicos] = useState(new Set()); // Estado para almacenar los códigos de activación únicos
	const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

	const urlMascotas = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;
	const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;

	// Función para obtener los códigos de activación desde la base de datos de mascotas
	const fetchCodigosMascotas = async () => {
		try {
			const response = await axios.get(urlMascotas);
			const fetchedData = response.data;

			// Extrae y guarda los códigos de activación únicos en un set
			const codigos = new Set();
			Object.keys(fetchedData).forEach((key) => {
				if (fetchedData[key]?.codAct) {
					codigos.add(fetchedData[key].codAct);
				}
			});


			return codigos; // Retorna el set de códigos únicos de mascotas
		} catch (error) {
			console.error("Error al obtener datos de mascotas:", error);
			throw new Error("Error al obtener datos de mascotas");
		}
	};

	// Función para obtener los códigos de activación desde la base de datos de usuario
	const fetchCodigosUsuario = async () => {
		try {
			const response = await axios.get(urlUsuario);
			const fetchedData = response.data;

			// Extrae y guarda los códigos de activación únicos en un set
			const codigos = new Set();
			Object.keys(fetchedData).forEach((key) => {
				if (fetchedData[key]?.codAct) {
					codigos.add(fetchedData[key].codAct);
				}
			});
			return codigos; // Retorna el set de códigos únicos de usuario
		} catch (error) {
			console.error("Error al obtener datos de usuario:", error);
			throw new Error("Error al obtener datos de usuario");
		}
	};

	// Efecto para cargar los códigos únicos al montar el componente y cuando 'id' cambia
	useEffect(() => {
		const fetchData = async () => {
			try {
				const codigosMascotas = await fetchCodigosMascotas();
				const codigosUsuario = await fetchCodigosUsuario();

				// Filtra los códigos que están en mascotas pero no en usuario
				const codigosFiltrados = Array.from(codigosMascotas).filter(
					(codigo) => !codigosUsuario.has(codigo)
				);
				setCodigosUnicos(new Set(codigosFiltrados)); // Actualiza el estado con los códigos filtrados
			} catch (error) {
				console.error("Error al obtener códigos únicos:", error);
			}
		};

		fetchData(); // Llama a la función fetchData al montar el componente y cuando 'id' cambia
	}, [id]);

	// Función para manejar el envío del formulario
	const handleSubmit = async (e) => {
		e.preventDefault(); // Evita el comportamiento predeterminado del formulario

		// Validación del formato del código
		const codigoValido = /^[\w@#&]{4}[0-9]{4}$/.test(codigo);
		if (!codigoValido) {
			setMensaje("El código debe tener 4 letras seguidas de 4 números.");
			return;
		}

		// Validación de existencia del código en los códigos únicos
		if (codigosUnicos.has(codigo)) {
			setCargando(true); // Establece el estado de carga a verdadero

			try {
				// Realiza una solicitud POST para agregar el código en la ruta específica según el 'id'
				const instance = axios.create({
					baseURL:
						"https://smartpet-1d59e-default-rtdb.firebaseio.com", // URL base de la base de datos
					timeout: 5000, // Tiempo máximo de espera para la solicitud en milisegundos
					headers: {
						"Content-Type": "application/json", // Tipo de contenido de la solicitud
					},
				});

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

			setCargando(false); // Establece el estado de carga a falso
		} else {
			setMensaje(
				"El código ingresado no es válido o ya ha sido utilizado."
			); // Mensaje de error si el código no es válido o ya existe
		}
	};

	// Función para manejar cambios en el input de código
	const handleChange = (e) => {
		setCodigo(e.target.value); // Actualiza el estado del código con el valor del input
	};

	return (
		<section className=" agregar-container section-validador ">
			<div className="agregar-form-container">
				{cargando ? (
					<div className="agregar-loading-container">
						<p>Aguarde mientras se inicia la base de datos...</p>
						<div className="agregar-loading-ring"></div>
					</div>
				) : (
					<>
						<h2 className="agregar-h2">Agregar Código</h2>
						<form
							onSubmit={handleSubmit}
							className="agregar-codigo-form"
						>
							<input
								type="text"
								id="codigo"
								value={codigo}
								onChange={handleChange}
								placeholder="Ej. ABCD1234"
								required
							/>
							<div className="contenedor-btns">

								<button type="submit">Agregar</button>
								{/* Botón para abrir el modal */}
								<div className="info-modal-container text-center my-3">
									<Button variant="outline-info" onClick={() => setShowModal(true)}>
										Info
									</Button>
								</div>

								{/* Modal */}
								<Modal show={showModal} onHide={() => setShowModal(false)} centered>
									<Modal.Header closeButton>
										<Modal.Title>Información Adicional</Modal.Title>
									</Modal.Header>
									<Modal.Body>
										<p className="mb-3">
											Debajo del código de activación verás un botón que dice "Ver mapa" si la ubicación
											está disponible, o "Ubicación no disponible" si no se compartió.
										</p>
										<p className="mb-0">
											<strong>Recomendación:</strong> Revisa el perfil desde "Mostrar mascota". Al escanear
											el collar, la ubicación podría actualizarse.
										</p>
									</Modal.Body>
								</Modal>
							</div>
						</form>
						{mensaje && (
							<p
								className={`agregar-mensaje ${mensaje.includes("correctamente")
									? "mensaje-exito"
									: ""
									}`}
							>
								{mensaje}
							</p>
						)}
					</>
				)}
			</div>
		</section>
	);
};

export default Agregarcodigo;
