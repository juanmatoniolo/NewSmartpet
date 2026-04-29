import React, {
    useState,
    useEffect,
    useCallback,
    useMemo,
    useRef,
    memo
} from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";
import EditarMascota from "./EditarMascota";
import "./TarjetaMascota.css";
import API_BASE from "../../../config/api";

const API_URL = `${API_BASE}/index.php`;
const PLACEHOLDER_IMG = "https://via.placeholder.com/300?text=Sin+imagen";
const MAX_SCANERS = 10;
const DIRECCION_TIMEOUT_MS = 3500;
const DIRECCION_DELAY_MS = 250;

const direccionCache = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizarUbicaciones = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.ubicaciones)) return data.ubicaciones;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const normalizarCoordenadas = (ubic) => {
    const coordenadas =
        ubic?.ubicacion ||
        ubic?.coordenadas ||
        (ubic?.lat && ubic?.lon ? `${ubic.lat},${ubic.lon}` : "");

    return String(coordenadas || "").trim();
};

const crearScannerKey = (ubic, index) =>
    ubic?.id || `${ubic?.fecha_hora || ubic?.created_at || "scanner"}-${index}`;

const esCoordenada = (valor = "") => {
    return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(String(valor).trim());
};

const getGoogleMapsUrl = (coordenadas) => {
    if (!coordenadas) return "#";

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        coordenadas
    )}`;
};

const getTextoUbicacion = (ubic) => {
    if (ubic.cargandoDireccion) {
        return "Buscando dirección aproximada...";
    }

    if (ubic.direccionLegible && !esCoordenada(ubic.direccionLegible)) {
        return ubic.direccionLegible;
    }

    return "Ubicación registrada en Google Maps";
};

const fetchConTimeout = async (url, options = {}, timeoutMs = DIRECCION_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        window.clearTimeout(timeoutId);
    }
};

const obtenerDireccionDesdeCoordenadas = async (coordenadas) => {
    if (!coordenadas || typeof coordenadas !== "string") {
        return "Ubicación no disponible";
    }

    if (direccionCache.has(coordenadas)) {
        return direccionCache.get(coordenadas);
    }

    const partes = coordenadas.split(",");

    if (partes.length !== 2) {
        direccionCache.set(coordenadas, coordenadas);
        return coordenadas;
    }

    const lat = parseFloat(partes[0].trim());
    const lon = parseFloat(partes[1].trim());

    if (Number.isNaN(lat) || Number.isNaN(lon)) {
        direccionCache.set(coordenadas, coordenadas);
        return coordenadas;
    }

    try {
        const response = await fetchConTimeout(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
            {
                headers: {
                    "Accept-Language": "es"
                }
            }
        );

        if (!response.ok) {
            direccionCache.set(coordenadas, coordenadas);
            return coordenadas;
        }

        const data = await response.json();

        let direccion = coordenadas;

        if (data?.display_name) {
            const calle = data.address?.road || data.address?.pedestrian || "";
            const numero = data.address?.house_number || "";
            const ciudad =
                data.address?.city ||
                data.address?.town ||
                data.address?.village ||
                data.address?.state ||
                "";

            if (calle && numero) {
                direccion = `${calle} ${numero}${ciudad ? `, ${ciudad}` : ""}`;
            } else if (calle) {
                direccion = `${calle}${ciudad ? `, ${ciudad}` : ""}`;
            } else {
                direccion = data.display_name.split(",").slice(0, 3).join(",").trim();
            }
        }

        direccionCache.set(coordenadas, direccion);
        return direccion;
    } catch {
        direccionCache.set(coordenadas, coordenadas);
        return coordenadas;
    }
};

const TarjetaMascota = memo(({ mascota, codigoUnico, onActualizar }) => {
    const [showModalEditar, setShowModalEditar] = useState(false);
    const [showModalScaners, setShowModalScaners] = useState(false);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargandoUbic, setCargandoUbic] = useState(false);
    const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
    const [errorUbicaciones, setErrorUbicaciones] = useState("");
    const [copiado, setCopiado] = useState(false);
    const [imageVersion, setImageVersion] = useState(Date.now());

    const requestIdRef = useRef(0);

    const buildImageUrl = useCallback((url) => {
        if (!url) return PLACEHOLDER_IMG;

        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }

        const cleanPath = url.replace(/^\/+/, "");
        return `${API_BASE}/${cleanPath}`;
    }, []);

    const edad = useMemo(() => {
        if (!mascota?.fecha_nacimiento) return "Desconocida";

        const hoy = new Date();
        const nacimiento = new Date(mascota.fecha_nacimiento);

        if (Number.isNaN(nacimiento.getTime())) return "Desconocida";

        let edadCalc = hoy.getFullYear() - nacimiento.getFullYear();
        const mesDiff = hoy.getMonth() - nacimiento.getMonth();

        if (
            mesDiff < 0 ||
            (mesDiff === 0 && hoy.getDate() < nacimiento.getDate())
        ) {
            edadCalc--;
        }

        if (edadCalc < 0) return "Desconocida";

        return `${edadCalc} año${edadCalc !== 1 ? "s" : ""}`;
    }, [mascota?.fecha_nacimiento]);

    const imagen = useMemo(() => {
        const baseUrl = buildImageUrl(mascota?.urlImg);
        const version = mascota?.updated_at || mascota?.urlImg || imageVersion;

        return `${baseUrl}?v=${encodeURIComponent(version)}`;
    }, [mascota?.urlImg, mascota?.updated_at, imageVersion, buildImageUrl]);

    const actualizarDireccionEnLista = useCallback((ubicacionKey, direccionLegible) => {
        setUbicaciones((prev) =>
            prev.map((item) =>
                item.__key === ubicacionKey
                    ? {
                        ...item,
                        direccionLegible,
                        cargandoDireccion: false
                    }
                    : item
            )
        );
    }, []);

    const cargarDireccionesProgresivas = useCallback(
        async (scaners, currentRequestId) => {
            setCargandoDirecciones(true);

            for (const ubic of scaners) {
                if (requestIdRef.current !== currentRequestId) return;

                if (!ubic.ubicacion) {
                    actualizarDireccionEnLista(ubic.__key, "Ubicación no disponible");
                    continue;
                }

                const direccionLegible = await obtenerDireccionDesdeCoordenadas(
                    ubic.ubicacion
                );

                if (requestIdRef.current !== currentRequestId) return;

                actualizarDireccionEnLista(ubic.__key, direccionLegible);

                await delay(DIRECCION_DELAY_MS);
            }

            if (requestIdRef.current === currentRequestId) {
                setCargandoDirecciones(false);
            }
        },
        [actualizarDireccionEnLista]
    );

    const cargarScaners = useCallback(async () => {
        if (!mascota?.id) {
            setErrorUbicaciones("No se encontró el ID de la mascota");
            setUbicaciones([]);
            return;
        }

        const currentRequestId = Date.now();
        requestIdRef.current = currentRequestId;

        setCargandoUbic(true);
        setCargandoDirecciones(false);
        setErrorUbicaciones("");
        setUbicaciones([]);

        try {
            let res;

            try {
                res = await axios.get(`${API_URL}/ubicaciones-todas`, {
                    params: {
                        mascota_id: mascota.id
                    },
                    timeout: 5000
                });
            } catch {
                res = await axios.get(`${API_URL}/ubicaciones`, {
                    params: {
                        mascota_id: mascota.id
                    },
                    timeout: 5000
                });
            }

            if (requestIdRef.current !== currentRequestId) return;

            const ubicacionesRaw = normalizarUbicaciones(res.data);

            const ultimosScaners = [...ubicacionesRaw]
                .sort((a, b) => {
                    const fechaA = new Date(a.fecha_hora || a.created_at || 0).getTime();
                    const fechaB = new Date(b.fecha_hora || b.created_at || 0).getTime();

                    return fechaB - fechaA;
                })
                .slice(0, MAX_SCANERS)
                .map((ubic, index) => {
                    const coordenadas = normalizarCoordenadas(ubic);
                    const key = crearScannerKey(ubic, index);

                    return {
                        ...ubic,
                        __key: key,
                        ubicacion: coordenadas,
                        direccionLegible: coordenadas || "Ubicación no disponible",
                        cargandoDireccion: Boolean(coordenadas)
                    };
                });

            setUbicaciones(ultimosScaners);
            setCargandoUbic(false);

            if (ultimosScaners.length > 0) {
                await cargarDireccionesProgresivas(ultimosScaners, currentRequestId);
            } else {
                setCargandoDirecciones(false);
            }
        } catch (err) {
            if (requestIdRef.current !== currentRequestId) return;

            console.error("Error al cargar scaners:", err);

            setErrorUbicaciones(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudieron cargar las ubicaciones"
            );

            setUbicaciones([]);
            setCargandoUbic(false);
            setCargandoDirecciones(false);
        }
    }, [mascota?.id, cargarDireccionesProgresivas]);

    const handleVerScaners = useCallback(() => {
        setShowModalScaners(true);
        cargarScaners();
    }, [cargarScaners]);

    const handleCerrarScaners = useCallback(() => {
        requestIdRef.current = Date.now();
        setShowModalScaners(false);
        setUbicaciones([]);
        setErrorUbicaciones("");
        setCargandoUbic(false);
        setCargandoDirecciones(false);
    }, []);

    const handleAbrirEditar = useCallback(() => {
        setShowModalEditar(true);
    }, []);

    const handleCerrarEditar = useCallback(() => {
        setShowModalEditar(false);
    }, []);

    const handleMascotaActualizada = useCallback(
        async (mascotaActualizada) => {
            setImageVersion(Date.now());

            if (onActualizar) {
                await onActualizar(mascotaActualizada);
            }
        },
        [onActualizar]
    );

    const copiarCodigo = useCallback(async () => {
        if (!codigoUnico) return;

        try {
            await navigator.clipboard.writeText(codigoUnico);
            setCopiado(true);
        } catch {
            setCopiado(false);
        }
    }, [codigoUnico]);

    useEffect(() => {
        let timeoutId;

        if (copiado) {
            timeoutId = setTimeout(() => setCopiado(false), 2000);
        }

        return () => clearTimeout(timeoutId);
    }, [copiado]);

    useEffect(() => {
        return () => {
            requestIdRef.current = Date.now();
        };
    }, []);

    const cantidadScaners = ubicaciones.length;

    return (
        <>
            <Card className="tarjeta-mascota-card">
                <div className="codigo-badge-wrapper">
                    <Badge
                        bg="dark"
                        className="codigo-badge"
                        onClick={copiarCodigo}
                        style={{ cursor: "pointer" }}
                    >
                        {copiado ? "✓ Copiado" : `🔑 ${codigoUnico || "Sin código"}`}
                    </Badge>
                </div>

                <Card.Img
                    variant="top"
                    src={imagen}
                    alt={`Foto de ${mascota?.nombre || "mascota"}`}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER_IMG;
                    }}
                />

                <Card.Body>
                    <Card.Title>{mascota?.nombre || "Sin nombre"}</Card.Title>

                    <Card.Text>
                        <strong>Edad:</strong> {edad}
                    </Card.Text>

                    <div className="botones-acciones">
                        <Button variant="primary" size="sm" onClick={handleAbrirEditar}>
                            Editar
                        </Button>

                        <Button variant="secondary" size="sm" onClick={handleVerScaners}>
                            Ver Scaners
                        </Button>
                    </div>
                </Card.Body>
            </Card>

            <EditarMascota
                show={showModalEditar}
                handleClose={handleCerrarEditar}
                mascota={mascota}
                idMascota={mascota?.id}
                onSave={handleMascotaActualizada}
            />

            <Modal show={showModalScaners} onHide={handleCerrarScaners} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Últimos {MAX_SCANERS} scaners de {mascota?.nombre || "mascota"}
                        {!cargandoUbic && cantidadScaners > 0 ? (
                            <span className="scaners-count"> {cantidadScaners}</span>
                        ) : null}
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {cargandoUbic ? (
                        <div className="scaners-loading">
                            <Spinner animation="border" size="sm" />
                            <span>Cargando scaners...</span>
                        </div>
                    ) : errorUbicaciones ? (
                        <div className="scaners-empty error">
                            <p>{errorUbicaciones}</p>
                            <Button variant="outline-primary" size="sm" onClick={cargarScaners}>
                                Reintentar
                            </Button>
                        </div>
                    ) : ubicaciones.length === 0 ? (
                        <div className="scaners-empty">
                            <p>Sin scaners registrados para esta mascota.</p>
                        </div>
                    ) : (
                        <>
                            {cargandoDirecciones && (
                                <div className="scaners-loading small">
                                    <Spinner animation="border" size="sm" />
                                    <span>Buscando direcciones aproximadas...</span>
                                </div>
                            )}

                            <div className="scaners-list">
                                {ubicaciones.map((ubic, idx) => {
                                    const fecha = ubic.fecha_hora || ubic.created_at || null;
                                    const fechaTexto = fecha
                                        ? new Date(fecha).toLocaleString("es-AR")
                                        : "Fecha no disponible";

                                    return (
                                        <article key={ubic.__key || ubic.id || idx} className="scanner-item">
                                            <div className="scanner-info">
                                                <strong>📍Calle: {getTextoUbicacion(ubic)}</strong>

                                                <span>🕒 {fechaTexto}</span>

                                                {ubic.ubicacion ? (
                                                    <small>Abrir ubicación exacta en Google Maps</small>
                                                ) : null}
                                            </div>

                                            {ubic.ubicacion ? (
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    href={getGoogleMapsUrl(ubic.ubicacion)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    Ver en Google Maps
                                                </Button>
                                            ) : null}
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="outline-primary"
                        onClick={cargarScaners}
                        disabled={cargandoUbic}
                    >
                        Actualizar
                    </Button>

                    <Button variant="secondary" onClick={handleCerrarScaners}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
});

export default TarjetaMascota;