// Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";


import axios from "axios";
import SmartHeader from "../nav/SmartHeader";
import Footers from "../footer/Footer";

const API_LOGIN = "http://localhost/api-smartpet/index.php/login";

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await axios.post(API_LOGIN, {
				email: email.trim(),
				password: password,
			});

			if (res.data.success && res.data.user) {
				const user = res.data.user;

				// Guardar datos completos en localStorage
				localStorage.setItem("user", JSON.stringify(user));
				localStorage.setItem("userId", user.id);
				localStorage.setItem("userEmail", user.email);
				localStorage.setItem("userName", `${user.nombre} ${user.apellido || ""}`.trim());
				localStorage.setItem("userRoot", user.root ? "1" : "0");
				localStorage.setItem("userPhoto", user.foto_perfil || "");

				if (user.root && user.root == 1) {
					navigate("/admin");
				} else {
					navigate(`/Consultas/${user.id}`);   // ← cambia aquí
				}
			} else {
				setError("Respuesta inesperada del servidor");
			}
		} catch (err) {
			console.error("Login error:", err);
			if (err.response && err.response.data && err.response.data.error) {
				setError(err.response.data.error);
			} else if (err.response && err.response.status === 401) {
				setError("Email o contraseña incorrectos");
			} else {
				setError("Error de conexión. Intente nuevamente.");
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<SmartHeader />
			<main className="login-main">
				<div className="login-card">
					<div className="login-card-header">
						<h1 className="login-title">Bienvenido a SmartPet</h1>
						<p className="login-sub">Ingresá para gestionar tu mascota</p>
					</div>

					<form className="login-form" onSubmit={handleSubmit} noValidate>
						<div className="login-field">
							<label htmlFor="email">Email</label>
							<input
								type="email"
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="tumail@ejemplo.com"
								required
								autoComplete="username"
								disabled={loading}
							/>
						</div>

						<div className="login-field">
							<label htmlFor="password">Contraseña</label>
							<div className="login-password-wrap">
								<input
									type={showPassword ? "text" : "password"}
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="••••••••"
									required
									autoComplete="current-password"
									disabled={loading}
								/>
								<button
									type="button"
									className="login-eye"
									onClick={() => setShowPassword(!showPassword)}
									tabIndex="-1"
									aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
								>
									{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
								</button>
							</div>
						</div>

						{error && (
							<div className="login-error" role="alert">
								<span>⚠️</span> {error}
							</div>
						)}

						<button
							type="submit"
							className="login-btn"
							disabled={loading || !email || !password}
						>
							{loading ? (
								<>
									<span className="spinner"></span> Ingresando...
								</>
							) : (
								"Entrar"
							)}
						</button>
					</form>

					<p className="login-register">
						¿No tenés cuenta? <Link to="/Register">Registrate acá</Link>
					</p>

					<p className="login-forgot">
						<Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
					</p>
				</div>
			</main>
			<Footers />
		</>
	);
}

export default Login;