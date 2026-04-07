import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import TarjetaMascota from "./TarjetaMascota";
import TarjetaCodigoVacio from "./TarjetaCodigoVacio";
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

    useEffect(() => {
        if (!usuarioId) return;
        cargarDatosUsuario();
        cargarCodigos();
    }, [usuarioId]);

    const cargarDatosUsuario = async () => {
        try {
            const res = await axios.get(`${API_BASE}/usuarios/${usuarioId}`);
            setNombreUsuario(res.data?.nombre || "Usuario");
        } catch (err) {
            console.error("Error al cargar usuario", err);
            setNombreUsuario("Usuario");
        }
    };

    const cargarCodigos = async () => {
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

                        return {
                            ...code,
                            mascota: mascotaValida,
                        };
                    } catch (err) {
                        console.error(`Error al cargar mascota del código ${code.codigo_id}`, err);
                        return {
                            ...code,
                            mascota: null,
                        };
                    }
                })
            );

            setCodigosVinculados(codigosConMascotas);
        } catch (err) {
            console.error("Error al cargar códigos", err);
            setCodigosVinculados([]);
        } finally {
            setCargandoCodigos(false);
        }
    };

    const handleVincular = async (e) => {
        if (e) e.preventDefault();

        const codigoNormalizado = codigo.trim().toUpperCase();

        if (!/^[A-Z0-9]{8}$/.test(codigoNormalizado)) {
            setMensaje("Formato inválido: 4 letras + 4 números (ej: ABCD1234)");
            return;
        }

        setCargando(true);

        try {
            await axios.post(`${API_BASE}/user-codes`, {
                usuario_id: usuarioId,
                codigo_unico: codigoNormalizado,
            });

            setMensaje("✅ Código vinculado");
            setCodigo("");

            setTimeout(() => {
                setShowModalVincular(false);
                setMensaje("");
                cargarCodigos();
            }, 1200);
        } catch (err) {
            setMensaje(`❌ ${err.response?.data?.error || "Error al vincular"}`);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="panel-usuario-container" key={usuarioId}>
            <div className="bienvenida-section">
                <h2>¡Bienvenido, {nombreUsuario}!</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        setShowModalVincular(true);
                        setMensaje("");
                    }}
                >
                    + Vincular nuevo código
                </Button>
            </div>

            <div className="mascotas-section">
                <h3>Mis códigos vinculados</h3>

                {cargandoCodigos ? (
                    <div className="text-center">Cargando códigos...</div>
                ) : codigosVinculados.length === 0 ? (
                    <div className="sin-mascotas">
                        <p>No tienes códigos vinculados aún.</p>
                        <p>Usa el botón "Vincular nuevo código" para comenzar.</p>
                    </div>
                ) : (
                    <div className="mascotas-grid">
                        {codigosVinculados.map((item) =>
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
                            />
                        </Form.Group>

                        {mensaje && (
                            <div className={`mt-2 ${mensaje.includes("✅") ? "text-success" : "text-danger"}`}>
                                {mensaje}
                            </div>
                        )}
                    </Form>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowModalVincular(false);
                            setMensaje("");
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button variant="primary" onClick={handleVincular} disabled={cargando}>
                        {cargando ? "Vinculando..." : "Vincular"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PanelUsuario;