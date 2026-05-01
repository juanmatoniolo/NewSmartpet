import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button, Spinner } from "react-bootstrap";
import {
    RefreshCw,
    Search,
    Dog,
    Edit3,
    CalendarDays,
    ArrowLeft,
    MapPin,
} from "lucide-react";

import AdminHeader from "./AdminHeader";
import { API_URL, getImageUrl, withCacheBust } from "../../config/api";

import "./MisMascotas.css";

const PLACEHOLDER_IMG = "/a.jpg";

const MAX_SCANERS = 10;
const DIRECCION_TIMEOUT_MS = 3500;
const DIRECCION_DELAY_MS = 250;

const direccionCache = new Map();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizarArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.mascotas)) return data.mascotas;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.ubicaciones)) return data.ubicaciones;
    return [];
};

const getUsuarioLocal = () => {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
        return {};
    }
};

const getUsuarioId = () => {
    const userId = localStorage.getItem("userId");

    if (userId) return userId;

    const user = getUsuarioLocal();
    return user?.id ? String(user.id) : "";
};

const getIsRoot = () => {
    const userRoot = localStorage.getItem("userRoot");

    if (userRoot === "1") return true;

    const user = getUsuarioLocal();
    return Number(user?.root) === 1;
};

const getAdminHeaders = () => ({
    "X-User-Id": getUsuarioId(),
});

const getSexoTexto = (sexo) => {
    if (sexo === 0 || sexo === "0") return "Macho";
    if (sexo === 1 || sexo === "1") return "Hembra";
    return "No definido";
};

const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "Edad desconocida";

    const nacimiento = new Date(fechaNac);

    if (Number.isNaN(nacimiento.getTime())) return "Edad desconocida";

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }

    if (edad < 0) return "Edad desconocida";
    if (edad === 0) return "Menos de 1 año";

    return `${edad} año${edad !== 1 ? "s" : ""}`;
};

const normalizarMascotaDesdeCodigo = (item) => {
    if (item?.mascota?.id) {
        return {
            ...item.mascota,
            codigo_unico: item.codigo_unico || item.mascota.codigo_unico,
            codigo_id: item.codigo_id || item.mascota.codigo_id,
        };
    }

    if (item?.mascota_id || item?.id_mascota) {
        return {
            id: item.mascota_id || item.id_mascota,
            id_mascota: item.mascota_id || item.id_mascota,
            codigo_id: item.codigo_id,
            codigo_unico: item.codigo_unico,
            nombre: item.mascota_nombre || item.nombre || "",
            fecha_nacimiento: item.fecha_nacimiento || "",
            sexo: item.sexo ?? "",
            urlImg: item.urlImg || "",
            direccion: item.direccion || "",
            descripcion: item.descripcion || "",
            persona1: item.persona1 || "",
            persona1tel: item.persona1tel || "",
            persona1ig: item.persona1ig || "",
            persona2: item.persona2 || "",
            persona2tel: item.persona2tel || "",
            persona2ig: item.persona2ig || "",
            mensajeRescate: item.mensajeRescate || "",
            updated_at: item.updated_at || item.fecha_actualizacion || "",
        };
    }

    return null;
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

const fetchConTimeout = async (
    url,
    options = {},
    timeoutMs = DIRECCION_TIMEOUT_MS
) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
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
                    "Accept-Language": "es",
                },
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

function MisMascotas() {
    const navigate = useNavigate();

    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [imageVersion, setImageVersion] = useState(Date.now());

    const [showModalScaners, setShowModalScaners] = useState(false);
    const [mascotaScaners, setMascotaScaners] = useState(null);
    const [ubicaciones, setUbicaciones] = useState([]);
    const [cargandoUbic, setCargandoUbic] = useState(false);
    const [cargandoDirecciones, setCargandoDirecciones] = useState(false);
    const [errorUbicaciones, setErrorUbicaciones] = useState("");

    const requestIdRef = useRef(0);

    const usuarioId = getUsuarioId();
    const isRoot = getIsRoot();

    const cargarMascotasDesdeCodigos = useCallback(async () => {
        const res = await axios.get(`${API_URL}/user-codes`, {
            params: {
                usuario_id: usuarioId,
            },
            timeout: 10000,
        });

        const codigos = normalizarArray(res.data);

        return codigos
            .map(normalizarMascotaDesdeCodigo)
            .filter((mascota) => mascota && mascota.id);
    }, [usuarioId]);

    const cargarMascotasDirectas = useCallback(async () => {
        const res = await axios.get(`${API_URL}/mascotas`, {
            params: {
                usuario_id: usuarioId,
            },
            timeout: 10000,
        });

        return normalizarArray(res.data);
    }, [usuarioId]);

    const cargarMascotasRoot = useCallback(async () => {
        const res = await axios.post(
            API_URL,
            {
                action: "getmascotas",
            },
            {
                headers: getAdminHeaders(),
                timeout: 10000,
            }
        );

        return normalizarArray(res.data);
    }, []);

    const cargarMascotas = useCallback(async () => {
        if (!usuarioId) {
            setError("No se encontró el usuario logueado.");
            setMascotas([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        setError("");

        try {
            let lista = [];

            if (isRoot) {
                lista = await cargarMascotasRoot();
            } else {
                lista = await cargarMascotasDesdeCodigos();

                if (lista.length === 0) {
                    lista = await cargarMascotasDirectas();
                }
            }

            const sinDuplicados = Array.from(
                new Map(lista.map((m) => [String(m.id), m])).values()
            );

            setMascotas(sinDuplicados);
            setImageVersion(Date.now());
        } catch (err) {
            console.error("Error al cargar mascotas:", err);

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudieron cargar tus mascotas."
            );

            setMascotas([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [
        usuarioId,
        isRoot,
        cargarMascotasRoot,
        cargarMascotasDesdeCodigos,
        cargarMascotasDirectas,
    ]);

    useEffect(() => {
        cargarMascotas();
    }, [cargarMascotas]);

    useEffect(() => {
        return () => {
            requestIdRef.current = Date.now();
        };
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await cargarMascotas();
    };

    const mascotasFiltradas = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return mascotas;

        return mascotas.filter((m) => {
            const texto = [
                m.nombre,
                m.descripcion,
                m.direccion,
                m.codigo_unico,
                m.fecha_nacimiento,
                getSexoTexto(m.sexo),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return texto.includes(term);
        });
    }, [mascotas, search]);

    const actualizarDireccionEnLista = useCallback((ubicacionKey, direccionLegible) => {
        setUbicaciones((prev) =>
            prev.map((item) =>
                item.__key === ubicacionKey
                    ? {
                        ...item,
                        direccionLegible,
                        cargandoDireccion: false,
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

    const cargarScaners = useCallback(
        async (mascota) => {
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
                            mascota_id: mascota.id,
                        },
                        timeout: 5000,
                    });
                } catch {
                    res = await axios.get(`${API_URL}/ubicaciones`, {
                        params: {
                            mascota_id: mascota.id,
                        },
                        timeout: 5000,
                    });
                }

                if (requestIdRef.current !== currentRequestId) return;

                const ubicacionesRaw = normalizarArray(res.data);

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
                            cargandoDireccion: Boolean(coordenadas),
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
        },
        [cargarDireccionesProgresivas]
    );

    const handleVerUbicaciones = useCallback(
        (mascota) => {
            setMascotaScaners(mascota);
            setShowModalScaners(true);
            cargarScaners(mascota);
        },
        [cargarScaners]
    );

    const handleCerrarScaners = useCallback(() => {
        requestIdRef.current = Date.now();
        setShowModalScaners(false);
        setMascotaScaners(null);
        setUbicaciones([]);
        setErrorUbicaciones("");
        setCargandoUbic(false);
        setCargandoDirecciones(false);
    }, []);

    const renderImagen = (mascota) => {
        const baseUrl = getImageUrl(mascota?.urlImg, PLACEHOLDER_IMG);
        const version = mascota?.updated_at || mascota?.urlImg || imageVersion;
        const imgSrc = withCacheBust(baseUrl, version);

        return (
            <img
                src={imgSrc}
                alt={`Foto de ${mascota?.nombre || "mascota"}`}
                className="mis-mascotas-card-img"
                loading="lazy"
                onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = PLACEHOLDER_IMG;
                }}
            />
        );
    };

    const cantidadScaners = ubicaciones.length;

    return (
        <>
            <AdminHeader />

            <main className="mis-mascotas-page">
                <section className="mis-mascotas-header">
                    <div>
                        <button
                            type="button"
                            className="mis-mascotas-back"
                            onClick={() => navigate(-1)}
                        >
                            <ArrowLeft size={18} />
                            Volver
                        </button>

                        <h1>
                            <Dog size={28} />
                            Mis mascotas
                        </h1>

                        <p>
                            {isRoot
                                ? "Vista administrador: todas las mascotas registradas."
                                : "Mascotas vinculadas a tus códigos SmartPet."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="mis-mascotas-refresh"
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                    >
                        <RefreshCw
                            size={18}
                            className={refreshing ? "mis-mascotas-spin" : ""}
                        />
                        {refreshing ? "Actualizando..." : "Actualizar"}
                    </button>
                </section>

                <section className="mis-mascotas-toolbar">
                    <div className="mis-mascotas-search">
                        <Search size={18} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, código o descripción..."
                        />
                    </div>

                    <span className="mis-mascotas-count">
                        {mascotasFiltradas.length} mascota
                        {mascotasFiltradas.length !== 1 ? "s" : ""}
                    </span>
                </section>

                {error && (
                    <div className="mis-mascotas-alert error">
                        <span>{error}</span>

                        <button type="button" onClick={handleRefresh}>
                            Reintentar
                        </button>
                    </div>
                )}

                {loading ? (
                    <section className="mis-mascotas-grid">
                        {[1, 2, 3].map((item) => (
                            <article className="mis-mascotas-skeleton" key={item}>
                                <div className="mis-mascotas-skeleton-img" />
                                <div className="mis-mascotas-skeleton-line big" />
                                <div className="mis-mascotas-skeleton-line" />
                                <div className="mis-mascotas-skeleton-line short" />
                            </article>
                        ))}
                    </section>
                ) : mascotasFiltradas.length === 0 ? (
                    <section className="mis-mascotas-empty">
                        <Dog size={52} />

                        <h2>No hay mascotas para mostrar</h2>

                        <p>
                            {search
                                ? "No encontramos resultados con ese filtro."
                                : "No hay mascotas vinculadas a este usuario todavía."}
                        </p>
                    </section>
                ) : (
                    <section className="mis-mascotas-grid">
                        {mascotasFiltradas.map((mascota) => (
                            <article className="mis-mascotas-card" key={mascota.id}>
                                <div className="mis-mascotas-img-wrap">
                                    {renderImagen(mascota)}

                                    <span className="mis-mascotas-sex">
                                        {getSexoTexto(mascota.sexo)}
                                    </span>
                                </div>

                                <div className="mis-mascotas-card-body">
                                    <div className="mis-mascotas-title-row">
                                        <h2>{mascota.nombre || "Mascota sin nombre"}</h2>

                                        {mascota.codigo_unico && (
                                            <span className="mis-mascotas-code">
                                                {mascota.codigo_unico}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mis-mascotas-meta">
                                        <CalendarDays size={16} />
                                        {calcularEdad(mascota.fecha_nacimiento)}
                                    </p>

                                    <p className="mis-mascotas-description">
                                        {mascota.descripcion || "Sin descripción cargada."}
                                    </p>

                                    {mascota.direccion && (
                                        <p className="mis-mascotas-address">
                                            📍 {mascota.direccion}
                                        </p>
                                    )}

                                    <div className="mis-mascotas-actions">
                                        <button
                                            type="button"
                                            className="mis-mascotas-btn primary"
                                            onClick={() => handleVerUbicaciones(mascota)}
                                        >
                                            <MapPin size={16} />
                                            Ver ubicaciones
                                        </button>

                                        <Link
                                            to={`/admin/mis-mascotas/${mascota.id}`}
                                            className="mis-mascotas-btn ghost"
                                        >
                                            <Edit3 size={16} />
                                            Editar
                                        </Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            <Modal show={showModalScaners} onHide={handleCerrarScaners} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Últimos {MAX_SCANERS} scaners de {mascotaScaners?.nombre || "mascota"}
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

                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => cargarScaners(mascotaScaners)}
                            >
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
                                        <article
                                            key={ubic.__key || ubic.id || idx}
                                            className="scanner-item"
                                        >
                                            <div className="scanner-info">
                                                <strong>📍 Calle: {getTextoUbicacion(ubic)}</strong>

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
                        onClick={() => cargarScaners(mascotaScaners)}
                        disabled={cargandoUbic || !mascotaScaners}
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
}

export default MisMascotas;