import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Footers from "../footer/Footer";
import SmartHeader from "../nav/SmartHeader";
import axios from "axios";

const API_LOGIN = "http://localhost/api-smartpet/index.php/login";

function Login() {
	const [email, setEmail] = useState("");
	const [contrasenia, setContrasenia] = useState("");
	const [error, setError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const res = await axios.post(API_LOGIN, { email, password: contrasenia });
			if (res.data.success) {
				localStorage.setItem("authenticated", "true");
				localStorage.setItem("userId", res.data.user.id);
				localStorage.setItem("userEmail", res.data.user.email);
				localStorage.setItem("rol", res.data.user.root ? "admin" : "usuario");
				navigate(res.data.user.root ? "/MasterCrud" : `/Consultas/${res.data.user.id}`);
			}
		} catch (err) {
			setError(err.response?.data?.error || "Usuario o contraseña incorrectos");
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
							<input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="username" />
						</div>
						<div className="login-field">
							<label htmlFor="contrasenia">Contraseña</label>
							<div className="login-password-wrap">
								<input type={showPassword ? "text" : "password"} id="contrasenia" value={contrasenia} onChange={e => setContrasenia(e.target.value)} required autoComplete="current-password" />
								<button type="button" className="login-eye" onClick={() => setShowPassword(!showPassword)}>
									{showPassword ? <IoMdEyeOff /> : <IoMdEye />}
								</button>
							</div>
						</div>
						{error && <div className="login-error">{error}</div>}
						<button type="submit" className="login-btn" disabled={loading}>{loading ? "Ingresando..." : "Entrar"}</button>
					</form>
					<p className="login-register">¿No tenés cuenta? <Link to="/Register">Registrate acá</Link></p>
				</div>
			</main>
			<Footers />
		</>
	);
}

export default Login;