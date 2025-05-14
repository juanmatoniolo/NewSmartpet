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


const subirImagen = async (archivoOriginal) => {
	return new Promise((resolve, reject) => {
		// Verificar que el archivo sea una imagen válida
		if (!archivoOriginal.type.startsWith("image/")) {
			reject(new Error("El archivo no es una imagen válida."));
			return;
		}

		const reader = new FileReader();

		reader.onload = async () => {
			const img = new Image();
			img.src = reader.result;

			img.onload = async () => {
				// Crear un canvas para convertir la imagen
				const canvas = document.createElement("canvas");
				canvas.width = img.width;
				canvas.height = img.height;

				const ctx = canvas.getContext("2d");
				ctx.drawImage(img, 0, 0);

				// Convertir a WebP
				canvas.toBlob(
					async (blob) => {
						if (!blob) {
							reject(new Error("No se pudo convertir la imagen a WebP."));
							return;
						}

						// Subir la imagen convertida a Firebase Storage
						const storage = getStorage();
						const archivoWebP = new File([blob], archivoOriginal.name.replace(/\.[^/.]+$/, ".webp"), {
							type: "image/webp",
						});
						const archivoRef = ref(storage, archivoWebP.name);

						try {
							await uploadBytes(archivoRef, archivoWebP);
							const url = await getDownloadURL(archivoRef);
							resolve(url);
						} catch (error) {
							reject(error);
						}
					},
					"image/webp",
					0.8 // Calidad opcional (0 a 1)
				);
			};

			img.onerror = () => {
				reject(new Error("Error al cargar la imagen para convertir."));
			};
		};

		reader.onerror = () => {
			reject(new Error("Error al leer el archivo."));
		};

		reader.readAsDataURL(archivoOriginal);
	});
};




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
/* 	const subirImagen = async (archivoOriginal) => {
		const storage = getStorage();

		// Convertir a WebP antes de subir
		const archivoWebP = await convertirAWebP(archivoOriginal);

		const archivoRef = ref(storage, `${archivoWebP.name}`);
		await uploadBytes(archivoRef, archivoWebP);

		const url = await getDownloadURL(archivoRef);
		return url;
	}; */

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
					<Form.Group className="col-5 col-sm-12  text-center">
						<Form.Label className="fw-bold col-4 col-sm12">Imagen de la Mascota</Form.Label>
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