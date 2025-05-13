import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { app } from "../../db/db";
import Spinner from "react-bootstrap/Spinner";
import "./Editar.css"





const EditarDatos = ({ show, handleClose, mascota, id, onSave }) => {
	const [formData, setFormData] = useState(mascota); // Estado para almacenar los datos del formulario
	const [archivo, setArchivo] = useState(null); // Estado para almacenar el archivo seleccionado
	const [archivoURL, setArchivoURL] = useState(null); // Estado para almacenar la URL del archivo previsualizado
	const [error, setError] = useState(null); // Estado para manejar errores de validación
	const [linkFirestore, setLinkFirestore] = useState(""); // Estado para almacenar el link de Firestore
	const [cargando, setCargando] = useState(false); // Estado para manejar el estado de carga

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			datosMascotas: {
				...formData.datosMascotas,
				[name]: value,
			},
		});
	};

	const guardarDatos = async (id, formData) => {
		const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas/${id}.json`;

		try {
			const response = await axios.patch(url, formData);
			console.log("Datos guardados correctamente:", response.data);
			return response.data;
		} catch (error) {
			console.error("Error al guardar los datos:", error);
			throw error;
		}
	};

	const handleSaveChanges = async () => {
		if (linkFirestore) {
			// Actualiza el campo de la imagen en formData
			setFormData((prevFormData) => ({
				...prevFormData,
				datosMascotas: {
					...prevFormData.datosMascotas,
					img: linkFirestore,
				},
			}));
		}

		try {
			// Guardar los cambios en la base de datos
			await guardarDatos(id, formData);
			console.log("Datos actualizados:", formData);
			if (onSave) {
				onSave(); // Llama a la función de actualización pasada como prop
			}
			handleClose(); // Cierra el modal después de guardar
		} catch (error) {
			console.error("Error al guardar cambios:", error);
		}
	};

	const archivoHandeler = (e) => {
		const archivoSeleccionado = e.target.files[0];

		// Validación del tamaño del archivo
		if (archivoSeleccionado.size > 5 * 1024 * 1024) {
			setError("El archivo no puede pesar más de 5MB");
			setArchivo(null);
			setArchivoURL(null);
		} else {
			setError(null);
			setArchivo(archivoSeleccionado); // Almacena el archivo seleccionado en el estado

			// Previsualiza la imagen seleccionada
			const reader = new FileReader();
			reader.onload = () => {
				setArchivoURL(reader.result); // Almacena la URL del archivo previsualizado en el estado
			};
			reader.readAsDataURL(archivoSeleccionado);
		}
	};

	const guardarArchivo = async () => {
		if (!archivo) {
			setError("Por favor selecciona un archivo antes de guardar.");
			return;
		}

		setCargando(true); // Muestra el indicador de carga
		try {
			const storage = getStorage(app);
			const archivoRef = ref(storage, archivo.name);
			await uploadBytes(archivoRef, archivo);
			const url = await getDownloadURL(archivoRef);
			setLinkFirestore(url); // Almacena la URL del archivo guardado en Firestore
			console.log("Archivo cargado y guardado en:", url);

			// Reiniciar el archivo
			setArchivo(null);
			setArchivoURL(null);
			setError(null);

			// Actualiza la previsualización con la nueva URL
			setFormData((prevFormData) => ({
				...prevFormData,
				datosMascotas: {
					...prevFormData.datosMascotas,
					img: url,
				},
			}));
		} catch (error) {
			console.error("Error al guardar el archivo:", error);
			setError("Error al cargar la imagen. Inténtalo de nuevo.");
		} finally {
			setCargando(false); // Oculta el indicador de carga
		}
	};

	const handleCancel = () => {
		// Limpia el archivo y la previsualización si se cancela
		setArchivo(null);
		setArchivoURL(null);
		setCargando(false);
		handleClose();
	};

	return (
		<Modal show={show} fullscreen onHide={handleCancel} animation>
			<Modal.Header closeButton>
				<Modal.Title className="text-center w-100">Editar Datos de la Mascota</Modal.Title>
			</Modal.Header>

			<Modal.Body className="container-fluid">
				<Form className="row g-4">
					{/* Imagen */}
					<Form.Group className="col-12 text-center">
						<Form.Label className="fw-bold col-12">Imagen de la Mascota</Form.Label>
						{!archivoURL && formData?.datosMascotas?.img && (
							<img src={formData.datosMascotas.img} alt="Imagen actual" className="img-mascota-editar img-fluid rounded mb-2" style={{ maxHeight: 200 }} />
						)}
						<input type="file" onChange={archivoHandeler} className="form-control mb-2 col-12" />
						{error && <p className="text-danger">{error}</p>}
						{archivoURL && (
							<img src={archivoURL} alt="Previsualización" className="img-mascota-editar img-fluid rounded mb-2" style={{ maxHeight: 200 }} />
						)}
						<Button variant="primary" onClick={guardarArchivo} className="col-5 mb-2">Guardar Imagen</Button>
						{cargando && (
							<div className="text-center mt-2">
								<Spinner animation="border" />
								<p className="mt-2">Cargando...</p>
							</div>
						)}
					</Form.Group>

					{/* Datos Básicos */}
					<Form.Group className="col-md-6 col-12">
						<Form.Label className="Form-labl-editar" >Nombre</Form.Label>
						<Form.Control
							type="text"
							placeholder="Nombre de la mascota"
							name="nombre"
							value={formData?.datosMascotas?.nombre || ""}
							onChange={handleChange}
						/>
					</Form.Group>

					<Form.Group className="col-md-6 col-12">
						<Form.Label className="Form-labl-editar" >Edad</Form.Label>
						<Form.Control
							type="text"
							placeholder="Edad de la mascota"
							name="edad"
							value={formData?.datosMascotas?.edad || ""}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Sexo */}
					<Form.Group className="col-md-6 col-12">
						<Form.Label className="Form-labl-editar" >Sexo</Form.Label>
						<div className="d-flex gap-3">
							<Form.Check
								type="radio"
								label="Macho"
								name="sexo"
								value="Macho"
								checked={formData?.datosMascotas?.sexo === "Macho"}
								onChange={handleChange}
							/>
							<Form.Check
								type="radio"
								label="Hembra"
								name="sexo"
								value="Hembra"
								checked={formData?.datosMascotas?.sexo === "Hembra"}
								onChange={handleChange}
							/>
						</div>
					</Form.Group>

					<Form.Group className="col-md-6 col-12">
						<Form.Label className="Form-labl-editar" >Ciudad y Provincia</Form.Label>
						<Form.Control
							type="text"
							placeholder="Ubicación"
							name="ubicacion"
							value={formData?.datosMascotas?.ubicacion || ""}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Descripción */}
					<Form.Group className="col-12">
						<Form.Label className="Form-labl-editar" >Descripción</Form.Label>
						<Form.Control
							as="textarea"
							rows={3}
							placeholder="Breve descripción o datos relevantes"
							name="descripcion"
							value={formData?.datosMascotas?.descripcion || ""}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Mensaje predeterminado */}
					<Form.Group className="col-12">
						<Form.Label className="Form-labl-editar" >Mensaje predeterminado de WhatsApp</Form.Label>
						<Form.Control
							type="text"
							placeholder="Mensaje predeterminado para WhatsApp"
							name="mensaje"
							value={formData?.datosMascotas?.mensaje || ""}
							onChange={handleChange}
						/>
					</Form.Group>

					{/* Contactos */}
					{[1, 2].map((index) => (
						<Form.Group className="col-md-6 col-12" key={index}>
							<Form.Label className="Form-labl-editar" >Contacto {index}</Form.Label>
							<Form.Control
								type="text"
								placeholder="Nombre del dueño/a"
								name={`persona${index}`}
								value={formData?.datosMascotas?.[`persona${index}`] || ""}
								onChange={handleChange}
								className="mb-2"
							/>
							<Form.Control
								type="text"
								placeholder="Teléfono sin 0 ni 15. Ej.: 3412275598"
								name={`telefono${index}`}
								value={formData?.datosMascotas?.[`telefono${index}`] || ""}
								onChange={handleChange}
								className="mb-2"
							/>
							<Form.Control
								type="text"
								placeholder="@UsuarioDeInstagram"
								name={`ig${index}`}
								value={formData?.datosMascotas?.[`ig${index}`] || ""}
								onChange={handleChange}
							/>
						</Form.Group>
					))}
				</Form>
			</Modal.Body>

			<Modal.Footer className="d-flex flex-row flex-md-row gap-2">
				<Button variant="danger" onClick={handleCancel} className="w-40">
					Cancelar
				</Button>
				<Button variant="primary" onClick={handleSaveChanges} className="w-40">
					Guardar Cambios
				</Button>
			</Modal.Footer>
		</Modal>

	);
};

export default EditarDatos;
