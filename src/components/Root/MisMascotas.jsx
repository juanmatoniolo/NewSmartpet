import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import { Search, User, RefreshCw, MapPin, X } from "lucide-react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";
import Modal from "react-bootstrap/Modal";
import "./MisMascotas.css";

const API_URL = "http://localhost/api-smartpet/index.php";

const MisMascotas = () => {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const [searchTerm, setSearchTerm] = useState("");
    const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
    const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserNombre, setSelectedUserNombre] = useState("");
    const [mostrarDropdown, setMostrarDropdown] = useState(false);

    const [showMapModal, setShowMapModal] = useState(false);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapCoordinates, setMapCoordinates] = useState({ lat: null, lng: null });
    const [mapMascotaNombre, setMapMascotaNombre] = useState("");

    const user = JSON.parse(localStorage.getItem("user"));
    const adminId = user?.id;

    const fetchingRef = useRef(false);

    const cargarMascotas = useCallback(async (userId, mostrarLoading = true) => {
        if (!userId || fetchingRef.current) return;

        if (mostrarLoading) setLoading(true);

        fetchingRef.current = true;
        setError(null);

        try {
            const res = await axios.get(`${API_URL}/mascotas?usuario_id=${userId}`);
            setMascotas(Array.isArray(res.data) ? res.data : []);
            setRefreshKey(Date.now());
        } catch (err) {
            console.error(err);
            setError("Error al cargar las mascotas: " + (err.response?.data?.error || err.message));
            setMascotas([]);
        } finally {
            fetchingRef.current = false;
            if (mostrarLoading) setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (adminId && !selectedUserId) {
            setSelectedUserId(adminId);
            setSelectedUserNombre(`${user?.nombre} ${user?.apellido || ""} (tuyo)`);
            cargarMascotas(adminId);
        }
    }, [adminId, cargarMascotas, selectedUserId, user]);

    const buscarUsuarios = async (query) => {
        if (!query.trim()) {
            setUsuariosEncontrados([]);
            setMostrarDropdown(false);
            return;
        }

        setBuscandoUsuarios(true);

        try {
            const res = await axios.post(API_URL, { action: "getusuarios" });
            const todos = Array.isArray(res.data) ? res.data : [];

            const filtrados = todos.filter(u =>
                u.nombre?.toLowerCase().includes(query.toLowerCase()) ||
                (u.apellido && u.apellido.toLowerCase().includes(query.toLowerCase())) ||
                u.email?.toLowerCase().includes(query.toLowerCase())
            );

            setUsuariosEncontrados(filtrados.slice(0, 10));
            setMostrarDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setBuscandoUsuarios(false);
        }
    };

    const seleccionarUsuario = (usuario) => {
        if (selectedUserId === usuario.id) return;

        setSelectedUserId(usuario.id);
        setSelectedUserNombre(`${usuario.nombre} ${usuario.apellido || ""} (ID: ${usuario.id})`);
        setSearchTerm("");
        setUsuariosEncontrados([]);
        setMostrarDropdown(false);
        cargarMascotas(usuario.id);
    };

    const verMisMascotas = () => {
        if (!adminId || selectedUserId === adminId) return;

        setSelectedUserId(adminId);
        setSelectedUserNombre(`${user?.nombre} ${user?.apellido || ""} (tuyo)`);
        setSearchTerm("");
        setUsuariosEncontrados([]);
        setMostrarDropdown(false);
        cargarMascotas(adminId);
    };

    const handleRefresh = () => {
        if (selectedUserId) cargarMascotas(selectedUserId, true);
    };

    const abrirUbicacionMascota = async (mascota) => {
        setMapLoading(true);
        setError(null);

        try {
            const res = await axios.get(`${API_URL}/ubicaciones?mascota_id=${mascota.id}`);
            const data = res.data;

            if (!data || !data.ubicacion) {
                setError(`No hay ubicación registrada para ${mascota.nombre}.`);
                return;
            }

            const parts = data.ubicacion.split(",");

            if (parts.length !== 2) {
                setError("La ubicación registrada tiene un formato incorrecto.");
                return;
            }

            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);

            if (Number.isNaN(lat) || Number.isNaN(lng)) {
                setError("Las coordenadas de ubicación no son válidas.");
                return;
            }

            setMapCoordinates({ lat, lng });
            setMapMascotaNombre(mascota.nombre);
            setShowMapModal(true);
        } catch (err) {
            console.error(err);
            setError("Error al cargar la ubicación: " + (err.response?.data?.error || err.message));
        } finally {
            setMapLoading(false);
        }
    };

    const TarjetaMascotaAdmin = ({ mascota, refreshKey }) => {
        const edad = useMemo(() => {
            if (!mascota.fecha_nacimiento) return "Desconocida";

            const hoy = new Date();
            const nac = new Date(mascota.fecha_nacimiento);

            let edadCalc = hoy.getFullYear() - nac.getFullYear();
            const mesDiff = hoy.getMonth() - nac.getMonth();

            if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nac.getDate())) {
                edadCalc--;
            }

            return `${edadCalc} año${edadCalc !== 1 ? "s" : ""}`;
        }, [mascota.fecha_nacimiento]);

        const imagenSrc = mascota.urlImg && mascota.urlImg.trim() !== "" ? mascota.urlImg : "/a.jpg";
        const imageUrl = imagenSrc + (imagenSrc.includes("?") ? `&_=${refreshKey}` : `?_=${refreshKey}`);

        return (
            <Card className="tarjeta-mascota-card">
                <div className="codigo-badge-wrapper">
                    <Badge bg="dark" className="codigo-badge">
                        {mascota.sexo == 0 ? "♂ Macho" : "♀ Hembra"}
                    </Badge>
                </div>

                <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={mascota.nombre || "Mascota"}
                    className="mis-mascotas-card-img"
                    onError={(e) => {
                        e.currentTarget.src = "/a.jpg";
                    }}
                />

                <Card.Body>
                    <Card.Title>{mascota.nombre || "Sin nombre"}</Card.Title>

                    <Card.Text>
                        <strong>Edad:</strong> {edad}
                        <br />
                        <strong>Nacimiento:</strong> {mascota.fecha_nacimiento || "Fecha no registrada"}
                    </Card.Text>

                    <div className="d-flex gap-2 flex-wrap botones-acciones">
                        <Button
                            as={Link}
                            to={`/admin/mis-mascotas/${mascota.id}`}
                            variant="primary"
                            size="sm"
                        >
                            Ver detalle
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => abrirUbicacionMascota(mascota)}
                            disabled={mapLoading}
                        >
                            <MapPin size={15} className="me-1" />
                            Ver ubicación
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    return (
        <>
            <AdminHeader />

            <div className="mis-mascotas-container">
                <div className="header-busqueda">
                    <h2>
                        <User size={24} /> Mis mascotas
                    </h2>

                    <div className="busqueda-usuario">
                        <div className="search-wrapper">
                            <Search size={18} className="search-icon" />

                            <input
                                type="text"
                                placeholder="Buscar usuario por nombre, apellido o email..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    buscarUsuarios(e.target.value);
                                }}
                                onFocus={() => searchTerm.trim() && setMostrarDropdown(true)}
                            />

                            {buscandoUsuarios && <RefreshCw size={16} className="spin" />}
                        </div>

                        {mostrarDropdown && usuariosEncontrados.length > 0 && (
                            <div className="dropdown-resultados">
                                {usuariosEncontrados.map(u => (
                                    <div
                                        key={u.id}
                                        className="resultado-item"
                                        onClick={() => seleccionarUsuario(u)}
                                    >
                                        <strong>{u.nombre} {u.apellido}</strong> - {u.email}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className="btn-mis-mascotas" onClick={verMisMascotas}>
                            Ver mis mascotas
                        </button>

                        <button className="btn-refresh" onClick={handleRefresh} title="Refrescar">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                <div className="usuario-actual">
                    Mostrando mascotas de: <strong>{selectedUserNombre || "Cargando..."}</strong>

                    {selectedUserId && selectedUserId !== adminId && (
                        <button className="btn-cambiar" onClick={verMisMascotas}>
                            Volver a las mías
                        </button>
                    )}
                </div>

                {error && <div className="alert-error">{error}</div>}

                {loading ? (
                    <div className="cargando-texto">Cargando mascotas...</div>
                ) : mascotas.length === 0 ? (
                    <div className="sin-mascotas">
                        <p>🐾 No hay mascotas registradas para este usuario.</p>
                    </div>
                ) : (
                    <div className="mascotas-grid">
                        {mascotas.map(m => (
                            <TarjetaMascotaAdmin
                                key={m.id}
                                mascota={m}
                                refreshKey={refreshKey}
                            />
                        ))}
                    </div>
                )}
            </div>

            <Modal
                show={showMapModal}
                onHide={() => setShowMapModal(false)}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Ubicación de {mapMascotaNombre}</Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: 0 }}>
                    {mapCoordinates.lat && mapCoordinates.lng && (
                        <iframe
                            title={`Ubicación de ${mapMascotaNombre}`}
                            width="100%"
                            height="420"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoordinates.lng - 0.01},${mapCoordinates.lat - 0.01},${mapCoordinates.lng + 0.01},${mapCoordinates.lat + 0.01}&layer=mapnik&marker=${mapCoordinates.lat},${mapCoordinates.lng}`}
                            allowFullScreen
                        />
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMapModal(false)}>
                        <X size={15} className="me-1" />
                        Cerrar
                    </Button>

                    <Button
                        as="a"
                        variant="primary"
                        href={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MapPin size={15} className="me-1" />
                        Abrir en Google Maps
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default MisMascotas;