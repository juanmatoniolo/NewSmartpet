import React, { useEffect, useState } from "react";
import axios from "axios";
import TarjetaMascota from "./TarjetaMascota";
import CrearMascotaDesdeCodigo from "./CrearMascotaDesdeCodigo";
import "./ListaCodigos.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function ListaCodigos({ usuarioId }) {
    const [codigos, setCodigos] = useState([]);
    const [mascotasPorCodigo, setMascotasPorCodigo] = useState({});
    const [cargando, setCargando] = useState(true);
    const [refresh, setRefresh] = useState(false);

    const cargarDatos = async () => {
        try {
            const resCodes = await axios.get(`${API_BASE}/user-codes?usuario_id=${usuarioId}`);
            setCodigos(resCodes.data);

            const mascotasMap = {};
            for (const code of resCodes.data) {
                try {
                    const resMascota = await axios.get(`${API_BASE}/mascotas?codigo_id=${code.codigo_id}&usuario_id=${usuarioId}`);
                    if (resMascota.data && resMascota.data.id) {
                        mascotasMap[code.codigo_id] = resMascota.data;
                    }
                } catch (err) {
                    console.log(`No hay mascota para código ${code.codigo_unico}`);
                }
            }
            setMascotasPorCodigo(mascotasMap);
        } catch (err) {
            console.error(err);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        cargarDatos();
    }, [usuarioId, refresh]);

    const handleMascotaCreada = () => setRefresh(prev => !prev);
    const handleMascotaActualizada = () => setRefresh(prev => !prev);

    if (cargando) return <div className="lista-cargando">Cargando códigos...</div>;

    return (
        <div className="lista-codigos-container">
            <h3>Mis códigos y mascotas</h3>
            <div className="codigos-grid">
                {codigos.map((code) => {
                    const mascota = mascotasPorCodigo[code.codigo_id];
                    return mascota ? (
                        <TarjetaMascota
                            key={code.codigo_id}
                            mascota={mascota}
                            onActualizar={handleMascotaActualizada}
                        />
                    ) : (
                        <CrearMascotaDesdeCodigo
                            key={code.codigo_id}
                            usuarioId={usuarioId}
                            codigoId={code.codigo_id}
                            codigoUnico={code.codigo_unico}
                            onCreada={handleMascotaCreada}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default ListaCodigos;