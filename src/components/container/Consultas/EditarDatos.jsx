import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { app } from "../../db/db";

const EditarDatos = ({ show, handleClose, mascota, id, onSave }) => {
	const [formData, setFormData] = useState(mascota); // Estado para almacenar los datos del formulario
	const [archivo, setArchivo] = useState(null); // Estado para almacenar el archivo seleccionado
	const [archivoURL, setArchivoURL] = useState(null); // Estado para almacenar la URL del archivo previsualizado
	const [error, setError] = useState(null); // Estado para manejar errores de validación
	const [linkFirestore, setLinkFirestore] = useState(""); // Estado para almacenar el link de Firestore

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

	// Manejador de eventos para la selección de archivos
	const archivoHandeler = (e) => {
		const archivoSeleccionado = e.target.files[0];

		// Validación del tamaño del archivo
		if (archivoSeleccionado.size > 3 * 1024 * 1024) {
			setError("El archivo no puede pesar más de 3MB");
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

	// Manejador de eventos para guardar el archivo en Firebase Storage
	const guardarArchivo = async () => {
		if (!archivo) {
			setError("Por favor selecciona un archivo antes de guardar.");
			return;
		}

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
		} catch (error) {
			console.error("Error al guardar el archivo:", error);
		}
	};

	const handleCancel = () => {
		// Limpia el archivo y la previsualización si se cancela
		setArchivo(null);
		setArchivoURL(null);
		handleClose();
	};

	return (
		<Modal show={show} fullscreen onHide={handleCancel} animation={true}>
			<Modal.Header closeButton>
				<Modal.Title className="text-center">
					Editar Datos de la Mascota
				</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form>
					<div className="container">
						<Form.Group className="mb-4">
							<Form.Label>Imagen de la Mascota</Form.Label>
							<div className="text-center">
								{!archivoURL &&
									formData?.datosMascotas?.img && (
										<img
											src={formData.datosMascotas.img}
											alt="Imagen actual"
											style={{
												maxWidth: "12em",
												maxHeight: "12em",
												marginBottom: "1em",
												borderRadius: "10px",
												objectFit: "cover",
											}}
										/>
									)}
								<input
									type="file"
									onChange={archivoHandeler}
									style={{ marginBottom: "1em" }}
								/>
								{error && (
									<p style={{ color: "red" }}>{error}</p>
								)}
								{archivoURL && (
									<div className="mt-3">
										<img
											src={archivoURL}
											alt="Previsualización"
											style={{
												maxWidth: "12em",
												maxHeight: "12em",
												borderRadius: "10px",
												objectFit: "cover",
											}}
										/>
									</div>
								)}
								<Button
									variant="primary"
									className="mt-3"
									onClick={guardarArchivo}
								>
									Guardar Imagen
								</Button>
							</div>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Nombre</Form.Label>
							<Form.Control
								type="text"
								placeholder="Nombre de la mascota"
								name="nombre"
								value={formData?.datosMascotas?.nombre || ""}
								onChange={handleChange}
								className="form-control-lg"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Sexo</Form.Label>
							<div className="d-flex flex-column">
								<Form.Check
									type="radio"
									label="Macho"
									name="sexo"
									value="Macho"
									checked={
										formData?.datosMascotas?.sexo ===
										"Macho"
									}
									onChange={handleChange}
								/>
								<Form.Check
									type="radio"
									label="Hembra"
									name="sexo"
									value="Hembra"
									checked={
										formData?.datosMascotas?.sexo ===
										"Hembra"
									}
									onChange={handleChange}
								/>
							</div>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Edad</Form.Label>
							<Form.Control
								type="text"
								placeholder="Edad de la mascota"
								name="edad"
								value={formData?.datosMascotas?.edad || ""}
								onChange={handleChange}
								className="form-control-lg"
							/>
						</Form.Group>

						<Form.Group className="mb-4">
							<Form.Label>Ciudad y provincia</Form.Label>
							<Form.Control
								type="text"
								placeholder="Ubicación"
								name="ubicacion"
								value={formData?.datosMascotas?.ubicacion || ""}
								onChange={handleChange}
								className="form-control-lg"
							/>
						</Form.Group>

						<hr />

						<Form.Group className="mb-4">
							<Form.Label>Descripción</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								placeholder="Breve descripción o datos que considere relevantes"
								name="descripcion"
								value={
									formData?.datosMascotas?.descripcion || ""
								}
								onChange={handleChange}
								className="form-control-lg"
							/>
						</Form.Group>

						<hr />

						<Form.Group className="mb-4">
							<Form.Label>
								Mensaje predeterminado de Whatsapp
							</Form.Label>
							<Form.Control
								type="text"
								placeholder="Hola, encontré a ...."
								name="mensaje"
								value={formData?.datosMascotas?.mensaje || ""}
								onChange={handleChange}
								className="form-control-lg"
							/>
									</Form.Group>

<Form.Group className="mb-4">
    <Form.Label>Contacto 1</Form.Label>
    <Form.Control
        type="text"
        placeholder="Nombre del dueño/a"
        name="persona1"
        value={formData?.datosMascotas?.persona1 || ""}
        onChange={handleChange}
        className="form-control-lg"
    />
    <Form.Control
        type="text"
        placeholder="Número de teléfono"
        name="telefono1"
        value={formData?.datosMascotas?.telefono1 || ""}
        onChange={handleChange}
        className="form-control-lg mt-2"
    />
    <Form.Control
        type="text"
        placeholder="Usuario de Instagram"
        name="ig1"
        value={formData?.datosMascotas?.ig1 || ""}
        onChange={handleChange}
        className="form-control-lg mt-2"
    />
</Form.Group>

<Form.Group className="mb-4">
    <Form.Label>Contacto 2</Form.Label>
    <Form.Control
        type="text"
        placeholder="Nombre del dueño/a"
        name="persona2"
        value={formData?.datosMascotas?.persona2 || ""}
        onChange={handleChange}
        className="form-control-lg"
    />
    <Form.Control
        type="text"
        placeholder="Número de teléfono"
        name="telefono2"
        value={formData?.datosMascotas?.telefono2 || ""}
        onChange={handleChange}
        className="form-control-lg mt-2"
    />
    <Form.Control
        type="text"
        placeholder="Usuario de Instagram"
        name="ig2"
        value={formData?.datosMascotas?.ig2 || ""}
        onChange={handleChange}
        className="form-control-lg mt-2"
    />
</Form.Group>
</div>
				</Form>
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={handleCancel}>
					Cancelar
				</Button>
				<Button variant="primary" onClick={handleSaveChanges}>
					Guardar Cambios
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EditarDatos;
