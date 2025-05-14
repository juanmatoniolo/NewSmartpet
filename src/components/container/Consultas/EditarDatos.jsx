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
	const [formData, setFormData] = useState(mascota);
	const [archivo, setArchivo] = useState(null);
	const [archivoURL, setArchivoURL] = useState(null);
	const [error, setError] = useState(null);
	const [cargando, setCargando] = useState(false);

	// Función para manejar el cambio de los datos del formulario
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

	// Función para subir la imagen a Firebase Storage y obtener la URL
	const subirImagen = async (archivo) => {
		const storage = getStorage();
		const archivoRef = ref(storage, `${archivo.name}`);

		// Subir la imagen
		await uploadBytes(archivoRef, archivo);

		// Obtener la URL de la imagen subida
		const url = await getDownloadURL(archivoRef);
		return url; // Devuelve la URL obtenida
	};

	// Función para guardar los datos de la mascota en Firebase Realtime Database
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
		setCargando(true);

		try {
			let imgUrl = formData.datosMascotas.img;

			if (archivo) {
				imgUrl = await subirImagen(archivo);
			}

			// Crear un nuevo objeto con todos los datos actualizados
			const formDataActualizado = {
				...formData,
				datosMascotas: {
					...formData.datosMascotas,
					img: imgUrl, // ahora sí se actualiza correctamente
				},
			};

			// Guardar los datos actualizados
			await guardarDatos(id, formDataActualizado);

			if (onSave) onSave();
			handleClose();
		} catch (error) {
			console.error("Error al guardar cambios:", error);
		} finally {
			setCargando(false);
		}
	};

	// Función para manejar la selección de archivos
	const archivoHandeler = (e) => {
		const archivoSeleccionado = e.target.files[0];

		if (archivoSeleccionado.size > 5 * 1024 * 1024) {
			setError("El archivo no puede pesar más de 5MB");
			setArchivo(null);
			setArchivoURL(null);
		} else {
			setError(null);
			setArchivo(archivoSeleccionado); // Almacena el archivo seleccionado

			// Previsualizar la imagen seleccionada
			const reader = new FileReader();
			reader.onload = () => {
				setArchivoURL(reader.result); // Almacena la URL del archivo previsualizado
			};
			reader.readAsDataURL(archivoSeleccionado);
		}
	};

	const handleCancel = () => {
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
							<img
								src={formData.datosMascotas.img}
								alt="Imagen actual"
								className="img-mascota-editar img-fluid rounded mb-2"
								style={{ maxHeight: 200 }}
							/>
						)}
						<input type="file" onChange={archivoHandeler} className="form-control mb-2 col-12" />
						{error && <p className="text-danger">{error}</p>}
						{archivoURL && (
							<img
								src={archivoURL}
								alt="Previsualización"
								className="img-mascota-editar img-fluid rounded mb-2"
								style={{ maxHeight: 200 }}
							/>
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
				<Button
					variant="primary"
					onClick={handleSaveChanges}
					className="w-40 guardar-cambios-totales"
					disabled={cargando} // Deshabilitar el botón mientras se está cargando la imagen
				>
					{cargando ? (
						<div className="d-flex justify-content-center">
							<Spinner animation="border" size="sm" /> Cargando...
						</div>
					) : (
						"Guardar Cambios"
					)}
				</Button>
			</Modal.Footer>
		</Modal>
	);
};

export default EditarDatos;