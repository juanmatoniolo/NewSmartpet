import React, { useState } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import "./TarjetaCodigoVacio.css";

import API_BASE from "../../../config/api"; // Ruta correcta según tu estructura

function TarjetaCodigoVacio({ codigoId, codigoUnico, usuarioId, onMascotaCreada }) {
    // 🔧 Construir URL completa con index.php
    const API_URL = `${API_BASE}/index.php`;

    const [showModal, setShowModal] = useState(false);
    const [copiado, setCopiado] = useState(false);
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

    const copiarCodigo = () => {
        navigator.clipboard.writeText(codigoUnico);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
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

    const handleCrear = async () => {
        if (!formData.nombre.trim()) {
            setError("El nombre es obligatorio");
            return;
        }
        setCargando(true);
        try {
            const payload = {
                id_usuario: usuarioId,
                codigo_id: codigoId,
                ...formData,
                sexo: formData.sexo === "Hembra" ? 1 : 0,
            };
            // ✅ Usar API_URL en lugar de concatenar API_BASE + /index.php/
            const resCrear = await axios.post(`${API_URL}/mascotas`, payload);
            const mascotaId = resCrear.data.id;

            if (archivo) {
                const formDataImg = new FormData();
                formDataImg.append("imagen", archivo);
                await axios.post(`${API_URL}/upload-imagen/${mascotaId}`, formDataImg, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            setShowModal(false);
            if (onMascotaCreada) onMascotaCreada();
        } catch (err) {
            setError(err.response?.data?.error || "Error al crear mascota");
        } finally {
            setCargando(false);
        }
    };

    return (
        <>
            <Card className="tarjeta-codigo-vacio">
                <div className="codigo-badge-wrapper">
                    <Badge
                        bg="warning"
                        text="dark"
                        className="codigo-badge"
                        onClick={copiarCodigo}
                        style={{ cursor: 'pointer' }}
                    >
                        {copiado ? '✓ Copiado' : `🔑 ${codigoUnico}`}
                    </Badge>
                </div>
                <Card.Body className="text-center">
                    <div className="icono-vacio">📦</div>
                    <Card.Title>Código sin mascota</Card.Title>
                    <Card.Text className="text-muted">
                        Este código aún no tiene una mascota registrada
                    </Card.Text>
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        + Crear mascota
                    </Button>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Crear mascota para {codigoUnico}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Imagen</Form.Label>
                            <input type="file" onChange={archivoHandler} className="form-control" />
                        </Form.Group>
                        {archivoURL && <img src={archivoURL} alt="Preview" style={{ width: "100px", marginBottom: "10px" }} />}

                        <Form.Group className="mb-3">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control name="nombre" value={formData.nombre} onChange={handleChange} required />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Fecha nacimiento</Form.Label>
                            <Form.Control type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sexo</Form.Label>
                            <div>
                                <Form.Check inline label="Macho" name="sexo" type="radio" value="Macho" checked={formData.sexo === "Macho"} onChange={handleChange} />
                                <Form.Check inline label="Hembra" name="sexo" type="radio" value="Hembra" checked={formData.sexo === "Hembra"} onChange={handleChange} />
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control name="direccion" value={formData.direccion} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control as="textarea" name="descripcion" value={formData.descripcion} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Mensaje WhatsApp</Form.Label>
                            <Form.Control name="mensajeRescate" value={formData.mensajeRescate} onChange={handleChange} />
                        </Form.Group>

                        <h5>Contacto 1</h5>
                        <Form.Group className="mb-2">
                            <Form.Control placeholder="Nombre" name="persona1" value={formData.persona1} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Control placeholder="Teléfono" name="persona1tel" value={formData.persona1tel} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control placeholder="@Instagram" name="persona1ig" value={formData.persona1ig} onChange={handleChange} />
                        </Form.Group>

                        <h5>Contacto 2</h5>
                        <Form.Group className="mb-2">
                            <Form.Control placeholder="Nombre" name="persona2" value={formData.persona2} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Control placeholder="Teléfono" name="persona2tel" value={formData.persona2tel} onChange={handleChange} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Control placeholder="@Instagram" name="persona2ig" value={formData.persona2ig} onChange={handleChange} />
                        </Form.Group>

                        {error && <div className="text-danger mt-2">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleCrear} disabled={cargando}>
                        {cargando ? <Spinner size="sm" /> : "Crear"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default TarjetaCodigoVacio;