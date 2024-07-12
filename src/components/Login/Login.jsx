import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Header from "../header/Header";
import Footers from "../footer/Footer";

function Login() {
	const [dni, setDni] = useState("");
	const [contrasenia, setContrasenia] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

	const handleInputChange = (e) => {
		if (e.target.id === "dni") {
			setDni(e.target.value);
		} else if (e.target.id === "contrasenia") {
			setContrasenia(e.target.value);
		}
	};

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(
				"https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario.json"
			);
			const data = await response.json();

			let registroEncontrado = false;
			let registroId;

			for (const key in data) {
				if (
					data.hasOwnProperty(key) &&
					data[key].dni === dni.trim() &&
					data[key].contrasenia === contrasenia.trim()
				) {
					registroEncontrado = true;
					registroId = key;
					break;
				}
			}

			if (dni === "JuanmaToniolo" && contrasenia === "Sarmiento.846") {
				localStorage.setItem("authenticated", "true");
				navigate("/MasterCrud");
			} else if (registroEncontrado) {
				localStorage.setItem("authenticated", "true");
				navigate(`/Consultas/${registroId}`);
			} else {
				setError("Usuario o contraseña incorrectos. Inténtelo nuevamente");
			}
		} catch (error) {
			alert("Ha ocurrido un error. Por favor, intenta nuevamente.");
			console.error(error);
		}
	};

	return (
		<>
			<Header />
			<main className="main-login">
				<section className="login-section">
					<h2 className="login-title">Iniciar Sesión</h2>
					<form className="login-form" onSubmit={handleSubmit}>
						<div className="input-group">
							<label htmlFor="dni">Usuario:</label>
							<input
								type="text"
								id="dni"
								name="usuario"
								placeholder="Username"
								required
								value={dni}
								onChange={handleInputChange}
								className="input-user btnLoginConjunto"
								autoComplete="username"
							/>
						</div>
						<div className="input-group">
							<label htmlFor="contrasenia">Contraseña:</label>
							<div className="password-input-container">
								<input
									type={showPassword ? "text" : "password"}
									id="contrasenia"
									name="contrasenia"
									className="password-input"
									value={contrasenia}
									onChange={handleInputChange}
									autoComplete="current-password"
								/>
								<div
									className="password-toggle-btn"
									onClick={togglePasswordVisibility}
								>
									{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
								</div>
							</div>
						</div>
						{error && <p className="error-message">{error}</p>}
						<button type="submit" className="login-btn">
							Entrar
						</button>
					</form>
					<p className="message">
						Already registered? <Link to="/Registro">Sign In</Link>
					</p>
				</section>
			</main>
			<Footers />
		</>
	);
}

export default Login;
