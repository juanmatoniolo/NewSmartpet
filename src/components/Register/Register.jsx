import React, { useState } from "react";
import "./register.css";
import Header from "../header/Header";
import Barnav from "../nav/Nav";
import Footers from "../footer/Footer";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

function Register() {
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        dni: "",
        contraseña: "",
        repetirContraseña: "",
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false); // Estado para controlar el indicador de carga
    const navigate = useNavigate(); // Crea una instancia de navigate

    // Función para manejar los cambios en los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Función para validar el DNI en la base de datos
    const validarDNI = async () => {
        try {
            const response = await axios.get(
                `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json`
            );
            const usuarios = response.data;

            // Verificar si el DNI ya existe
            return !Object.values(usuarios).some(
                (user) => user.dni === formData.dni
            );
        } catch (error) {
            console.error("Error al validar DNI:", error);
            setError("Error al verificar DNI.");
            return false;
        }
    };

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.contraseña !== formData.repetirContraseña) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (!/^.{6,}$/.test(formData.contraseña) || !/[A-Z]/.test(formData.contraseña) || !/[0-9]/.test(formData.contraseña)) {
            setError('La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.');
            return;
        }

        setLoading(true); // Muestra el indicador de carga

        const dniDisponible = await validarDNI();
        if (!dniDisponible) {
            setError("El DNI ya está en uso.");
            setLoading(false); // Oculta el indicador de carga
            return;
        }

        try {
            await axios.post(
                "https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json",
                {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    dni: formData.dni,
                    contrasenia: formData.contraseña, // Guarda la contraseña como 'contrasenia'
                }
            );
            setSuccess("Usuario creado con éxito.");
            setError("");
            setFormData({
                nombre: "",
                apellido: "",
                dni: "",
                contraseña: "",
                repetirContraseña: "",
            });
            navigate('/login'); // Redirige al login después de crear el usuario
        } catch (error) {
            console.error("Error al crear el usuario:", error);
            setError("Error al crear el usuario.");
            setSuccess("");
        } finally {
            setLoading(false); // Oculta el indicador de carga
        }
    };

    return (
        <>
            <Header />
            <Barnav />
						<main className="main-register">
            <div className="container-register">
                <h2>Registro de Usuario</h2>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            placeholder="Nombre"
							/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            placeholder="Apellido"
							/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>DNI</Form.Label>
                        <Form.Control
                            type="text"
                            name="dni"
                            value={formData.dni}
                            onChange={handleChange}
                            placeholder="Este sera su usuario"
							/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            name="contraseña"
                            value={formData.contraseña}
                            onChange={handleChange}
                            placeholder="Contraseña"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Repetir Contraseña</Form.Label>
                        <Form.Control
                            type="password"
                            name="repetirContraseña"
                            value={formData.repetirContraseña}
                            onChange={handleChange}
                            placeholder="Repetir Contraseña"
                        />
                        <Form.Text className="text-muted">
                            La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.
                        </Form.Text>
                    </Form.Group>
                    <Button
                        variant="primary"
                        type="submit"
                        disabled={loading}
                        className="mt-3" // Añade margen superior al botón
						>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Registrar'}
                    </Button>
                </Form>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                {success && <Alert variant="success" className="mt-3">{success}</Alert>}
            </div>

</main>
            <Footers />
        </>
    );
}

export default Register;
