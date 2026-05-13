import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

import API_BASE from "../../config/api";
import SmartHeader from "../nav/SmartHeader";
import Footers from "../footer/Footer";
import "./login.css";

const API_RESET = `${API_BASE}/index.php/reset-password`;

function Reset() {
    const navigate = useNavigate();
    const [token, setToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");
        if (!t) {
            setError("El enlace no es válido o ya fue usado.");
        } else {
            setToken(t);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
        if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
        if (!token) { setError("Token inválido."); return; }

        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                API_RESET,
                { token, new_password: password },
                { headers: { "Content-Type": "application/json" } }
            );

            if (res.data?.success) {
                setSuccess("¡Contraseña actualizada! Ahora podés iniciar sesión.");
                setTimeout(() => navigate("/Login", { replace: true }), 2500);
            } else {
                setError(res.data?.error || "No se pudo actualizar la contraseña.");
            }
        } catch (err) {
            const apiError = err.response?.data?.error;
            setError(apiError || "Error de conexión. Intentá nuevamente.");
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
                        <h1 className="login-title">Nueva contraseña</h1>
                        <p className="login-sub">Elegí una contraseña segura</p>
                    </div>

                    {success ? (
                        <div style={{
                            background: "#edf7f0", color: "#276749",
                            padding: "1rem", borderRadius: "14px",
                            fontWeight: 600, fontSize: "0.95rem",
                            borderLeft: "4px solid #38a169"
                        }}>
                            ✅ {success}
                        </div>
                    ) : (
                        <form className="login-form" onSubmit={handleSubmit} noValidate>
                            <div className="login-field">
                                <label htmlFor="password">Nueva contraseña</label>
                                <div className="login-password-wrap">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        required
                                        autoComplete="new-password"
                                        disabled={loading || !token}
                                    />
                                    <button type="button" className="login-eye"
                                        onClick={() => setShowPassword(p => !p)}
                                        aria-label={showPassword ? "Ocultar" : "Mostrar"}
                                        disabled={loading}>
                                        {showPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="login-field">
                                <label htmlFor="confirm">Repetir contraseña</label>
                                <div className="login-password-wrap">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        id="confirm"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        placeholder="Repetí la contraseña"
                                        required
                                        autoComplete="new-password"
                                        disabled={loading || !token}
                                    />
                                    <button type="button" className="login-eye"
                                        onClick={() => setShowConfirm(p => !p)}
                                        aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                                        disabled={loading}>
                                        {showConfirm ? <IoMdEyeOff /> : <IoMdEye />}
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
                                disabled={loading || !password || !confirm || !token}
                            >
                                {loading ? <><span className="spinner" /> Guardando...</> : "Guardar contraseña"}
                            </button>
                        </form>
                    )}

                    <p className="login-forgot" style={{ marginTop: "1.5rem" }}>
                        <Link to="/Login">← Volver al login</Link>
                    </p>
                </div>
            </main>
            <Footers />
        </>
    );
}

export default Reset;