import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import axios from "axios";

const API_BASE = "http://localhost/api-smartpet/index.php";

function EditarMascota({ show, handleClose, mascota, idMascota, onSave }) {
    const [formData, setFormData] = useState({
        nombre: "",
        fecha_nacimiento: "",
        sexo: "",
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
            setError("Máximo 5MB");
            setArchivo(null);
            setArchivoURL(null);
        } else {
            setError(null);
            setArchivo(file);
            setArchivoURL(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
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
            setError("Error al guardar");
        } finally {
            setCargando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton><Modal.Title>Editar mascota</Modal.Title></Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group><Form.Label>Imagen</Form.Label><input type="file" onChange={archivoHandler} className="form-control" /></Form.Group>
                    {archivoURL && <img src={archivoURL} alt="Preview" style={{ width: "100px", marginTop: "10px" }} />}
                    <Form.Group><Form.Label>Nombre</Form.Label><Form.Control name="nombre" value={formData.nombre} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Label>Fecha nacimiento</Form.Label><Form.Control type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Label>Sexo</Form.Label><div><Form.Check inline label="Macho" name="sexo" type="radio" value="Macho" checked={formData.sexo === "Macho"} onChange={handleChange} /><Form.Check inline label="Hembra" name="sexo" type="radio" value="Hembra" checked={formData.sexo === "Hembra"} onChange={handleChange} /></div></Form.Group>
                    <Form.Group><Form.Label>Dirección</Form.Label><Form.Control name="direccion" value={formData.direccion} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Label>Descripción</Form.Label><Form.Control as="textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Label>Mensaje WhatsApp</Form.Label><Form.Control name="mensajeRescate" value={formData.mensajeRescate} onChange={handleChange} /></Form.Group>
                    <h5>Contacto 1</h5>
                    <Form.Group><Form.Control placeholder="Nombre" name="persona1" value={formData.persona1} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Control placeholder="Teléfono" name="persona1tel" value={formData.persona1tel} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Control placeholder="@Instagram" name="persona1ig" value={formData.persona1ig} onChange={handleChange} /></Form.Group>
                    <h5>Contacto 2</h5>
                    <Form.Group><Form.Control placeholder="Nombre" name="persona2" value={formData.persona2} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Control placeholder="Teléfono" name="persona2tel" value={formData.persona2tel} onChange={handleChange} /></Form.Group>
                    <Form.Group><Form.Control placeholder="@Instagram" name="persona2ig" value={formData.persona2ig} onChange={handleChange} /></Form.Group>
                    {error && <div className="text-danger mt-2">{error}</div>}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleSave} disabled={cargando}>{cargando ? <Spinner size="sm" /> : "Guardar"}</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default EditarMascota;