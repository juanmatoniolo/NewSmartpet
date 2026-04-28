import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import TarjetaMascota from "./TarjetaMascota";
import CrearMascotaDesdeCodigo from "./CrearMascotaDesdeCodigo";
import "./ListaCodigos.css";

import API_BASE from "../../../config/api";

function ListaCodigos({ usuarioId }) {
    const [codigos, setCodigos] = useState([]);
    const [mascotasPorCodigo, setMascotasPorCodigo] = useState({});
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [refrescando, setRefrescando] = useState(false);

    // Cargar datos (misma lógica original)
    const cargarDatos = useCallback(async () => {
        if (!usuarioId) return;
        setCargando(true);
        setError("");
        try {
            const resCodes = await axios.get(`${API_BASE}/index.php/user-codes?usuario_id=${usuarioId}`);
            const codigosData = Array.isArray(resCodes.data) ? resCodes.data : [];
            setCodigos(codigosData);

            const mascotasMap = {};
            // Cargar mascotas en paralelo para mejor rendimiento
            await Promise.all(
                codigosData.map(async (code) => {
                    try {
                        const resMascota = await axios.get(
                            `${API_BASE}/index.php/mascotas?codigo_id=${code.codigo_id}&usuario_id=${usuarioId}`
                        );
                        if (resMascota.data && resMascota.data.id) {
                            mascotasMap[code.codigo_id] = resMascota.data;
                        }
                    } catch (err) {
                        // No hay mascota asociada, se ignora
                        console.log(`Sin mascota para código ${code.codigo_unico}`);
                    }
                })
            );
            setMascotasPorCodigo(mascotasMap);
        } catch (err) {
            console.error("Error al cargar códigos", err);
            setError("No se pudieron cargar los códigos. Intenta nuevamente.");
        } finally {
            setCargando(false);
        }
    }, [usuarioId]);

    // Refrescar manualmente
    const handleRefresh = useCallback(async () => {
        setRefrescando(true);
        await cargarDatos();
        setRefrescando(false);
    }, [cargarDatos]);

    // Efecto inicial y cuando usuarioId cambia
    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Callbacks para eventos hijos
    const handleMascotaCreada = useCallback(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleMascotaActualizada = useCallback(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Evitar renders innecesarios con useMemo
    const contenido = useMemo(() => {
        if (cargando) {
            return (
                <div className="skeleton-grid">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="skeleton-card">
                            <div className="skeleton-img"></div>
                            <div className="skeleton-body">
                                <div className="skeleton-title"></div>
                                <div className="skeleton-text"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={handleRefresh} className="btn-retry">
                        Reintentar
                    </button>
                </div>
            );
        }

        if (codigos.length === 0) {
            return (
                <div className="empty-message">
                    <p>No tienes códigos vinculados aún.</p>
                </div>
            );
        }

        return (
            <div className="codigos-grid">
                {codigos.map((code) => {
                    const mascota = mascotasPorCodigo[code.codigo_id];
                    return mascota ? (
                        <TarjetaMascota
                            key={`mascota-${code.codigo_id}`}
                            mascota={mascota}
                            codigoUnico={code.codigo_unico}
                            onActualizar={handleMascotaActualizada}
                        />
                    ) : (
                        <CrearMascotaDesdeCodigo
                            key={`codigo-${code.codigo_id}`}
                            usuarioId={usuarioId}
                            codigoId={code.codigo_id}
                            codigoUnico={code.codigo_unico}
                            onCreada={handleMascotaCreada}
                        />
                    );
                })}
            </div>
        );
    }, [cargando, error, codigos, mascotasPorCodigo, usuarioId, handleMascotaCreada, handleMascotaActualizada, handleRefresh]);

    return (
        <div className="lista-codigos-container">
            <div className="lista-header">
                <h3>Mis códigos y mascotas</h3>
                <button onClick={handleRefresh} className="btn-refresh" disabled={refrescando}>
                    {refrescando ? "Actualizando..." : "↻ Actualizar"}
                </button>
            </div>
            {contenido}
        </div>
    );
}

export default ListaCodigos;