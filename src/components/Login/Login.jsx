// Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

import API_BASE from "../../config/api";
import SmartHeader from "../nav/SmartHeader";
import Footers from "../footer/Footer";

import "./login.css";

const API_LOGIN = `${API_BASE}/index.php/login`;

function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		const cleanEmail = email.trim().toLowerCase();

		if (!cleanEmail || !password) {
			setError("Ingresá email y contraseña.");
			return;
		}

		setError("");
		setLoading(true);

		try {
			const res = await axios.post(
				API_LOGIN,
				{
					email: cleanEmail,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			const user = res.data?.user;

			if (!res.data?.success || !user?.id) {
				setError(res.data?.error || "Respuesta inesperada del servidor.");
				return;
			}

			const nombreCompleto = `${user.nombre || ""} ${user.apellido || ""}`.trim();

			localStorage.setItem("user", JSON.stringify(user));
			localStorage.setItem("userId", String(user.id));
			localStorage.setItem("userEmail", user.email || cleanEmail);
			localStorage.setItem("userName", nombreCompleto || "Usuario");
			localStorage.setItem("userRoot", Number(user.root) === 1 ? "1" : "0");
			localStorage.setItem("userPhoto", user.foto_perfil || "");

			if (Number(user.root) === 1) {
				navigate("/admin", { replace: true });
				return;
			}

			navigate(`/Consultas/${user.id}`, { replace: true });
		} catch (err) {
			console.error("Login error:", err);

			const status = err.response?.status;
			const apiError = err.response?.data?.error;
			const debugMessage = err.response?.data?.debug?.message;

			if (status === 401) {
				setError("Email o contraseña incorrectos.");
			} else if (apiError) {
				setError(debugMessage ? `${apiError}: ${debugMessage}` : apiError);
			} else {
				setError("Error de conexión. Verificá tu internet o intentá nuevamente.");
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
									onClick={() => setShowPassword((prev) => !prev)}
									aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
									disabled={loading}
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
							disabled={loading || !email.trim() || !password}
						>
							{loading ? (
								<>
									<span className="spinner" /> Ingresando...
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