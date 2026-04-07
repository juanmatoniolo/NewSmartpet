import React, { useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import "./CrearMascotaDesdeCodigo.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function CrearMascotaDesdeCodigo({ usuarioId, codigoId, codigoUnico, onCreada }) {
    const [show, setShow] = useState(false);
    const [formData, setFormData] = useState({
        nombre: "",
        fecha_nacimiento: "",
        sexo: "Macho",
        direccion: "",
        descripcion: "",
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const archivoHandler = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Máximo 5MB");
            setArchivo(null);
            setArchivoURL(null);
        } else {
            setError(null);
            setArchivo(file);
            setArchivoURL(URL.createObjectURL(file));
        }
    };

    const subirImagen = async (mascotaId, file) => {
        const formDataImg = new FormData();
        formDataImg.append("imagen", file);
        await axios.post(`${API_BASE}/upload-imagen/${mascotaId}`, formDataImg, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    };

    const handleSubmit = async () => {
        setCargando(true);
        try {
            // 1. Crear la mascota sin imagen
            const payload = {
                id_usuario: parseInt(usuarioId),
                codigo_id: parseInt(codigoId),
                nombre: formData.nombre,
                fecha_nacimiento: formData.fecha_nacimiento,
                sexo: formData.sexo === "Hembra" ? 1 : 0,
                direccion: formData.direccion,
                descripcion: formData.descripcion,
                persona1: formData.persona1,
                persona1tel: formData.persona1tel,
                persona1ig: formData.persona1ig,
                persona2: formData.persona2,
                persona2tel: formData.persona2tel,
                persona2ig: formData.persona2ig,
                mensajeRescate: formData.mensajeRescate,
            };
            const response = await axios.post(`${API_BASE}/mascotas`, payload);
            const nuevaMascotaId = response.data.id;

            // 2. Si hay imagen, subirla
            if (archivo) {
                await subirImagen(nuevaMascotaId, archivo);
            }

            onCreada(); // Refrescar lista
            setShow(false);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Error al crear mascota");
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Card className="crear-mascota-card" onClick={() => setShow(true)}>
                <Card.Body>
                    <Card.Title>➕ Código: {codigoUnico}</Card.Title>
                    <Card.Text>Haz clic para registrar los datos de tu mascota</Card.Text>
                    <Button variant="success">Registrar mascota</Button>
                </Card.Body>
            </Card>

            <Modal show={show} onHide={() => setShow(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Registrar mascota para código {codigoUnico}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Imagen (opcional)</Form.Label>
                            <input type="file" onChange={archivoHandler} className="form-control" accept="image/*" />
                            {archivoURL && <img src={archivoURL} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}
                        </Form.Group>
                        <Form.Group><Form.Label>Nombre</Form.Label><Form.Control name="nombre" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Label>Fecha nacimiento</Form.Label><Form.Control type="date" name="fecha_nacimiento" onChange={handleChange} /></Form.Group>
                        <Form.Group>
                            <Form.Label>Sexo</Form.Label>
                            <div>
                                <Form.Check inline label="Macho" name="sexo" type="radio" value="Macho" checked={formData.sexo === "Macho"} onChange={handleChange} />
                                <Form.Check inline label="Hembra" name="sexo" type="radio" value="Hembra" checked={formData.sexo === "Hembra"} onChange={handleChange} />
                            </div>
                        </Form.Group>
                        <Form.Group><Form.Label>Dirección</Form.Label><Form.Control name="direccion" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Label>Descripción</Form.Label><Form.Control as="textarea" name="descripcion" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Label>Mensaje WhatsApp</Form.Label><Form.Control name="mensajeRescate" onChange={handleChange} /></Form.Group>
                        <h5>Contacto 1</h5>
                        <Form.Group><Form.Control placeholder="Nombre" name="persona1" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Control placeholder="Teléfono" name="persona1tel" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Control placeholder="@Instagram" name="persona1ig" onChange={handleChange} /></Form.Group>
                        <h5>Contacto 2</h5>
                        <Form.Group><Form.Control placeholder="Nombre" name="persona2" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Control placeholder="Teléfono" name="persona2tel" onChange={handleChange} /></Form.Group>
                        <Form.Group><Form.Control placeholder="@Instagram" name="persona2ig" onChange={handleChange} /></Form.Group>
                        {error && <div className="text-danger mt-2">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShow(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={cargando}>
                        {cargando ? <Spinner size="sm" /> : "Guardar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default CrearMascotaDesdeCodigo;