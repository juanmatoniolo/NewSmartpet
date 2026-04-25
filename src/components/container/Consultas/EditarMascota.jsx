import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Row, Col } from "react-bootstrap";
import axios from "axios";
import "./EditarMascota.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function EditarMascota({ show, handleClose, mascota, idMascota, onSave }) {
    const [formData, setFormData] = useState({
        nombre: "",
        fecha_nacimiento: "",
        sexo: "Macho",
        direccion: "",
        descripcion: "",
        urlImg: "",
        persona1: "",
        persona1tel: "",
        persona1ig: "",
        persona2: "",
        persona2tel: "",
        persona2ig: "",
        mensajeRescate: "",
    });
    const [archivo, setArchivo] = useState(null);
    const [archivoURL, setArchivoURL] = useState(null);
    const [error, setError] = useState(null);
    const [cargando, setCargando] = useState(false);

    useEffect(() => {
        if (mascota) {
            setFormData({
                nombre: mascota.nombre || "",
                fecha_nacimiento: mascota.fecha_nacimiento || "",
                sexo: mascota.sexo === 1 ? "Hembra" : "Macho",
                direccion: mascota.direccion || "",
                descripcion: mascota.descripcion || "",
                urlImg: mascota.urlImg || "",
                persona1: mascota.persona1 || "",
                persona1tel: mascota.persona1tel || "",
                persona1ig: mascota.persona1ig || "",
                persona2: mascota.persona2 || "",
                persona2tel: mascota.persona2tel || "",
                persona2ig: mascota.persona2ig || "",
                mensajeRescate: mascota.mensajeRescate || "",
            });
            setArchivo(null);
            setArchivoURL(null);
            setError(null);
        }
    }, [mascota]);

    const subirImagen = async (file) => {
        const formDataImg = new FormData();
        formDataImg.append("imagen", file);
        const res = await axios.post(`${API_BASE}/upload-imagen/${idMascota}`, formDataImg, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data.url;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const archivoHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("La imagen no puede superar los 5MB");
            setArchivo(null);
            setArchivoURL(null);
        } else {
            setError(null);
            setArchivo(file);
            setArchivoURL(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!formData.nombre.trim()) {
            setError("El nombre de la mascota es obligatorio");
            return;
        }
        setCargando(true);
        try {
            let imgUrl = formData.urlImg;
            if (archivo) imgUrl = await subirImagen(archivo);
            const payload = {
                ...formData,
                urlImg: imgUrl,
                sexo: formData.sexo === "Hembra" ? 1 : 0,
            };
            await axios.put(`${API_BASE}/mascotas/${idMascota}`, payload);
            if (onSave) onSave();
            handleClose();
        } catch (err) {
            setError(err.response?.data?.error || "Error al guardar los cambios");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered className="editar-mascota-modal">
            <Modal.Header closeButton>
                <Modal.Title>✏️ Editar mascota</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {/* Sección Imagen */}
                    <div className="imagen-seccion mb-4">
                        <Form.Label className="fw-semibold">📸 Imagen de perfil</Form.Label>
                        <div className="d-flex flex-wrap align-items-start gap-3">
                            {(archivoURL || formData.urlImg) && (
                                <div className="preview-actual">
                                    <div className="preview-label">Vista previa</div>
                                    <img
                                        src={archivoURL || formData.urlImg}
                                        alt="Preview"
                                        className="img-preview"
                                    />
                                </div>
                            )}
                            <div className="upload-area flex-grow-1">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={archivoHandler}
                                    className="form-control"
                                />
                                <div className="text-muted small mt-1">
                                    Formatos: JPG, PNG, GIF. Máx. 5MB
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Datos básicos */}
                    <h5 className="seccion-titulo">🐾 Datos básicos</h5>
                    <Row className="g-3 mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Ej: Luna"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Fecha de nacimiento</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Sexo</Form.Label>
                                <div className="d-flex gap-4">
                                    <Form.Check
                                        inline
                                        label="Macho"
                                        name="sexo"
                                        type="radio"
                                        value="Macho"
                                        checked={formData.sexo === "Macho"}
                                        onChange={handleChange}
                                    />
                                    <Form.Check
                                        inline
                                        label="Hembra"
                                        name="sexo"
                                        type="radio"
                                        value="Hembra"
                                        checked={formData.sexo === "Hembra"}
                                        onChange={handleChange}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    name="direccion"
                                    value={formData.direccion}
                                    onChange={handleChange}
                                    placeholder="barrio, ciudad (evite datos sensibles)"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Descripción / características</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Color, tamaño, personalidad, alergias, etc."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Contactos de emergencia */}
                    <h5 className="seccion-titulo">📞 Contactos de emergencia</h5>
                    <Row className="g-3 mb-4">
                        <Col xs={12}>
                            <Form.Group>
                                <Form.Label>Mensaje para WhatsApp (alerta)</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="mensajeRescate"
                                    value={formData.mensajeRescate}
                                    onChange={handleChange}
                                    placeholder="Ej: ¡Mi perro se ha perdido! Por favor ayúdame..."
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row className="g-3">
                        <Col md={6}>
                            <div className="contacto-card">
                                <h6 className="contacto-titulo">👤 Contacto principal</h6>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        placeholder="Nombre completo"
                                        name="persona1"
                                        value={formData.persona1}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        placeholder="Teléfono (con código de área)"
                                        name="persona1tel"
                                        value={formData.persona1tel}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control
                                        placeholder="@Instagram (opcional)"
                                        name="persona1ig"
                                        value={formData.persona1ig}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="contacto-card">
                                <h6 className="contacto-titulo">👤 Contacto secundario</h6>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        placeholder="Nombre completo"
                                        name="persona2"
                                        value={formData.persona2}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-2">
                                    <Form.Control
                                        placeholder="Teléfono (con código de área)"
                                        name="persona2tel"
                                        value={formData.persona2tel}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Control
                                        placeholder="@Instagram (opcional)"
                                        name="persona2ig"
                                        value={formData.persona2ig}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            </div>
                        </Col>
                    </Row>

                    {error && <div className="alert alert-danger mt-3 py-2">{error}</div>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={cargando}>
                    {cargando ? <Spinner as="span" size="sm" animation="border" /> : "Guardar cambios"}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditarMascota;