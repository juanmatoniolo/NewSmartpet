import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { RefreshCw, Search, Code, Plus } from "lucide-react";
import TarjetaMascota from "./TarjetaMascota";
import TarjetaCodigoVacio from "./TarjetaCodigoVacio";
import { Link } from "react-router-dom"; // ✅ navegación

import "./PanelUsuario.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function PanelUsuario({ usuarioId }) {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [codigo, setCodigo] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [codigosVinculados, setCodigosVinculados] = useState([]);
    const [cargandoCodigos, setCargandoCodigos] = useState(true);
    const [showModalVincular, setShowModalVincular] = useState(false);
    const [filtro, setFiltro] = useState("");
    const [refrescando, setRefrescando] = useState(false);
    const [toast, setToast] = useState({ show: false, message: "", type: "" });

    // Mostrar notificación temporal (toast)
    const mostrarToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    }, []);

    // Cargar datos del usuario
    const cargarDatosUsuario = useCallback(async () => {
        if (!usuarioId) return;
        try {
            const res = await axios.get(`${API_BASE}/usuarios/${usuarioId}`);
            setNombreUsuario(res.data?.nombre || "Usuario");
        } catch (err) {
            console.error("Error al cargar usuario", err);
            setNombreUsuario("Usuario");
        }
    }, [usuarioId]);

    // Cargar códigos y mascotas (misma lógica original)
    const cargarCodigos = useCallback(async () => {
        if (!usuarioId) return;
        setCargandoCodigos(true);
        try {
            const resCodigos = await axios.get(`${API_BASE}/user-codes?usuario_id=${usuarioId}`);
            const listaCodigos = Array.isArray(resCodigos.data) ? resCodigos.data : [];

            const codigosConMascotas = await Promise.all(
                listaCodigos.map(async (code) => {
                    try {
                        const resMascota = await axios.get(
                            `${API_BASE}/mascotas?codigo_id=${code.codigo_id}&usuario_id=${usuarioId}`
                        );
                        const mascotaValida =
                            resMascota.data &&
                                !Array.isArray(resMascota.data) &&
                                typeof resMascota.data === "object" &&
                                resMascota.data.id
                                ? resMascota.data
                                : null;
                        return { ...code, mascota: mascotaValida };
                    } catch {
                        return { ...code, mascota: null };
                    }
                })
            );
            setCodigosVinculados(codigosConMascotas);
        } catch (err) {
            console.error("Error al cargar códigos", err);
            setCodigosVinculados([]);
            mostrarToast("Error al cargar los códigos", "danger");
        } finally {
            setCargandoCodigos(false);
        }
    }, [usuarioId, mostrarToast]);

    // Refrescar manualmente
    const handleRefresh = useCallback(async () => {
        setRefrescando(true);
        await cargarCodigos();
        setRefrescando(false);
        mostrarToast("Lista actualizada", "info");
    }, [cargarCodigos, mostrarToast]);

    // Efecto inicial
    useEffect(() => {
        if (!usuarioId) return;
        cargarDatosUsuario();
        cargarCodigos();
    }, [usuarioId, cargarDatosUsuario, cargarCodigos]);

    // Filtrar códigos por nombre de mascota o código único
    const codigosFiltrados = useMemo(() => {
        if (!filtro.trim()) return codigosVinculados;
        const term = filtro.toLowerCase();
        return codigosVinculados.filter(item => {
            if (item.mascota) {
                return item.mascota.nombre?.toLowerCase().includes(term) ||
                    item.codigo_unico.toLowerCase().includes(term);
            } else {
                return item.codigo_unico.toLowerCase().includes(term);
            }
        });
    }, [codigosVinculados, filtro]);

    // Validación y vinculación
    const handleVincular = useCallback(async () => {
        const codigoNormalizado = codigo.trim().toUpperCase();
        if (!/^[A-Z0-9]{8}$/.test(codigoNormalizado)) {
            setMensaje("Formato inválido: 4 letras + 4 números (ej: ABCD1234)");
            return;
        }
        setCargando(true);
        setMensaje("");
        try {
            await axios.post(`${API_BASE}/user-codes`, {
                usuario_id: usuarioId,
                codigo_unico: codigoNormalizado,
            });
            setMensaje("✅ Código vinculado");
            setCodigo("");
            mostrarToast("Código vinculado correctamente", "success");
            setTimeout(() => {
                setShowModalVincular(false);
                setMensaje("");
                cargarCodigos();
            }, 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error al vincular";
            setMensaje(`❌ ${errorMsg}`);
            mostrarToast(errorMsg, "danger");
        } finally {
            setCargando(false);
        }
    }, [codigo, usuarioId, cargarCodigos, mostrarToast]);

    // Skeletons de carga
    const SkeletonCard = () => (
        <div className="skeleton-card">
            <div className="skeleton-badge"></div>
            <div className="skeleton-img"></div>
            <div className="skeleton-body">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-buttons"></div>
            </div>
        </div>
    );

    return (
        <div className="panel-usuario-container" key={usuarioId}>
            {/* Toast flotante */}
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="bienvenida-section">
                <div>
                    <h2>¡Bienvenido, {nombreUsuario}!</h2>
                    <p className="bienvenida-subtext">Gestiona los códigos de tus mascotas</p>
                </div>
                <div className="bienvenida-buttons">
                    <Button
                        variant="primary"
                        onClick={() => {
                            setShowModalVincular(true);
                            setMensaje("");
                        }}
                        className="btn-vincular"
                    >
                        <Plus size={18} /> Vincular nuevo código
                    </Button>

                    <Link to={`/agenda/${usuarioId}`} className="btn btn-agenda">
                        📅 Ver agenda general
                    </Link>

                </div>
            </div>

            <div className="mascotas-section">
                <div className="section-header">
                    <h3>
                        <Code size={20} /> Mis códigos vinculados
                        <span className="contador-badge">{codigosFiltrados.length}</span>
                    </h3>
                    <div className="header-actions">
                        <div className="search-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Filtrar por mascota o código..."
                                value={filtro}
                                onChange={(e) => setFiltro(e.target.value)}
                                className="filtro-input"
                            />
                        </div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refrescando || cargandoCodigos}
                            className="btn-refresh"
                        >
                            <RefreshCw size={16} className={refrescando ? "spin" : ""} />
                            {refrescando ? "Actualizando..." : "Actualizar"}
                        </Button>
                    </div>
                </div>

                {cargandoCodigos ? (
                    <div className="mascotas-grid">
                        {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : codigosFiltrados.length === 0 ? (
                    <div className="sin-mascotas">
                        <Code size={48} strokeWidth={1} />
                        <p>{filtro ? "No se encontraron resultados con ese filtro." : "No tienes códigos vinculados aún."}</p>
                        {!filtro && (
                            <Button variant="light" onClick={() => setShowModalVincular(true)}>
                                Vincular mi primer código
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="mascotas-grid">
                        {codigosFiltrados.map((item) =>
                            item.mascota ? (
                                <TarjetaMascota
                                    key={`mascota-${item.codigo_id}`}
                                    mascota={item.mascota}
                                    codigoUnico={item.codigo_unico}
                                    onActualizar={cargarCodigos}
                                />
                            ) : (
                                <TarjetaCodigoVacio
                                    key={`codigo-${item.codigo_id}`}
                                    codigoId={item.codigo_id}
                                    codigoUnico={item.codigo_unico}
                                    usuarioId={usuarioId}
                                    onMascotaCreada={cargarCodigos}
                                />
                            )
                        )}
                    </div>
                )}
            </div>

            {/* Modal de vinculación mejorado */}
            <Modal show={showModalVincular} onHide={() => { setShowModalVincular(false); setMensaje(""); }} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Vincular nuevo código</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleVincular}>
                        <Form.Group>
                            <Form.Label>Código de 8 caracteres</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: ABCD1234"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                                disabled={cargando}
                                maxLength={8}
                                autoFocus
                                isInvalid={!!mensaje && !mensaje.includes("✅")}
                            />
                            <Form.Text className="text-muted">
                                Formato: 4 letras mayúsculas + 4 números (ej: ABCD1234)
                            </Form.Text>
                            {mensaje && (
                                <Alert variant={mensaje.includes("✅") ? "success" : "danger"} className="mt-2">
                                    {mensaje}
                                </Alert>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalVincular(false)} disabled={cargando}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleVincular} disabled={cargando}>
                        {cargando ? <Spinner as="span" size="sm" animation="border" /> : "Vincular"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PanelUsuario;