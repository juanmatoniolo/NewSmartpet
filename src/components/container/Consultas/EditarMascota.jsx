import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import API_BASE from "../../../config/api";

const API_URL = `${API_BASE}/index.php`;

function EditarMascota({ show, handleClose, mascota, idMascota, onSave }) {
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nombre: "",
        fecha_nacimiento: "",
        sexo: "",
        direccion: "",
        descripcion: "",
        persona1: "",
        persona1tel: "",
        persona1ig: "",
        persona2: "",
        persona2tel: "",
        persona2ig: "",
        mensajeRescate: ""
    });

    const [imagen, setImagen] = useState(null);
    const [preview, setPreview] = useState("");
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");

    const buildImageUrl = (url) => {
        if (!url) return "";

        if (
            url.startsWith("http://") ||
            url.startsWith("https://") ||
            url.startsWith("blob:")
        ) {
            return url;
        }

        const cleanPath = url.replace(/^\/+/, "");
        return `${API_BASE}/${cleanPath}`;
    };

    useEffect(() => {
        if (!show || !mascota) return;

        setFormData({
            nombre: mascota.nombre || "",
            fecha_nacimiento: mascota.fecha_nacimiento || "",
            sexo: mascota.sexo || "",
            direccion: mascota.direccion || "",
            descripcion: mascota.descripcion || "",
            persona1: mascota.persona1 || "",
            persona1tel: mascota.persona1tel || "",
            persona1ig: mascota.persona1ig || "",
            persona2: mascota.persona2 || "",
            persona2tel: mascota.persona2tel || "",
            persona2ig: mascota.persona2ig || "",
            mensajeRescate: mascota.mensajeRescate || ""
        });

        setImagen(null);
        setPreview(mascota.urlImg ? buildImageUrl(mascota.urlImg) : "");
        setMensaje("");
        setTipoMensaje("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [show, mascota]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));

        setMensaje("");
        setTipoMensaje("");
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setMensaje("Formato inválido. Usá JPG, PNG o WEBP.");
            setTipoMensaje("danger");
            setImagen(null);
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMensaje("La imagen no puede superar los 5MB.");
            setTipoMensaje("danger");
            setImagen(null);
            return;
        }

        setImagen(file);
        setPreview(URL.createObjectURL(file));
        setMensaje("");
        setTipoMensaje("");
    };

    const validarFormulario = () => {
        if (!formData.nombre.trim()) {
            setMensaje("El nombre de la mascota es obligatorio.");
            setTipoMensaje("danger");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setCargando(true);
        setMensaje("");
        setTipoMensaje("");

        try {
            const payload = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                payload.append(key, value ?? "");
            });

            if (imagen) {
                payload.append("imagen", imagen);
            }

            const res = await fetch(`${API_URL}/upload-mascota/${idMascota}`, {
                method: "POST",
                body: payload
            });

            const data = await res.json();

            if (!res.ok || data.success === false) {
                throw new Error(data.error || "No se pudo actualizar la mascota.");
            }

            setMensaje("Mascota actualizada correctamente.");
            setTipoMensaje("success");

            if (onSave) {
                await onSave(data.mascota || data);
            }

            setTimeout(() => {
                handleClose();
            }, 600);
        } catch (error) {
            setMensaje(error.message || "Error al actualizar la mascota.");
            setTipoMensaje("danger");
        } finally {
            setCargando(false);
        }
    };

    const handleCloseModal = () => {
        if (cargando) return;
        handleClose();
    };

    const previewUrl = preview
        ? preview.startsWith("blob:")
            ? preview
            : `${preview}?v=${Date.now()}`
        : "";

    return (
        <Modal show={show} onHide={handleCloseModal} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Editar mascota</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {mensaje && (
                        <Alert variant={tipoMensaje || "info"} className="mb-3">
                            {mensaje}
                        </Alert>
                    )}

                    <div className="editar-mascota-preview">
                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt={`Foto de ${formData.nombre || "mascota"}`}
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <div className="editar-mascota-placeholder">Sin imagen</div>
                        )}
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Imagen de la mascota</Form.Label>
                        <Form.Control
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            disabled={cargando}
                        />
                        <Form.Text className="text-muted">
                            La imagen se guardará con el nombre de la mascota. Formatos: JPG, PNG o WEBP. Máximo 5MB.
                        </Form.Text>
                    </Form.Group>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre de la mascota"
                                    disabled={cargando}
                                    required
                                />
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha de nacimiento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Sexo</Form.Label>
                                <Form.Select
                                    name="sexo"
                                    value={formData.sexo}
                                    onChange={handleChange}
                                    disabled={cargando}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Macho">Macho</option>
                                    <option value="Hembra">Hembra</option>
                                </Form.Select>
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    placeholder="Dirección"
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción de la mascota"
                            disabled={cargando}
                        />
                    </Form.Group>

                    <hr />

                    <h6 className="mb-3">Contacto principal</h6>

                    <div className="row">
                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="persona1"
                                    value={formData.persona1}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="persona1tel"
                                    value={formData.persona1tel}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Instagram</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="persona1ig"
                                    value={formData.persona1ig}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <h6 className="mb-3">Contacto secundario</h6>

                    <div className="row">
                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="persona2"
                                    value={formData.persona2}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="persona2tel"
                                    value={formData.persona2tel}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>

                        <div className="col-12 col-md-4">
                            <Form.Group className="mb-3">
                                <Form.Label>Instagram</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="persona2ig"
                                    value={formData.persona2ig}
                                    onChange={handleChange}
                                    disabled={cargando}
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Mensaje de rescate</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="mensajeRescate"
                            value={formData.mensajeRescate}
                            onChange={handleChange}
                            placeholder="Mensaje visible para quien escanee el QR"
                            disabled={cargando}
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal} disabled={cargando}>
                        Cancelar
                    </Button>

                    <Button variant="primary" type="submit" disabled={cargando}>
                        {cargando ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-2" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar cambios"
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default EditarMascota;