import React, { useState, useRef } from "react";
import axios from "axios";
import "./VincularCodigo.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function VincularCodigo({ usuarioId, onCodigoVinculado }) {
    const [codigo, setCodigo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const inputRef = useRef(null);

    const validarFormato = (valor) => /^[A-Z0-9]{8}$/.test(valor);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validarFormato(codigo)) {
            setMensaje("Formato inválido: 4 letras + 4 números (ej: ABCD1234)");
            return;
        }
        setCargando(true);
        try {
            await axios.post(`${API_BASE}/user-codes`, {
                usuario_id: usuarioId,
                codigo_unico: codigo.toUpperCase(),
            });
            setMensaje("✅ Código vinculado correctamente");
            setCodigo("");
            if (onCodigoVinculado) onCodigoVinculado();
            inputRef.current?.focus();
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error al vincular";
            setMensaje(`❌ ${errorMsg}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="vincular-codigo-container">
            <h3>Vincular nuevo código</h3>
            <form onSubmit={handleSubmit} className="vincular-form">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ej: ABCD1234"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                    disabled={cargando}
                    className="vincular-input"
                />
                <button type="submit" disabled={cargando} className="vincular-btn">
                    {cargando ? "Vinculando..." : "Vincular"}
                </button>
            </form>
            {mensaje && <div className="vincular-mensaje">{mensaje}</div>}
        </div>
    );
}

export default VincularCodigo;