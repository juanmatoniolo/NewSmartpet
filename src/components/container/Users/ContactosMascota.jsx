"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Tabs,
    Tab,
    Spinner,
    Alert,
    Card,
    Badge,
    ProgressBar,
} from "react-bootstrap";
import {
    FileText,
    Calendar,
    Syringe,
    Users,
    Clock,
    Plus,
    Search,
    Edit2,
    Trash2,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import axios from "axios";
import TarjetaContacto from "./ContactosMascota/TarjetaContacto";
import ModalContacto from "./ContactosMascota/ModalContacto";
import ModalCita from "./ContactosMascota/ModalCita";
import ModalVacuna from "./ContactosMascota/ModalVacuna";
import ModalHistorial from "./ContactosMascota/ModalHistorial";
import styles from "./ContactosMascota.module.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function ContactosMascota() {
    const { mascotaId } = useParams();
    const navigate = useNavigate();

    const [mascota, setMascota] = useState(null);
    const [contactos, setContactos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [vacunas, setVacunas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [tabActivo, setTabActivo] = useState("resumen");

    const [showModalContacto, setShowModalContacto] = useState(false);
    const [showModalCita, setShowModalCita] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [showModalVacuna, setShowModalVacuna] = useState(false);

    const [editandoContactoId, setEditandoContactoId] = useState(null);
    const [editandoCitaId, setEditandoCitaId] = useState(null);
    const [editandoHistorialId, setEditandoHistorialId] = useState(null);
    const [editandoVacunaId, setEditandoVacunaId] = useState(null);

    const [contactoEdit, setContactoEdit] = useState(null);
    const [citaEdit, setCitaEdit] = useState(null);
    const [historialEdit, setHistorialEdit] = useState(null);
    const [vacunaEdit, setVacunaEdit] = useState(null);

    useEffect(() => {
        if (!mascota?.nombre) return;

        document.title = `${mascota.nombre} | Contactos y Salud`;

        let meta = document.querySelector("meta[name='description']");
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "description";
            document.head.appendChild(meta);
        }

        meta.content = `Gestión de contactos, citas, vacunas y salud de ${mascota.nombre}`;
    }, [mascota]);

    useEffect(() => {
        if (!mascotaId) return;
        cargarTodo();
    }, [mascotaId]);

    const normalizarFecha = (fecha) => {
        const d = new Date(fecha);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const cargarTodo = async () => {
        setLoading(true);
        setError("");

        try {
            const [resMascota, resContactos, resHistorial] = await Promise.all([
                axios.get(`${API_BASE}/mascotas/${mascotaId}`),
                axios.get(`${API_BASE}/contactos-mascota?mascota_id=${mascotaId}`),
                axios.get(`${API_BASE}/historial-mascota?mascota_id=${mascotaId}`),
            ]);

            setMascota(resMascota.data || null);
            setContactos(Array.isArray(resContactos.data) ? resContactos.data : []);

            const historialData = Array.isArray(resHistorial.data) ? resHistorial.data : [];
            setHistorial(historialData.filter((item) => item.tipo_evento !== "vacuna"));
            setVacunas(historialData.filter((item) => item.tipo_evento === "vacuna"));
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    };

    const citas = useMemo(() => {
        return historial
            .filter((item) => item.tipo_evento === "cita" || item.tipo_evento === "turno")
            .sort((a, b) => new Date(a.fecha_evento || 0) - new Date(b.fecha_evento || 0));
    }, [historial]);

    const bitacora = useMemo(() => {
        return historial
            .filter((item) => item.tipo_evento === "historial")
            .sort((a, b) => new Date(b.fecha_evento || 0) - new Date(a.fecha_evento || 0));
    }, [historial]);

    const citasProximas = useMemo(() => {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        return citas.filter((c) => c.fecha_evento && normalizarFecha(c.fecha_evento) >= hoy);
    }, [citas]);

    const vacunasPendientes = useMemo(() => vacunas.filter((v) => !v.completada), [vacunas]);

    const contactosConCitas = useMemo(() => {
        const citasPorContacto = {};

        citas.forEach((cita) => {
            if (!cita.id_contacto) return;
            if (!citasPorContacto[cita.id_contacto]) citasPorContacto[cita.id_contacto] = [];
            citasPorContacto[cita.id_contacto].push(cita);
        });

        const hoy = new Date();

        return contactos.map((contacto) => {
            const lista = citasPorContacto[contacto.id] || [];
            const ordenadas = [...lista].sort(
                (a, b) => new Date(a.fecha_evento || 0) - new Date(b.fecha_evento || 0)
            );

            const ultimaCita = ordenadas.filter((c) => new Date(c.fecha_evento) <= hoy).pop();
            const proximaCita = ordenadas.find((c) => new Date(c.fecha_evento) > hoy);

            return { ...contacto, ultimaCita, proximaCita };
        });
    }, [contactos, citas]);

    const contactosFiltrados = useMemo(() => {
        let resultado = [...contactosConCitas];
        const term = searchTerm.trim().toLowerCase();

        if (filtroTipo !== "todos") {
            resultado = resultado.filter((c) => c.tipo === filtroTipo);
        }

        if (term) {
            resultado = resultado.filter(
                (c) =>
                    (c.nombre || "").toLowerCase().includes(term) ||
                    (c.apellido || "").toLowerCase().includes(term)
            );
        }

        return resultado.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return (a.nombre || "").localeCompare(b.nombre || "");
        });
    }, [contactosConCitas, filtroTipo, searchTerm]);

    const calcularSaludVacunas = () => {
        if (vacunas.length === 0) return 0;
        return Math.round((vacunas.filter((v) => v.completada).length / vacunas.length) * 100);
    };

    const renderTipo = (contacto) => {
        if (contacto.tipo === "otro") return contacto.categoria_personalizada || "Otro";

        const tipos = {
            veterinario: "Veterinario",
            peluqueria: "Peluquería",
            paseador: "Paseador",
            petshop: "Pet Shop",
            guarderia: "Guardería",
        };

        return tipos[contacto.tipo] || "Sin tipo";
    };

    const getIconoTipo = (tipo) => {
        const mapa = {
            veterinario: "🏥",
            peluqueria: "✂️",
            paseador: "🦮",
            petshop: "🏪",
            guarderia: "🏠",
        };

        return mapa[tipo] || "📋";
    };

    const enviarWhatsApp = (celular, nombre) => {
        if (!celular) return;

        let numero = celular.replace(/\D/g, "");
        if (numero.length === 10) numero = `54${numero}`;

        window.open(`https://wa.me/${numero}?text=Hola%20${encodeURIComponent(nombre)}`, "_blank");
    };

    const handleGuardarContacto = async (formData) => {
        try {
            const payload = { id_mascota: mascotaId, ...formData };

            if (editandoContactoId) {
                await axios.put(`${API_BASE}/contactos-mascota/${editandoContactoId}`, payload);
            } else {
                await axios.post(`${API_BASE}/contactos-mascota`, payload);
            }

            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar contacto.");
            return false;
        }
    };

    const eliminarContacto = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/contactos-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    const toggleFavorito = async (contacto) => {
        try {
            const payload = {
                id_mascota: mascotaId,
                tipo: contacto.tipo,
                categoria_personalizada: contacto.categoria_personalizada || "",
                nombre: contacto.nombre,
                apellido: contacto.apellido || "",
                celular: contacto.celular || "",
                telefono_fijo: contacto.telefono_fijo || "",
                direccion: contacto.direccion || "",
                horarios: contacto.horarios || "",
                dias_atencion: contacto.dias_atencion || "",
                notas: contacto.notas || "",
                favorito: !contacto.favorito,
            };

            await axios.put(`${API_BASE}/contactos-mascota/${contacto.id}`, payload);
            await cargarTodo();
        } catch (err) {
            setError("Error al actualizar favorito.");
        }
    };

    const handleGuardarCita = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "cita" };

            if (editandoCitaId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoCitaId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }

            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar cita.");
            return false;
        }
    };

    const eliminarCita = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    const handleGuardarVacuna = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "vacuna" };

            if (editandoVacunaId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoVacunaId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }

            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar vacuna.");
            return false;
        }
    };

    const eliminarVacuna = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar vacuna "${nombre}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    const handleGuardarHistorial = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "historial" };

            if (editandoHistorialId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoHistorialId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }

            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar registro.");
            return false;
        }
    };

    const eliminarHistorial = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;

        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <div className="mt-3">Cargando información...</div>
            </Container>
        );
    }

    return (
        <Container fluid className={styles.container}>
            <Row className="mb-3">
                <Col>
                    <div className={styles.header}>
                        <div className={styles.titleSection}>
                            <h2>
                                <FileText size={24} className="me-1" /> {mascota?.nombre || "Mascota"}
                            </h2>
                            <small>Gestión integral de salud y cuidados</small>
                        </div>

                        <Button
                            variant="outline-secondary"
                            className={styles.backButton}
                            onClick={() => navigate(-1)}
                        >
                            ← Volver
                        </Button>
                    </div>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            <Tabs activeKey={tabActivo} onSelect={setTabActivo} className={`${styles.tabs} mb-3`}>
                <Tab eventKey="resumen" title={<><FileText size={14} className="me-1" /> Resumen</>}>
                    <Row className="g-2 g-md-3 mb-3">
                        <Col xs={12} sm={6} lg={3}>
                            <Card className={styles.summaryCard} onClick={() => setTabActivo("citas")}>
                                <Card.Body className="p-3 p-md-4">
                                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                                        <div className={`${styles.iconCircle} ${styles.bgPrimaryLight}`}>
                                            <Calendar size={22} className={styles.textPrimary} />
                                        </div>
                                        <div>
                                            <div className={styles.cardLabel}>Próximas Citas</div>
                                            <div className={`${styles.cardValue} ${styles.textPrimary}`}>
                                                {citasProximas.length}
                                            </div>
                                        </div>
                                    </div>

                                    {citasProximas.length > 0 ? (
                                        <div className={styles.cardPreview}>
                                            <div className="d-flex align-items-start gap-2">
                                                <AlertCircle size={14} className="text-warning flex-shrink-0 mt-1" />
                                                <div>
                                                    <strong>{citasProximas[0].titulo}</strong>
                                                    <div className="text-muted">
                                                        {new Date(citasProximas[0].fecha_evento).toLocaleDateString("es-AR", {
                                                            day: "2-digit",
                                                            month: "short",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {citasProximas.length > 1 && (
                                                <div className="text-center mt-2">
                                                    <Badge bg="light" text="dark" className="py-1 px-2">
                                                        +{citasProximas.length - 1} más
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 text-muted small">Sin citas programadas</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className={styles.summaryCard} onClick={() => setTabActivo("vacunas")}>
                                <Card.Body className="p-3 p-md-4">
                                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                                        <div className={`${styles.iconCircle} ${styles.bgSuccessLight}`}>
                                            <Syringe size={22} className={styles.textSuccess} />
                                        </div>
                                        <div>
                                            <div className={styles.cardLabel}>Vacunas</div>
                                            <div className={`${styles.cardValue} ${styles.textSuccess}`}>
                                                {vacunas.filter((v) => v.completada).length}/{vacunas.length}
                                            </div>
                                        </div>
                                    </div>

                                    {vacunas.length > 0 ? (
                                        <div className={styles.cardPreview}>
                                            <ProgressBar
                                                now={calcularSaludVacunas()}
                                                className={styles.progressBar}
                                                variant="success"
                                            />
                                            <div className="d-flex justify-content-between mt-2 small">
                                                <span>{calcularSaludVacunas()}% completado</span>
                                                {vacunasPendientes.length > 0 && (
                                                    <Badge bg="warning" text="dark">
                                                        {vacunasPendientes.length} pend.
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 text-muted small">Sin vacunas registradas</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className={styles.summaryCard} onClick={() => setTabActivo("contactos")}>
                                <Card.Body className="p-3 p-md-4">
                                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                                        <div className={`${styles.iconCircle} ${styles.bgInfoLight}`}>
                                            <Users size={22} className={styles.textInfo} />
                                        </div>
                                        <div>
                                            <div className={styles.cardLabel}>Contactos</div>
                                            <div className={`${styles.cardValue} ${styles.textInfo}`}>{contactos.length}</div>
                                        </div>
                                    </div>

                                    <div className={styles.cardPreview}>
                                        <div className="d-flex justify-content-between mb-1 small">
                                            <span>⭐ Favoritos</span>
                                            <Badge bg="light" text="dark">
                                                {contactos.filter((c) => c.favorito).length}
                                            </Badge>
                                        </div>

                                        <div className="d-flex flex-wrap gap-1">
                                            {["veterinario", "peluqueria", "paseador", "petshop"].map((tipo) => {
                                                const cantidad = contactos.filter((c) => c.tipo === tipo).length;
                                                if (cantidad === 0) return null;

                                                return (
                                                    <Badge key={tipo} bg="light" text="dark" className="small">
                                                        {getIconoTipo(tipo)} {cantidad}
                                                    </Badge>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={3}>
                            <Card className={styles.summaryCard} onClick={() => setTabActivo("bitacora")}>
                                <Card.Body className="p-3 p-md-4">
                                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                                        <div className={`${styles.iconCircle} ${styles.bgDarkLight}`}>
                                            <FileText size={22} className={styles.textDark} />
                                        </div>
                                        <div>
                                            <div className={styles.cardLabel}>Bitácora</div>
                                            <div className={`${styles.cardValue} ${styles.textDark}`}>{bitacora.length}</div>
                                        </div>
                                    </div>

                                    {bitacora.length > 0 ? (
                                        <div className={styles.cardPreview}>
                                            <div className="d-flex align-items-center gap-1">
                                                <Clock size={12} />
                                                <strong>Último:</strong>
                                            </div>
                                            <div className="text-muted small mt-1">
                                                {bitacora[0]?.fecha_evento
                                                    ? new Date(bitacora[0].fecha_evento).toLocaleDateString("es-AR", {
                                                        day: "2-digit",
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "Sin fecha"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 text-muted small">Sin registros</div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <div className={styles.quickActions}>
                        <h5>
                            <Plus size={18} className="me-1" />
                            Acciones Rápidas
                        </h5>

                        <Row className="g-2">
                            <Col xs={6} sm={3}>
                                <Button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setEditandoCitaId(null);
                                        setCitaEdit(null);
                                        setShowModalCita(true);
                                    }}
                                >
                                    <Calendar size={16} /> <span className="d-none d-sm-inline">Nueva</span> Cita
                                </Button>
                            </Col>

                            <Col xs={6} sm={3}>
                                <Button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setEditandoVacunaId(null);
                                        setVacunaEdit(null);
                                        setShowModalVacuna(true);
                                    }}
                                >
                                    <Syringe size={16} /> <span className="d-none d-sm-inline">Nueva</span> Vacuna
                                </Button>
                            </Col>

                            <Col xs={6} sm={3}>
                                <Button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setEditandoContactoId(null);
                                        setContactoEdit(null);
                                        setShowModalContacto(true);
                                    }}
                                >
                                    <Users size={16} /> <span className="d-none d-sm-inline">Nuevo</span> Contacto
                                </Button>
                            </Col>

                            <Col xs={6} sm={3}>
                                <Button
                                    className={styles.actionButton}
                                    onClick={() => {
                                        setEditandoHistorialId(null);
                                        setHistorialEdit(null);
                                        setShowModalHistorial(true);
                                    }}
                                >
                                    <FileText size={16} /> <span className="d-none d-sm-inline">Nuevo</span> Registro
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Tab>

                <Tab eventKey="contactos" title={<><Users size={14} className="me-1" /> Contactos ({contactos.length})</>}>
                    <Row className="mb-3 g-2">
                        <Col xs={12} sm={6} md={5} lg={6}>
                            <div className={styles.searchWrapper}>
                                <Search size={16} className={styles.searchIcon} />
                                <input
                                    type="text"
                                    className={`form-control ${styles.searchInput}`}
                                    placeholder="Buscar contactos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>

                        <Col xs={8} sm={4} md={4} lg={4}>
                            <select
                                className={`form-select ${styles.filterSelect}`}
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="veterinario">Veterinarios</option>
                                <option value="peluqueria">Peluquerías</option>
                                <option value="paseador">Paseadores</option>
                                <option value="petshop">Pet Shops</option>
                                <option value="guarderia">Guarderías</option>
                                <option value="otro">Otros</option>
                            </select>
                        </Col>

                        <Col xs={4} sm={2} md={3} lg={2}>
                            <Button
                                className={styles.newButton}
                                onClick={() => {
                                    setEditandoContactoId(null);
                                    setContactoEdit(null);
                                    setShowModalContacto(true);
                                }}
                            >
                                <Plus size={16} /> <span className="d-none d-sm-inline">Nuevo</span>
                            </Button>
                        </Col>
                    </Row>

                    <Row className="g-2 g-md-3">
                        {contactosFiltrados.map((contacto) => (
                            <Col xs={12} md={6} lg={4} key={contacto.id}>
                                <TarjetaContacto
                                    contacto={contacto}
                                    onToggleFavorito={toggleFavorito}
                                    onEditar={(contactoSeleccionado) => {
                                        setEditandoContactoId(contactoSeleccionado.id);
                                        setContactoEdit(contactoSeleccionado);
                                        setShowModalContacto(true);
                                    }}
                                    onEliminar={eliminarContacto}
                                    onWhatsApp={enviarWhatsApp}
                                    renderTipo={renderTipo}
                                    getIconoTipo={getIconoTipo}
                                />
                            </Col>
                        ))}
                    </Row>
                </Tab>

                <Tab
                    eventKey="citas"
                    title={
                        <>
                            <Calendar size={14} className="me-1" /> Citas ({citas.length})
                        </>
                    }
                >
                    <div className={styles.citasHeader}>
                        <div>
                            <h5 className={styles.citasTitle}>Agenda de citas</h5>
                            <p className={styles.citasSubtitle}>
                                Organizá controles, peluquería, vacunación y seguimientos.
                            </p>
                        </div>

                        <Button
                            className={styles.newButton}
                            onClick={() => {
                                setEditandoCitaId(null);
                                setCitaEdit(null);
                                setShowModalCita(true);
                            }}
                        >
                            <Plus size={16} /> Nueva Cita
                        </Button>
                    </div>

                    {citasProximas.length > 0 && (
                        <section className={styles.destacadasSection}>
                            <div className={styles.sectionBlockHeader}>
                                <div className={styles.sectionBadgeWarning}>
                                    <AlertCircle size={15} />
                                    Próximas
                                </div>
                                <span className={styles.sectionHint}>
                                    {citasProximas.length} pendiente{citasProximas.length !== 1 ? "s" : ""}
                                </span>
                            </div>

                            <Row className="g-3 mb-4">
                                {citasProximas.map((item) => (
                                    <Col xs={12} key={item.id}>
                                        <Card className={styles.citaDestacadaCard}>
                                            <Card.Body className="p-3 p-md-4">
                                                <div className={styles.citaTopRow}>
                                                    <div className={styles.citaTopLeft}>
                                                        <div className={styles.citaIconWrap}>
                                                            <Calendar size={18} />
                                                        </div>

                                                        <div>
                                                            <h6 className={styles.citaTitulo}>{item.titulo}</h6>
                                                            <div className={styles.citaMeta}>
                                                                <span className={styles.citaMetaItem}>
                                                                    <Calendar size={13} />
                                                                    {new Date(item.fecha_evento).toLocaleDateString("es-AR", {
                                                                        day: "2-digit",
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    })}
                                                                </span>

                                                                {item.id_contacto && (
                                                                    <span className={styles.citaMetaItem}>
                                                                        <Users size={13} />
                                                                        Contacto asociado
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className={styles.citaActions}>
                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className={styles.iconActionBtn}
                                                            onClick={() => {
                                                                setEditandoCitaId(item.id);
                                                                setCitaEdit(item);
                                                                setShowModalCita(true);
                                                            }}
                                                        >
                                                            <Edit2 size={15} />
                                                        </Button>

                                                        <Button
                                                            variant="light"
                                                            size="sm"
                                                            className={styles.iconDeleteBtn}
                                                            onClick={() => eliminarCita(item.id, item.titulo)}
                                                        >
                                                            <Trash2 size={15} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                {item.nota && (
                                                    <div className={styles.citaDetalleBox}>
                                                        <strong>Detalle</strong>
                                                        <p>{item.nota}</p>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </section>
                    )}

                    <section>
                        <div className={styles.sectionBlockHeader}>
                            <div className={styles.sectionBadgePrimary}>
                                <FileText size={15} />
                                Historial de citas
                            </div>
                            <span className={styles.sectionHint}>
                                {citas.length} registrada{citas.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        <Row className="g-3">
                            {citas.length === 0 ? (
                                <Col xs={12}>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>
                                            <Calendar size={24} />
                                        </div>
                                        <h6>No hay citas registradas</h6>
                                        <p>Agregá la primera cita para empezar a organizar el seguimiento.</p>
                                        <Button
                                            className={styles.emptyButton}
                                            onClick={() => {
                                                setEditandoCitaId(null);
                                                setCitaEdit(null);
                                                setShowModalCita(true);
                                            }}
                                        >
                                            <Plus size={16} /> Crear primera cita
                                        </Button>
                                    </div>
                                </Col>
                            ) : (
                                citas.map((item) => {
                                    const esProxima =
                                        item.fecha_evento &&
                                        new Date(item.fecha_evento).setHours(0, 0, 0, 0) >=
                                        new Date().setHours(0, 0, 0, 0);

                                    return (
                                        <Col xs={12} md={6} xl={4} key={item.id}>
                                            <Card className={styles.citaCardCustom}>
                                                <Card.Body className="p-3">
                                                    <div className={styles.citaCardHeader}>
                                                        <div className={styles.citaCardTitleWrap}>
                                                            <h6 className={styles.citaCardTitle}>{item.titulo}</h6>
                                                            <div className={styles.citaCardBadges}>
                                                                <Badge className={styles.citaBadge}>
                                                                    {esProxima ? "Próxima" : "Realizada"}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className={styles.citaMiniDate}>
                                                            {item.fecha_evento &&
                                                                new Date(item.fecha_evento).toLocaleDateString("es-AR")}
                                                        </div>
                                                    </div>

                                                    {item.nota && <p className={styles.citaCardText}>{item.nota}</p>}

                                                    <div className={styles.citaCardFooter}>
                                                        <button
                                                            type="button"
                                                            className={styles.citaFooterBtn}
                                                            onClick={() => {
                                                                setEditandoCitaId(item.id);
                                                                setCitaEdit(item);
                                                                setShowModalCita(true);
                                                            }}
                                                        >
                                                            <Edit2 size={14} />
                                                            Editar
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={`${styles.citaFooterBtn} ${styles.citaFooterBtnDanger}`}
                                                            onClick={() => eliminarCita(item.id, item.titulo)}
                                                        >
                                                            <Trash2 size={14} />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    );
                                })
                            )}
                        </Row>
                    </section>
                </Tab>
                <Tab eventKey="vacunas" title={<><Syringe size={14} className="me-1" /> Vacunas ({vacunas.length})</>}>
                    <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h5 className="mb-1 fs-6 fs-md-5">Plan de Vacunación</h5>
                            <ProgressBar
                                now={calcularSaludVacunas()}
                                label={`${calcularSaludVacunas()}%`}
                                variant="success"
                                className={styles.progressBar}
                                style={{ width: "160px" }}
                            />
                        </div>

                        <Button
                            className={styles.newButton}
                            onClick={() => {
                                setEditandoVacunaId(null);
                                setVacunaEdit(null);
                                setShowModalVacuna(true);
                            }}
                        >
                            <Plus size={16} /> Nueva Vacuna
                        </Button>
                    </div>

                    {vacunasPendientes.length > 0 && (
                        <Alert variant="warning" className="small">
                            <strong>⚠️ {vacunasPendientes.length} vacuna(s) pendiente(s)</strong>
                        </Alert>
                    )}

                    <Row className="g-2 g-md-3">
                        {vacunas.length === 0 ? (
                            <Col xs={12}>
                                <Alert variant="light" className="text-center">
                                    No hay vacunas registradas.
                                </Alert>
                            </Col>
                        ) : (
                            vacunas.map((vacuna) => (
                                <Col xs={12} md={6} lg={4} key={vacuna.id}>
                                    <Card className={`h-100 ${vacuna.completada ? "border-success" : "border-warning"}`}>
                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div>
                                                    <h6 className="mb-1">{vacuna.titulo}</h6>
                                                    {vacuna.completada ? (
                                                        <Badge bg="success">
                                                            <CheckCircle size={12} className="me-1" /> Aplicada
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="warning" text="dark">
                                                            <AlertCircle size={12} className="me-1" /> Pendiente
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {vacuna.fecha_evento && (
                                                <div className="small mb-1">
                                                    <strong>Aplicada:</strong>{" "}
                                                    {new Date(vacuna.fecha_evento).toLocaleDateString("es-AR")}
                                                </div>
                                            )}

                                            {vacuna.proxima_fecha && (
                                                <div className="small mb-1">
                                                    <strong>Próxima:</strong>{" "}
                                                    {new Date(vacuna.proxima_fecha).toLocaleDateString("es-AR")}
                                                </div>
                                            )}

                                            {vacuna.laboratorio && (
                                                <div className="small mb-1">
                                                    <strong>Lab:</strong> {vacuna.laboratorio}
                                                </div>
                                            )}

                                            {vacuna.lote && (
                                                <div className="small mb-1">
                                                    <strong>Lote:</strong> {vacuna.lote}
                                                </div>
                                            )}

                                            {vacuna.nota && <div className="mt-2 p-2 bg-light rounded small">{vacuna.nota}</div>}

                                            <div className="d-flex gap-1 mt-3">
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => {
                                                        setEditandoVacunaId(vacuna.id);
                                                        setVacunaEdit(vacuna);
                                                        setShowModalVacuna(true);
                                                    }}
                                                >
                                                    <Edit2 size={14} />
                                                </Button>

                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => eliminarVacuna(vacuna.id, vacuna.titulo)}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>

                <Tab eventKey="bitacora" title={<><FileText size={14} className="me-1" /> Bitácora ({bitacora.length})</>}>
                    <div className="mb-3">
                        <Button
                            className={styles.newButton}
                            onClick={() => {
                                setEditandoHistorialId(null);
                                setHistorialEdit(null);
                                setShowModalHistorial(true);
                            }}
                        >
                            <Plus size={16} /> Nuevo Registro
                        </Button>
                    </div>

                    <Row className="g-2">
                        {bitacora.length === 0 ? (
                            <Col xs={12}>
                                <Alert variant="light" className="text-center">
                                    No hay registros en la bitácora.
                                </Alert>
                            </Col>
                        ) : (
                            bitacora.map((item) => (
                                <Col xs={12} key={item.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body className="p-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <div>
                                                    <h6 className="mb-1">{item.titulo}</h6>
                                                    {item.fecha_evento && (
                                                        <small className="text-muted">
                                                            {new Date(item.fecha_evento).toLocaleDateString("es-AR")}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="d-flex gap-1">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditandoHistorialId(item.id);
                                                            setHistorialEdit(item);
                                                            setShowModalHistorial(true);
                                                        }}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>

                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => eliminarHistorial(item.id, item.titulo)}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </div>

                                            <p className="mb-0 small">{item.nota}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>
            </Tabs>

            <ModalContacto
                show={showModalContacto}
                onHide={() => {
                    setShowModalContacto(false);
                    setContactoEdit(null);
                    setEditandoContactoId(null);
                }}
                contactoEdit={contactoEdit}
                onSave={handleGuardarContacto}
            />

            <ModalCita
                show={showModalCita}
                onHide={() => {
                    setShowModalCita(false);
                    setCitaEdit(null);
                    setEditandoCitaId(null);
                }}
                citaEdit={citaEdit}
                contactos={contactos}
                mascotaId={mascotaId}
                onSave={handleGuardarCita}
            />

            <ModalVacuna
                show={showModalVacuna}
                onHide={() => {
                    setShowModalVacuna(false);
                    setVacunaEdit(null);
                    setEditandoVacunaId(null);
                }}
                vacunaEdit={vacunaEdit}
                mascotaId={mascotaId}
                onSave={handleGuardarVacuna}
            />

            <ModalHistorial
                show={showModalHistorial}
                onHide={() => {
                    setShowModalHistorial(false);
                    setHistorialEdit(null);
                    setEditandoHistorialId(null);
                }}
                historialEdit={historialEdit}
                contactos={contactos}
                mascotaId={mascotaId}
                onSave={handleGuardarHistorial}
            />
        </Container>
    );
}

export default ContactosMascota;