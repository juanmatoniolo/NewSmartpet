import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import axios from "axios";
import EditarMascota from "./EditarMascota";
import "./TarjetaMascota.css";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost/api-smartpet/index.php";

// Función para convertir coordenadas (lat, lon) en dirección legible (sin cambios)
const obtenerDireccionDesdeCoordenadas = async (coordenadas) => {
    const partes = coordenadas.split(",");
    if (partes.length !== 2) return coordenadas;
    const lat = parseFloat(partes[0].trim());
    const lon = parseFloat(partes[1].trim());
    if (isNaN(lat) || isNaN(lon)) return coordenadas;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "es" } }
        );
        const data = await response.json();
        if (data && data.display_name) {
            const calle = data.address?.road || data.address?.pedestrian || "";
            const numero = data.address?.house_number || "";
            const ciudad = data.address?.city || data.address?.town || data.address?.village || "";
            if (calle && numero) return `${calle} ${numero}, ${ciudad}`;
            if (calle) return `${calle}, ${ciudad}`;
            return data.display_name.split(",")[0];
        }
        return coordenadas;
    } catch (error) {
        console.error("Error al obtener dirección:", error);
        return coordenadas;
    }
};

const TarjetaMascota = memo(({ mascota, codigoUnico, onActualizar }) => {
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalScaners, setShowModalScaners] = useState(false);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargandoUbic, setCargandoUbic] = useState(false);
    const [copiado, setCopiado] = useState(false);

    // Calcular edad con useMemo para evitar recalcular en cada render
    const edad = useMemo(() => {
        if (!mascota.fecha_nacimiento) return "Desconocida";
        const hoy = new Date();
        const nac = new Date(mascota.fecha_nacimiento);
        let edadCalc = hoy.getFullYear() - nac.getFullYear();
        const mesDiff = hoy.getMonth() - nac.getMonth();
        if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nac.getDate())) edadCalc--;
        return `${edadCalc} año${edadCalc !== 1 ? 's' : ''}`;
    }, [mascota.fecha_nacimiento]);

    // Imagen con fallback
    const imagen = useMemo(() => {
        return mascota.urlImg || "https://via.placeholder.com/300?text=Sin+imagen";
    }, [mascota.urlImg]);

    // Cargar scaners (misma consulta original)
    const cargarScaners = useCallback(async () => {
        setCargandoUbic(true);
        try {
            const res = await axios.get(`${API_BASE}/ubicaciones-todas?mascota_id=${mascota.id}`);
            const ubicacionesRaw = Array.isArray(res.data) ? res.data : [];

            // Convertir coordenadas a direcciones (sin cambios)
            const ubicacionesConDireccion = await Promise.all(
                ubicacionesRaw.map(async (ubic) => {
                    const direccionLegible = await obtenerDireccionDesdeCoordenadas(ubic.ubicacion);
                    return { ...ubic, direccionLegible };
                })
            );
            setUbicaciones(ubicacionesConDireccion);
        } catch (err) {
            console.error("Error al cargar scaners", err);
            setUbicaciones([]);
        } finally {
            setCargandoUbic(false);
        }
    }, [mascota.id]);

    // Manejadores de modales
    const handleVerScaners = useCallback(() => {
        cargarScaners();
        setShowModalScaners(true);
    }, [cargarScaners]);

    const handleCerrarScaners = useCallback(() => {
        setShowModalScaners(false);
        // Limpiar ubicaciones al cerrar para liberar memoria (opcional)
        setUbicaciones([]);
    }, []);

    const handleAbrirEditar = useCallback(() => setShowModalEditar(true), []);
    const handleCerrarEditar = useCallback(() => setShowModalEditar(false), []);

    const copiarCodigo = useCallback(() => {
        navigator.clipboard.writeText(codigoUnico);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    }, [codigoUnico]);

    // Efecto para limpiar timeout si el componente se desmonta
    useEffect(() => {
        let timeoutId;
        if (copiado) {
            timeoutId = setTimeout(() => setCopiado(false), 2000);
        }
        return () => clearTimeout(timeoutId);
    }, [copiado]);

    return (
        <>
            <Card className="tarjeta-mascota-card">
                <div className="codigo-badge-wrapper">
                    <Badge
                        bg="dark"
                        className="codigo-badge"
                        onClick={copiarCodigo}
                        style={{ cursor: 'pointer' }}
                    >
                        {copiado ? '✓ Copiado' : `🔑 ${codigoUnico}`}
                    </Badge>
                </div>
                <Card.Img variant="top" src={imagen} style={{ height: "200px", objectFit: "cover" }} />
                <Card.Body>
                    <Card.Title>{mascota.nombre || "Sin nombre"}</Card.Title>
                    <Card.Text>
                        <strong>Edad:</strong> {edad}
                    </Card.Text>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button variant="primary" size="sm" onClick={handleAbrirEditar}>
                            Editar
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleVerScaners}>
                            Ver Scaners
                        </Button>
                        <Button
                            as={Link}
                            to={`/ContactosMascota/${mascota.id}`}
                            variant="info"
                            size="sm"
                        >
                            Contactos
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <EditarMascota
                show={showModalEditar}
                handleClose={handleCerrarEditar}
                mascota={mascota}
                idMascota={mascota.id}
                onSave={onActualizar}
            />

            <Modal show={showModalScaners} onHide={handleCerrarScaners} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Scaners de {mascota.nombre}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {cargandoUbic ? (
                        <div className="text-center">Cargando...</div>
                    ) : ubicaciones.length === 0 ? (
                        <div className="text-center text-muted">Sin scaners registrados</div>
                    ) : (
                        <div className="list-group">
                            {ubicaciones.map((ubic, idx) => (
                                <div key={idx} className="list-group-item">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <strong>📍 {ubic.direccionLegible || ubic.ubicacion} (Dirección aproximada)</strong>
                                            <div className="text-muted small">
                                                🕒 {new Date(ubic.fecha_hora).toLocaleString('es-AR')}
                                            </div>
                                        </div>
                                        {ubic.ubicacion && (
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                href={`https://maps.google.com/?q=${encodeURIComponent(ubic.ubicacion)}`}
                                                target="_blank"
                                            >
                                                Ver mapa
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCerrarScaners}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default TarjetaMascota;