import React, { useState } from "react";
import "./register.css";
import Header from "../header/Header";
import Barnav from "../nav/Nav";
import Footers from "../footer/Footer";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Importa los íconos de ojo

function Register() {
	const [formData, setFormData] = useState({
		nombre: "",
		apellido: "",
		dni: "",
		contrasenia: "",
		repetirContrasenia: "",
	});

	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
	const [showRepeatPassword, setShowRepeatPassword] = useState(false); // Estado para controlar la visibilidad de la repetición de contraseña
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const validarDNI = async () => {
		try {
			const response = await axios.get(
				`https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json`
			);
			const usuarios = response.data;
			return !Object.values(usuarios).some(
				(user) => user.dni === formData.dni
			);
		} catch (error) {
			console.error("Error al validar DNI:", error);
			setError("Error al verificar DNI.");
			return false;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.contrasenia !== formData.repetirContrasenia) {
			setError("Las contraseñas no coinciden.");
			return;
		}

		if (
			!/^.{6,}$/.test(formData.contrasenia) ||
			!/[A-Z]/.test(formData.contrasenia) ||
			!/[0-9]/.test(formData.contrasenia)
		) {
			setError(
				"La contraseña debe tener al menos 6 caracteres, una mayúscula y un número."
			);
			return;
		}

		setLoading(true);

		const dniDisponible = await validarDNI();
		if (!dniDisponible) {
			setError("El DNI ya está en uso.");
			setLoading(false);
			return;
		}

		try {
			await axios.post(
				"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json",
				{
					nombre: formData.nombre,
					apellido: formData.apellido,
					dni: formData.dni,
					contrasenia: formData.contrasenia,
				}
			);
			setSuccess("Usuario creado con éxito.");
			setError("");
			setFormData({
				nombre: "",
				apellido: "",
				dni: "",
				contrasenia: "",
				repetirContrasenia: "",
			});
			navigate("/login");
		} catch (error) {
			console.error("Error al crear el usuario:", error);
			setError("Error al crear el usuario.");
			setSuccess("");
		} finally {
			setLoading(false);
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
								placeholder="Este será su usuario"
							/>
						</Form.Group>
						<Form.Group className="mb-3 position-relative">
							<Form.Label>Contraseña</Form.Label>
							<div className="password-input-container">
								<Form.Control
									type={showPassword ? "text" : "password"}
									name="contrasenia"
									value={formData.contrasenia}
									onChange={handleChange}
									placeholder="Contraseña"
									className="password-input col-10"
								/>
								<Button
									variant="link"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="password-visibility-toggle"
								>
									{showPassword ? <FaEyeSlash /> : <FaEye />}
								</Button>
							</div>
						</Form.Group>
						<Form.Group className="mb-3 position-relative">
							<Form.Label>Repetir Contraseña</Form.Label>
							<div className="password-input-container">
								<Form.Control
									type={
										showRepeatPassword ? "text" : "password"
									}
									name="repetirContrasenia"
									value={formData.repetirContrasenia}
									onChange={handleChange}
									placeholder="Repetir Contraseña"
									className="password-input col-10"
								/>
								<Button
									variant="link"
									onClick={() =>
										setShowRepeatPassword(
											!showRepeatPassword
										)
									}
									className="password-visibility-toggle"
								>
									{showRepeatPassword ? (
										<FaEyeSlash />
									) : (
										<FaEye />
									)}
								</Button>
							</div>
							<Form.Text className="text-muted">
								La contraseña debe tener al menos 6 caracteres,
								una mayúscula y un número.
							</Form.Text>
						</Form.Group>

						<Button
							variant="primary"
							type="submit"
							disabled={loading}
							className="mt-3"
						>
							{loading ? (
								<Spinner animation="border" size="sm" />
							) : (
								"Registrar"
							)}
						</Button>
					</Form>
					{error && (
						<Alert variant="danger" className="mt-3">
							{error}
						</Alert>
					)}
					{success && (
						<Alert variant="success" className="mt-3">
							{success}
						</Alert>
					)}
				</div>
			</main>
			<Footers />
		</>
	);
}

export default Register;
