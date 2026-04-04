import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Footers from "../footer/Footer";
import SmartHeader from "../nav/SmartHeader";

function Login() {
	const [dni, setDni] = useState("");
	const [contrasenia, setContrasenia] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleInputChange = (e) => {
		if (e.target.id === "dni") setDni(e.target.value);
		else if (e.target.id === "contrasenia") setContrasenia(e.target.value);
		if (error) setError("");
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(
				"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json"
			);
			const data = await response.json();

			let usuarioEncontrado = null;
			let registroId = null;

			for (const key in data) {
				if (
					data.hasOwnProperty(key) &&
					data[key].dni === dni.trim() &&
					data[key].contrasenia === contrasenia.trim()
				) {
					usuarioEncontrado = data[key];
					registroId = key;
					break;
				}
			}

			if (usuarioEncontrado) {
				const rol = usuarioEncontrado.rol === "admin" ? "admin" : "usuario";
				localStorage.setItem("authenticated", "true");
				localStorage.setItem("userId", registroId);
				localStorage.setItem("rol", rol);
				if (rol === "admin") navigate("/MasterCrud");
				else navigate(`/Consultas/${registroId}`);
			} else {
				setError("Usuario o contraseña incorrectos. Intentá nuevamente.");
			}
		} catch (err) {
			setError("Error de conexión. Por favor, intentá nuevamente.");
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<SmartHeader />
			<main className="login-main">
				<div className="login-card">

					{/* Header de la card */}
					<div className="login-card-header">
						<h1 className="login-title">Bienvenido a SmartPet</h1>
						<p className="login-sub">Ingresá para gestionar tu mascota</p>
					</div>

					<form className="login-form" onSubmit={handleSubmit} noValidate>

						<div className="login-field">
							<label htmlFor="dni">Usuario</label>
							<input
								type="text"
								id="dni"
								name="usuario"
								placeholder="Tu usuario"
								required
								value={dni}
								onChange={handleInputChange}
								autoComplete="username"
								className={error ? "input-error" : ""}
							/>
						</div>

						<div className="login-field">
							<label htmlFor="contrasenia">Contraseña</label>
							<div className="login-password-wrap">
								<input
									type={showPassword ? "text" : "password"}
									id="contrasenia"
									name="contrasenia"
									placeholder="Tu contraseña"
									required
									value={contrasenia}
									onChange={handleInputChange}
									autoComplete="current-password"
									className={error ? "input-error" : ""}
								/>
								<button
									type="button"
									className="login-eye"
									onClick={() => setShowPassword(!showPassword)}
									aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
								>
									{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
								</button>
							</div>
						</div>

						{error && (
							<div className="login-error" role="alert">
								{error}
							</div>
						)}

						<button
							type="submit"
							className="login-btn"
							disabled={loading}
						>
							{loading ? "Ingresando..." : "Entrar"}
						</button>

					</form>

					<p className="login-register">
						¿No tenés cuenta?{" "}
						<Link to="/Register">Registrate acá</Link>
					</p>

				</div>
			</main>
			<Footers />
		</>
	);
}

export default Login;