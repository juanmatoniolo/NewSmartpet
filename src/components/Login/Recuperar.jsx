import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import API_BASE from "../../config/api";
import SmartHeader from "../nav/SmartHeader";
import Footers from "../footer/Footer";
import "./login.css";

const API_REQUEST_RESET = `${API_BASE}/index.php/request-reset`;

function Recuperar() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanEmail = email.trim().toLowerCase();
        if (!cleanEmail) { setError("Ingresá tu email."); return; }

        setError("");
        setLoading(true);

        try {
            const res = await axios.post(
                API_REQUEST_RESET,
                { email: cleanEmail },
                { headers: { "Content-Type": "application/json" } }
            );
            if (res.data?.success) {
                setSuccess("Si el email está registrado, recibirás un enlace en tu casilla.");
                setEmail("");
            } else {
                setError(res.data?.error || "No se pudo procesar la solicitud.");
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
                        <h1 className="login-title">Recuperar contraseña</h1>
                        <p className="login-sub">Te enviamos un enlace a tu email</p>
                    </div>

                    {success ? (
                        <>
                            <div style={{
                                background: "#edf7f0", color: "#276749",
                                padding: "1rem", borderRadius: "14px",
                                fontWeight: 600, fontSize: "0.95rem",
                                borderLeft: "4px solid #38a169", marginBottom: "1.5rem"
                            }}>
                                ✅ {success}
                            </div>
                            <p className="login-register">
                                <Link to="/Login">Volver al inicio de sesión</Link>
                            </p>
                        </>
                    ) : (
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
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>

                            {error && (
                                <div className="login-error" role="alert">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="login-btn"
                                disabled={loading || !email.trim()}
                            >
                                {loading ? <><span className="spinner" /> Enviando...</> : "Enviar enlace"}
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

export default Recuperar;