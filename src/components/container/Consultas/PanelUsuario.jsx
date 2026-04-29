import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { RefreshCw, Search, Code, Plus } from "lucide-react";
import TarjetaMascota from "./TarjetaMascota";
import TarjetaCodigoVacio from "./TarjetaCodigoVacio";
import { Link } from "react-router-dom";

import API_BASE from "../../../config/api";
import "./PanelUsuario.css";

const normalizarArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

function PanelUsuario({ usuarioId }) {
    const API_URL = `${API_BASE}/index.php`;

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

    const mostrarToast = useCallback((message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
    }, []);

    const cargarDatosUsuario = useCallback(async () => {
        if (!usuarioId) return;

        try {
            const res = await axios.get(`${API_URL}/usuarios/${usuarioId}`);
            setNombreUsuario(res.data?.nombre || "Usuario");
        } catch (err) {
            console.error("Error al cargar usuario:", err);
            setNombreUsuario("Usuario");
        }
    }, [usuarioId, API_URL]);

    const cargarMascotaPorCodigo = useCallback(
        async (codigoItem) => {
            try {
                const resMascota = await axios.get(`${API_URL}/mascotas`, {
                    params: {
                        codigo_id: codigoItem.codigo_id,
                        usuario_id: usuarioId
                    }
                });

                const data = resMascota.data;

                if (Array.isArray(data)) {
                    return data[0] || null;
                }

                if (Array.isArray(data?.data)) {
                    return data.data[0] || null;
                }

                if (data && typeof data === "object" && data.id) {
                    return data;
                }

                return null;
            } catch (err) {
                console.error("Error al cargar mascota por código:", err);
                return null;
            }
        },
        [API_URL, usuarioId]
    );

    const cargarCodigos = useCallback(async () => {
        if (!usuarioId) return;

        setCargandoCodigos(true);

        try {
            const resCodigos = await axios.get(`${API_URL}/user-codes`, {
                params: {
                    usuario_id: usuarioId
                }
            });

            const listaCodigos = normalizarArray(resCodigos.data);

            const codigosConMascotas = await Promise.all(
                listaCodigos.map(async (code) => {
                    const mascota = await cargarMascotaPorCodigo(code);

                    return {
                        ...code,
                        mascota
                    };
                })
            );

            setCodigosVinculados(codigosConMascotas);
        } catch (err) {
            console.error("Error al cargar códigos:", err);
            setCodigosVinculados([]);
            mostrarToast("Error al cargar los códigos", "danger");
        } finally {
            setCargandoCodigos(false);
        }
    }, [usuarioId, mostrarToast, API_URL, cargarMascotaPorCodigo]);

    const handleRefresh = useCallback(async () => {
        setRefrescando(true);
        await cargarCodigos();
        setRefrescando(false);
        mostrarToast("Lista actualizada", "info");
    }, [cargarCodigos, mostrarToast]);

    useEffect(() => {
        if (!usuarioId) return;

        cargarDatosUsuario();
        cargarCodigos();
    }, [usuarioId, cargarDatosUsuario, cargarCodigos]);

    const codigosFiltrados = useMemo(() => {
        if (!filtro.trim()) return codigosVinculados;

        const term = filtro.toLowerCase();

        return codigosVinculados.filter((item) => {
            const texto = [
                item.codigo_unico,
                item.mascota?.nombre,
                item.mascota?.descripcion
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return texto.includes(term);
        });
    }, [codigosVinculados, filtro]);

    const handleVincular = useCallback(async () => {
        const codigoNormalizado = codigo.trim().toUpperCase();

        if (!/^[A-Z0-9]{8}$/.test(codigoNormalizado)) {
            setMensaje("Formato inválido: 8 caracteres. Ej: ABCD1234");
            return;
        }

        setCargando(true);
        setMensaje("");

        try {
            await axios.post(`${API_URL}/user-codes`, {
                usuario_id: usuarioId,
                codigo_unico: codigoNormalizado
            });

            setMensaje("✅ Código vinculado");
            setCodigo("");
            mostrarToast("Código vinculado correctamente", "success");

            await cargarCodigos();

            setTimeout(() => {
                setShowModalVincular(false);
                setMensaje("");
            }, 700);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "Error al vincular";
            setMensaje(`❌ ${errorMsg}`);
            mostrarToast(errorMsg, "danger");
        } finally {
            setCargando(false);
        }
    }, [codigo, usuarioId, cargarCodigos, mostrarToast, API_URL]);

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
            {toast.show && (
                <div className={`toast-notification ${toast.type}`}>
                    {toast.message}
                </div>
            )}

            <div className="bienvenida-section">
                <div>
                    <h2>¡Bienvenido, {nombreUsuario}!</h2>
                    <p className="bienvenida-subtext">
                        Gestioná los códigos de tus mascotas
                    </p>
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
                            className="btn-refreshh"
                        >
                            <RefreshCw size={16} className={refrescando ? "spin" : ""} />
                            {refrescando ? "Actualizando..." : "Actualizar"}
                        </Button>
                    </div>
                </div>

                {cargandoCodigos ? (
                    <div className="mascotas-grid">
                        {[...Array(3)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : codigosFiltrados.length === 0 ? (
                    <div className="sin-mascotas">
                        <Code size={48} strokeWidth={1} />
                        <p>
                            {filtro
                                ? "No se encontraron resultados con ese filtro."
                                : "No tenés códigos vinculados aún."}
                        </p>

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
                                    key={`mascota-${item.codigo_id}-${item.mascota.id}`}
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

            <Modal
                show={showModalVincular}
                onHide={() => {
                    setShowModalVincular(false);
                    setMensaje("");
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Vincular nuevo código</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Código de 8 caracteres</Form.Label>

                            <Form.Control
                                type="text"
                                placeholder="Ej: ABCD1234"
                                value={codigo}
                                onChange={(e) =>
                                    setCodigo(
                                        e.target.value
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, "")
                                            .slice(0, 8)
                                    )
                                }
                                disabled={cargando}
                                maxLength={8}
                                autoFocus
                                isInvalid={!!mensaje && !mensaje.includes("✅")}
                            />

                            <Form.Text className="text-muted">
                                Formato recomendado: 4 letras + 4 números. Ej: ABCD1234
                            </Form.Text>

                            {mensaje && (
                                <Alert
                                    variant={mensaje.includes("✅") ? "success" : "danger"}
                                    className="mt-2"
                                >
                                    {mensaje}
                                </Alert>
                            )}
                        </Form.Group>
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowModalVincular(false)}
                        disabled={cargando}
                    >
                        Cancelar
                    </Button>

                    <Button variant="primary" onClick={handleVincular} disabled={cargando}>
                        {cargando ? (
                            <Spinner as="span" size="sm" animation="border" />
                        ) : (
                            "Vincular"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PanelUsuario;