import React, { useState, useRef } from "react";
import axios from "axios";
import "./VincularCodigo.css";
import API_BASE from "../../config/api";

function VincularCodigo({ usuarioId, onCodigoVinculado }) {
    const [codigo, setCodigo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [mensajeTipo, setMensajeTipo] = useState("");
    const [cargando, setCargando] = useState(false);
    const inputRef = useRef(null);

    const API_URL = `${API_BASE}/index.php`;

    const validarFormato = (valor) => /^[A-Z]{4}[0-9]{4}$/.test(valor);

    const limpiarCodigo = (valor) =>
        valor
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, "")
            .slice(0, 8);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const codigoFinal = limpiarCodigo(codigo);

        if (!validarFormato(codigoFinal)) {
            setMensaje("Formato inválido. Usá 4 letras + 4 números. Ej: ABCD1234");
            setMensajeTipo("error");
            inputRef.current?.focus();
            return;
        }

        if (!usuarioId) {
            setMensaje("No se encontró el usuario autenticado");
            setMensajeTipo("error");
            return;
        }

        setCargando(true);
        setMensaje("");
        setMensajeTipo("");

        try {
            const res = await axios.post(`${API_URL}/user-codes`, {
                usuario_id: usuarioId,
                codigo_unico: codigoFinal
            });

            setMensaje("Código vinculado correctamente");
            setMensajeTipo("success");
            setCodigo("");

            if (onCodigoVinculado) {
                await onCodigoVinculado(res.data);
            }

            inputRef.current?.focus();
        } catch (err) {
            const errorMsg =
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudo vincular el código";

            setMensaje(errorMsg);
            setMensajeTipo("error");
        } finally {
            setCargando(false);
        }
    };

    const handleChange = (e) => {
        setCodigo(limpiarCodigo(e.target.value));

        if (mensaje) {
            setMensaje("");
            setMensajeTipo("");
        }
    };

    return (
        <section className="vincular-codigo-container" aria-labelledby="vincular-title">
            <div className="vincular-header">
                <div>
                    <p className="vincular-kicker">Nuevo vínculo</p>
                    <h3 id="vincular-title">Vincular código</h3>
                    <p>Ingresá el código de 8 caracteres para agregar la mascota a tu panel.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="vincular-form">
                <div className="vincular-input-group">
                    <label htmlFor="codigo-unico">Código único</label>
                    <input
                        id="codigo-unico"
                        ref={inputRef}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        placeholder="Ej: ABCD1234"
                        value={codigo}
                        onChange={handleChange}
                        disabled={cargando}
                        className="vincular-input"
                        maxLength={8}
                        aria-describedby="codigo-help"
                    />
                    <small id="codigo-help">Formato: 4 letras + 4 números.</small>
                </div>

                <button type="submit" disabled={cargando} className="vincular-btn">
                    {cargando ? "Vinculando..." : "Vincular código"}
                </button>
            </form>

            {mensaje && (
                <div className={`vincular-mensaje ${mensajeTipo}`} role="alert">
                    <span>{mensajeTipo === "success" ? "✅" : "⚠️"}</span>
                    <p>{mensaje}</p>
                </div>
            )}
        </section>
    );
}

export default VincularCodigo;