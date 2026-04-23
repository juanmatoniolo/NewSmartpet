import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import { Search, User, RefreshCw } from "lucide-react";
import "./MisMascotas.css";

const API_URL = "http://localhost/api-smartpet/index.php";

const MisMascotas = () => {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(Date.now());

    // Estados para búsqueda de usuarios
    const [searchTerm, setSearchTerm] = useState("");
    const [usuariosEncontrados, setUsuariosEncontrados] = useState([]);
    const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserNombre, setSelectedUserNombre] = useState("");
    const [mostrarDropdown, setMostrarDropdown] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const adminId = user?.id;

    // Referencia para evitar llamadas simultáneas
    const fetchingRef = useRef(false);

    // Función para cargar mascotas de un usuario específico
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

    // Cargar las mascotas del admin al inicio (solo una vez)
    useEffect(() => {
        if (adminId && !selectedUserId) {
            setSelectedUserId(adminId);
            setSelectedUserNombre(`${user?.nombre} ${user?.apellido || ""} (tuyo)`);
            cargarMascotas(adminId);
        }
    }, [adminId, cargarMascotas, selectedUserId, user]);

    // Buscar usuarios por nombre o email
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
                u.nombre.toLowerCase().includes(query.toLowerCase()) ||
                (u.apellido && u.apellido.toLowerCase().includes(query.toLowerCase())) ||
                u.email.toLowerCase().includes(query.toLowerCase())
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

    // Componente TarjetaMascota
    const TarjetaMascota = ({ mascota, refreshKey }) => {
        let imagenSrc = mascota.urlImg && mascota.urlImg.trim() !== "" ? mascota.urlImg : "/a.jpg";
        const imageUrl = imagenSrc + (imagenSrc.includes('?') ? `&_=${refreshKey}` : `?_=${refreshKey}`);
        return (
            <div className="tarjeta-mascota">
                <div className="tarjeta-badge">
                    {mascota.sexo == 0 ? "♂ Macho" : "♀ Hembra"}
                </div>
                <div className="tarjeta-imagen">
                    <img
                        src={imageUrl}
                        alt={mascota.nombre}
                        onError={(e) => { e.target.src = "/a.jpg"; }}
                    />
                </div>
                <div className="tarjeta-body">
                    <h4>{mascota.nombre}</h4>
                    <p className="fecha-nac">🎂 {mascota.fecha_nacimiento || "Fecha no registrada"}</p>
                    <Link to={`/admin/mis-mascotas/${mascota.id}`} className="btn-detalle">
                        Ver detalle
                    </Link>
                </div>
            </div>
        );
    };

    return (
        <>
            <AdminHeader />
            <div className="mis-mascotas-container">
                <div className="header-busqueda">
                    <h2><User size={24} /> Mis mascotas</h2>
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
                                    <div key={u.id} className="resultado-item" onClick={() => seleccionarUsuario(u)}>
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
                            <TarjetaMascota key={m.id} mascota={m} refreshKey={refreshKey} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MisMascotas;