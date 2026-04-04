import React, { useState } from "react";
import "./register.css";
import Footers from "../footer/Footer";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import SmartHeader from "../nav/SmartHeader";

const DB_URL = "https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json";

const initialForm = {
	nombre: "",
	apellido: "",
	email: "",
	emailRepetir: "",
	contrasenia: "",
};
function PasswordField({ id, name, label, value, onChange, show, onToggle, placeholder }) {
	return (
		<div className="reg-field">
			<label htmlFor={id}>{label}</label>
			<div className="reg-password-wrap">
				<input
					type={show ? "text" : "password"}
					id={id}
					name={name}
					value={value}
					onChange={onChange}
					placeholder={placeholder}
					required
					autoComplete="new-password"
				/>
				<button type="button" className="reg-eye" onClick={onToggle}
					aria-label={show ? "Ocultar" : "Mostrar"}>
					{show ? <FaEyeSlash /> : <FaEye />}
				</button>
			</div>
		</div>
	);
}

function Register() {
	const [formData, setFormData] = useState(initialForm);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (error) setError("");
	};

	const validar = async () => {
		if (!formData.nombre.trim() || !formData.apellido.trim()) return "Completá nombre y apellido.";
		if (formData.email !== formData.emailRepetir) return "Los emails no coinciden.";
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "El email no es válido.";
		if (!/^(?=.*[A-Z])(?=.*[0-9]).{6,}$/.test(formData.contrasenia))
			return "La contraseña debe tener al menos 6 caracteres, una mayúscula y un número.";

		const res = await axios.get(DB_URL);
		const usuarios = res.data || {};
		const emailDuplicado = Object.values(usuarios).some(
			(u) => u.dni === formData.email.trim().toLowerCase()
		);
		if (emailDuplicado) return "El email ya está registrado.";

		return null;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const errorMsg = await validar();
			if (errorMsg) { setError(errorMsg); setLoading(false); return; }

			await axios.post(DB_URL, {
				nombre: formData.nombre.trim(),
				apellido: formData.apellido.trim(),
				dni: formData.email.trim().toLowerCase(),  // email guardado en dni
				email: formData.email.trim().toLowerCase(),
				contrasenia: formData.contrasenia,
			});

			navigate("/login");
		} catch (err) {
			console.error(err);
			setError("Error de conexión. Intentá nuevamente.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<SmartHeader />
			<main className="reg-main">
				<div className="reg-card">

					<div className="reg-card-header">
						<h1 className="reg-title">Crear cuenta</h1>
						<p className="reg-sub">Registrate para gestionar tu mascota</p>
					</div>

					<form className="reg-form" onSubmit={handleSubmit} noValidate>

						<div className="reg-row">
							<div className="reg-field">
								<label htmlFor="nombre">Nombre</label>
								<input id="nombre" name="nombre" type="text"
									value={formData.nombre} onChange={handleChange}
									placeholder="Tu nombre" required />
							</div>
							<div className="reg-field">
								<label htmlFor="apellido">Apellido</label>
								<input id="apellido" name="apellido" type="text"
									value={formData.apellido} onChange={handleChange}
									placeholder="Tu apellido" required />
							</div>
						</div>

						<div className="reg-field">
							<label htmlFor="email">Email</label>
							<input id="email" name="email" type="email"
								value={formData.email} onChange={handleChange}
								placeholder="tucorreo@email.com" required autoComplete="email" />
						</div>

						<div className="reg-field">
							<label htmlFor="emailRepetir">Repetir email</label>
							<input id="emailRepetir" name="emailRepetir" type="email"
								value={formData.emailRepetir} onChange={handleChange}
								placeholder="Repetí tu email"
								required
								onPaste={(e) => e.preventDefault()}
								autoComplete="off" />
						</div>

						<PasswordField
							id="contrasenia" name="contrasenia"
							label="Contraseña"
							value={formData.contrasenia}
							onChange={handleChange}
							show={showPassword}
							onToggle={() => setShowPassword(!showPassword)}
							placeholder="Mín. 6 caracteres, 1 mayúscula, 1 número"
						/>

						<p className="reg-password-hint">
							Mínimo 6 caracteres, una mayúscula y un número.
						</p>

						{error && <div className="reg-error" role="alert">{error}</div>}

						<button type="submit" className="reg-btn" disabled={loading}>
							{loading ? "Registrando..." : "Crear cuenta"}
						</button>

					</form>

					<p className="reg-login">
						¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
					</p>

				</div>
			</main>
			<Footers />
		</>
	);
}

export default Register;