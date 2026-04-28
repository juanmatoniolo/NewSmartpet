"use client";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  Form,
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
  Heart,
  Star,
} from "lucide-react";
import axios from "axios";
import TarjetaContacto from "./ContactosMascota/TarjetaContacto";
import ModalContacto from "./ContactosMascota/ModalContacto";
import ModalCita from "./ContactosMascota/ModalCita";
import ModalVacuna from "./ContactosMascota/ModalVacuna";
import ModalHistorial from "./ContactosMascota/ModalHistorial";
import styles from "./ContactosMascota.module.css";
import HeaderLogout from "../../Logout/Logout";

import API_BASE from "../../../config/api";

// 🔧 Construir URL completa con index.php
const API_URL = `${API_BASE}/index.php`;

function ContactosMascota() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId && currentUserId && parseInt(userId) !== parseInt(currentUserId)) {
      navigate(`/agenda/${currentUserId}`);
    }
  }, [userId, currentUserId, navigate]);

  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionadaId, setMascotaSeleccionadaId] = useState("todas");
  const [contactos, setContactos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [tabActivo, setTabActivo] = useState("resumen");

  // Socios (Amigos SP) desde la base de datos
  const [socios, setSocios] = useState([]);
  const [cargandoSocios, setCargandoSocios] = useState(false);

  // Modales y edición
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

  // Cargar socios desde la API
  const cargarSocios = useCallback(async () => {
    setCargandoSocios(true);
    try {
      // ✅ Usar API_URL
      const res = await axios.get(`${API_URL}/socios`);
      const data = Array.isArray(res.data) ? res.data : [];
      setSocios(data);
    } catch (err) {
      console.error("Error al cargar socios:", err);
      setSocios([]);
    } finally {
      setCargandoSocios(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    cargarTodosLosDatos();
    cargarSocios();
  }, [userId, cargarSocios]);

  const cargarTodosLosDatos = async () => {
    setLoading(true);
    setError("");
    try {
      // ✅ Usar API_URL
      const resMascotas = await axios.get(`${API_URL}/mascotas?usuario_id=${userId}`);
      const mascotasData = Array.isArray(resMascotas.data) ? resMascotas.data : [];
      setMascotas(mascotasData);

      if (mascotasData.length === 0) {
        setLoading(false);
        return;
      }

      const promesasContactos = mascotasData.map(m =>
        axios.get(`${API_URL}/contactos-mascota?mascota_id=${m.id}`).catch(() => ({ data: [] }))
      );
      const promesasHistorial = mascotasData.map(m =>
        axios.get(`${API_URL}/historial-mascota?mascota_id=${m.id}`).catch(() => ({ data: [] }))
      );

      const resultadosContactos = await Promise.all(promesasContactos);
      const resultadosHistorial = await Promise.all(promesasHistorial);

      let todosContactos = [];
      let todoHistorial = [];

      mascotasData.forEach((m, idx) => {
        const contactosMascota = resultadosContactos[idx].data;
        if (Array.isArray(contactosMascota)) {
          contactosMascota.forEach(c => {
            todosContactos.push({
              ...c,
              mascotaId: m.id,
              nombreMascota: m.nombre,
            });
          });
        }

        const historialMascota = resultadosHistorial[idx].data;
        if (Array.isArray(historialMascota)) {
          historialMascota.forEach(h => {
            todoHistorial.push({
              ...h,
              mascotaId: m.id,
              nombreMascota: m.nombre,
            });
          });
        }
      });

      setContactos(todosContactos);
      setHistorial(todoHistorial);
      setVacunas(todoHistorial.filter(item => item.tipo_evento === "vacuna"));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información.");
    } finally {
      setLoading(false);
    }
  };

  const normalizarFecha = (fecha) => {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const filtrarPorMascota = (data, mascotaId) => {
    if (mascotaId === "todas") return data;
    return data.filter(item => item.mascotaId === parseInt(mascotaId));
  };

  const contactosFiltradosPorMascota = useMemo(() => {
    let resultado = filtrarPorMascota(contactos, mascotaSeleccionadaId);
    const term = searchTerm.trim().toLowerCase();
    if (filtroTipo !== "todos") {
      resultado = resultado.filter(c => c.tipo === filtroTipo);
    }
    if (term) {
      resultado = resultado.filter(c =>
        (c.nombre || "").toLowerCase().includes(term) ||
        (c.apellido || "").toLowerCase().includes(term)
      );
    }
    return resultado.sort((a, b) => {
      if (a.favorito && !b.favorito) return -1;
      if (!a.favorito && b.favorito) return 1;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });
  }, [contactos, mascotaSeleccionadaId, filtroTipo, searchTerm]);

  const citas = useMemo(() => {
    return historial
      .filter(item => item.tipo_evento === "cita" || item.tipo_evento === "turno")
      .sort((a, b) => new Date(a.fecha_evento || 0) - new Date(b.fecha_evento || 0));
  }, [historial]);

  const vacunasFiltradas = useMemo(() => {
    return filtrarPorMascota(vacunas, mascotaSeleccionadaId);
  }, [vacunas, mascotaSeleccionadaId]);

  const bitacora = useMemo(() => {
    return historial
      .filter(item => item.tipo_evento === "historial")
      .sort((a, b) => new Date(b.fecha_evento || 0) - new Date(a.fecha_evento || 0));
  }, [historial]);

  const bitacoraFiltrada = useMemo(() => {
    return filtrarPorMascota(bitacora, mascotaSeleccionadaId);
  }, [bitacora, mascotaSeleccionadaId]);

  const citasFiltradas = useMemo(() => {
    return filtrarPorMascota(citas, mascotaSeleccionadaId);
  }, [citas, mascotaSeleccionadaId]);

  const citasProximas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return citasFiltradas.filter(c => c.fecha_evento && normalizarFecha(c.fecha_evento) >= hoy);
  }, [citasFiltradas]);

  const vacunasPendientes = useMemo(() => vacunasFiltradas.filter(v => !v.completada), [vacunasFiltradas]);

  const calcularSaludVacunas = () => {
    if (vacunasFiltradas.length === 0) return 0;
    const completadas = vacunasFiltradas.filter(v => v.completada).length;
    return Math.round((completadas / vacunasFiltradas.length) * 100);
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

  // CRUD: funciones de guardado
  const handleGuardarContacto = async (formData) => {
    try {
      const payload = { ...formData };
      if (editandoContactoId) {
        await axios.put(`${API_URL}/contactos-mascota/${editandoContactoId}`, payload);
      } else {
        await axios.post(`${API_URL}/contactos-mascota`, payload);
      }
      await cargarTodosLosDatos();
      return true;
    } catch (err) {
      setError("Error al guardar contacto.");
      return false;
    }
  };

  const eliminarContacto = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await axios.delete(`${API_URL}/contactos-mascota/${id}`);
      await cargarTodosLosDatos();
    } catch (err) {
      setError("Error al eliminar.");
    }
  };

  const toggleFavorito = async (contacto) => {
    try {
      const payload = { ...contacto, favorito: !contacto.favorito };
      delete payload.mascotaId;
      delete payload.nombreMascota;
      await axios.put(`${API_URL}/contactos-mascota/${contacto.id}`, payload);
      await cargarTodosLosDatos();
    } catch (err) {
      setError("Error al actualizar favorito.");
    }
  };

  const handleGuardarCita = async (data) => {
    try {
      const payload = { ...data, tipo_evento: "cita" };
      if (editandoCitaId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoCitaId}`, payload);
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
      }
      await cargarTodosLosDatos();
      return true;
    } catch (err) {
      setError("Error al guardar cita.");
      return false;
    }
  };

  const eliminarCita = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;
    try {
      await axios.delete(`${API_URL}/historial-mascota/${id}`);
      await cargarTodosLosDatos();
    } catch (err) {
      setError("Error al eliminar.");
    }
  };

  const handleGuardarVacuna = async (data) => {
    try {
      const payload = { ...data, tipo_evento: "vacuna" };
      if (editandoVacunaId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoVacunaId}`, payload);
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
      }
      await cargarTodosLosDatos();
      return true;
    } catch (err) {
      setError("Error al guardar vacuna.");
      return false;
    }
  };

  const eliminarVacuna = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar vacuna "${nombre}"?`)) return;
    try {
      await axios.delete(`${API_URL}/historial-mascota/${id}`);
      await cargarTodosLosDatos();
    } catch (err) {
      setError("Error al eliminar.");
    }
  };

  const handleGuardarHistorial = async (data) => {
    try {
      const payload = { ...data, tipo_evento: "historial" };
      if (editandoHistorialId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoHistorialId}`, payload);
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
      }
      await cargarTodosLosDatos();
      return true;
    } catch (err) {
      setError("Error al guardar registro.");
      return false;
    }
  };

  const eliminarHistorial = async (id, titulo) => {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;
    try {
      await axios.delete(`${API_URL}/historial-mascota/${id}`);
      await cargarTodosLosDatos();
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

  const currentMascotaId = mascotaSeleccionadaId !== "todas" ? mascotaSeleccionadaId : (mascotas[0]?.id || "");

  return (
    <>
      <HeaderLogout />
      <Container fluid className={styles.container}>
        <Row className="mb-3">
          <Col>
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <h2><FileText size={24} className="me-1" /> Mi Agenda General</h2>
                <small>Gestión integral de salud y cuidados de todas tus mascotas</small>
              </div>
              <Link to={`/Consultas/${userId}`} className={`btn btn-outline-secondary ${styles.backButton}`}>
                ← Volver
              </Link>
            </div>
          </Col>
        </Row>

        {mascotas.length > 1 && (
          <Row className="mb-3">
            <Col xs={12} md={4}>
              <Form.Group>
                <Form.Label>Filtrar por mascota:</Form.Label>
                <Form.Select
                  value={mascotaSeleccionadaId}
                  onChange={(e) => setMascotaSeleccionadaId(e.target.value)}
                >
                  <option value="todas">Todas las mascotas ({mascotas.length})</option>
                  {mascotas.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

        <Tabs activeKey={tabActivo} onSelect={setTabActivo} className={`${styles.tabs} mb-3`}>
          {/* TAB RESUMEN */}
          <Tab eventKey="resumen" title={<><FileText size={14} className="me-1" /> Resumen</>}>
            <Row className="g-2 g-md-3 mb-3">
              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={() => { setEditandoCitaId(null); setCitaEdit(null); setShowModalCita(true); }}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                      <div className={`${styles.iconCircle} ${styles.bgPrimaryLight}`}><Calendar size={22} className={styles.textPrimary} /></div>
                      <div><div className={styles.cardLabel}>Próximas Citas</div><div className={`${styles.cardValue} ${styles.textPrimary}`}>{citasProximas.length}</div></div>
                    </div>
                    {citasProximas.length > 0 ? (
                      <div className={styles.cardPreview}>
                        <div className="d-flex align-items-start gap-2">
                          <AlertCircle size={14} className="text-warning flex-shrink-0 mt-1" />
                          <div><strong>{citasProximas[0].titulo}</strong><div className="text-muted">{new Date(citasProximas[0].fecha_evento).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}</div>{citasProximas[0].nombreMascota && <div className="small text-muted">🐾 {citasProximas[0].nombreMascota}</div>}</div>
                        </div>
                        {citasProximas.length > 1 && <div className="text-center mt-2"><Badge bg="light" text="dark">+{citasProximas.length - 1} más</Badge></div>}
                      </div>
                    ) : <div className="text-center py-2 text-muted small">Sin citas programadas</div>}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={() => { setEditandoVacunaId(null); setVacunaEdit(null); setShowModalVacuna(true); }}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                      <div className={`${styles.iconCircle} ${styles.bgSuccessLight}`}><Syringe size={22} className={styles.textSuccess} /></div>
                      <div><div className={styles.cardLabel}>Vacunas</div><div className={`${styles.cardValue} ${styles.textSuccess}`}>{vacunasFiltradas.filter(v => v.completada).length}/{vacunasFiltradas.length}</div></div>
                    </div>
                    {vacunasFiltradas.length > 0 ? (
                      <div className={styles.cardPreview}>
                        <ProgressBar now={calcularSaludVacunas()} className={styles.progressBar} variant="success" />
                        <div className="d-flex justify-content-between mt-2 small"><span>{calcularSaludVacunas()}% completado</span>{vacunasPendientes.length > 0 && <Badge bg="warning" text="dark">{vacunasPendientes.length} pend.</Badge>}</div>
                      </div>
                    ) : <div className="text-center py-2 text-muted small">Sin vacunas registradas</div>}
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={() => { setEditandoContactoId(null); setContactoEdit(null); setShowModalContacto(true); }}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                      <div className={`${styles.iconCircle} ${styles.bgInfoLight}`}><Users size={22} className={styles.textInfo} /></div>
                      <div><div className={styles.cardLabel}>Contactos</div><div className={`${styles.cardValue} ${styles.textInfo}`}>{contactosFiltradosPorMascota.length}</div></div>
                    </div>
                    <div className={styles.cardPreview}>
                      <div className="d-flex justify-content-between mb-1 small"><span>⭐ Favoritos</span><Badge bg="light" text="dark">{contactosFiltradosPorMascota.filter(c => c.favorito).length}</Badge></div>
                      <div className="d-flex flex-wrap gap-1">{["veterinario", "peluqueria", "paseador", "petshop"].map(tipo => { const cantidad = contactosFiltradosPorMascota.filter(c => c.tipo === tipo).length; if (cantidad === 0) return null; return <Badge key={tipo} bg="light" text="dark" className="small">{getIconoTipo(tipo)} {cantidad}</Badge>; })}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={() => setTabActivo("amigosSP")}>
                  <Card.Body className="p-3 p-md-4">
                    <div className="d-flex align-items-center gap-2 gap-md-3 mb-2 mb-md-3">
                      <div className={`${styles.iconCircle} ${styles.bgDarkLight}`}><Heart size={22} className={styles.textDark} /></div>
                      <div><div className={styles.cardLabel}>Amigos SP</div><div className={`${styles.cardValue} ${styles.textDark}`}>{socios.length}</div></div>
                    </div>
                    <div className={styles.cardPreview}><div className="d-flex align-items-center gap-1"><Star size={12} className="text-warning" /><strong>Socios colaboradores</strong></div><div className="text-muted small mt-1">Veterinarias, pet shops, paseadores...</div></div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* TAB CONTACTOS */}
          <Tab eventKey="contactos" title={<><Users size={14} className="me-1" /> Contactos ({contactosFiltradosPorMascota.length})</>}>
            <Row className="mb-3 g-2">
              <Col xs={12} sm={6} md={5} lg={6}>
                <div className={styles.searchWrapper}><Search size={16} className={styles.searchIcon} /><input type="text" className={`form-control ${styles.searchInput}`} placeholder="Buscar contactos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
              </Col>
              <Col xs={8} sm={4} md={4} lg={4}>
                <select className={`form-select ${styles.filterSelect}`} value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                  <option value="todos">Todos</option><option value="veterinario">Veterinarios</option><option value="peluqueria">Peluquerías</option><option value="paseador">Paseadores</option><option value="petshop">Pet Shops</option><option value="guarderia">Guarderías</option><option value="otro">Otros</option>
                </select>
              </Col>
              <Col xs={4} sm={2} md={3} lg={2}>
                <Button className={styles.newButton} onClick={() => { setEditandoContactoId(null); setContactoEdit(null); setShowModalContacto(true); }}><Plus size={16} /> <span className="d-none d-sm-inline">Nuevo</span></Button>
              </Col>
            </Row>
            <Row className="g-2 g-md-3">
              {contactosFiltradosPorMascota.map(contacto => (
                <Col xs={12} md={6} lg={4} key={contacto.id}>
                  <TarjetaContacto contacto={contacto} onToggleFavorito={toggleFavorito} onEditar={(c) => { setEditandoContactoId(c.id); setContactoEdit(c); setShowModalContacto(true); }} onEliminar={eliminarContacto} onWhatsApp={enviarWhatsApp} renderTipo={renderTipo} getIconoTipo={getIconoTipo} mostrarMascota={mascotaSeleccionadaId === "todas"} />
                </Col>
              ))}
            </Row>
          </Tab>

          {/* TAB CITAS - breve (puedes expandir según necesidad) */}
          <Tab eventKey="citas" title={<><Calendar size={14} className="me-1" /> Citas ({citasFiltradas.length})</>}>
            <div className={styles.citasHeader}><div><h5 className={styles.citasTitle}>Agenda de citas</h5><p className={styles.citasSubtitle}>Organizá controles, peluquería, vacunación y seguimientos.</p></div><Button className={styles.newButton} onClick={() => { setEditandoCitaId(null); setCitaEdit(null); setShowModalCita(true); }}><Plus size={16} /> Nueva Cita</Button></div>
            {/* Aquí puedes poner el listado de citas (código existente) */}
            <Alert variant="info">Sección de citas en desarrollo.</Alert>
          </Tab>

          {/* TAB VACUNAS */}
          <Tab eventKey="vacunas" title={<><Syringe size={14} className="me-1" /> Vacunas ({vacunasFiltradas.length})</>}>
            <Alert variant="info">Sección de vacunas en desarrollo.</Alert>
          </Tab>

          {/* TAB AMIGOS SP - CON DATOS REALES DE LA API */}
          <Tab eventKey="amigosSP" title={<><Heart size={14} className="me-1" /> Amigos SP ({socios.length})</>}>
            <div className="mb-3">
              <h5 className="mb-1">Socios Protectores</h5>
              <p className="text-muted small">Comercios y profesionales aliados que cuidan a tu mascota</p>
            </div>

            {cargandoSocios ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <div className="mt-2">Cargando socios...</div>
              </div>
            ) : socios.length === 0 ? (
              <Alert variant="info" className="text-center">
                No hay socios registrados todavía.
              </Alert>
            ) : (
              <Row className="g-3">
                {socios.map((socio) => {
                  const imagenSocio =
                    socio.imagen ||
                    socio.logo ||
                    socio.foto ||
                    socio.imagen_url ||
                    socio.logo_url ||
                    "/icono.png";

                  const nombreSocio =
                    socio.nombre_local ||
                    `${socio.nombre || ""} ${socio.apellido || ""}`.trim() ||
                    "Socio protector";

                  const tipoServicio = socio.tipo_servicio || "Servicio";

                  const iconoServicio =
                    socio.tipo_servicio === "Veterinaria" ? "🏥" :
                      socio.tipo_servicio === "Paseador" ? "🦮" :
                        socio.tipo_servicio === "Petshop" ? "🏪" :
                          socio.tipo_servicio === "Peluqueria" ? "✂️" :
                            socio.tipo_servicio === "Guardería" ? "🏠" :
                              "🤝";

                  return (
                    <Col xs={12} md={6} lg={4} key={socio.id}>
                      <Card className={styles.socioCard}>
                        <div className={styles.socioMedia}>
                          <img
                            src={imagenSocio}
                            alt={nombreSocio}
                            className={styles.socioImage}
                          />

                          <div className={styles.socioMediaOverlay} />

                          <Badge className={styles.socioTypeBadge}>
                            {tipoServicio}
                          </Badge>

                          {(socio.servicio_24h === 1 || socio.emergencias == 1) && (
                            <div className={styles.socioTopBadges}>
                              {socio.servicio_24h === 1 && (
                                <span className={styles.badgeInfo}>24 hs</span>
                              )}

                              {socio.emergencias === 1 && (
                                <span className={styles.badgeDanger}>Emergencias</span>
                              )}
                            </div>
                          )}
                        </div>

                        <Card.Body className={styles.socioBody}>
                          <div className={styles.socioHeader}>
                            <div>
                              <h6 className={styles.socioName}>{nombreSocio}</h6>
                              <p className={styles.socioSubtitle}>
                                Comercio aliado SmartPet
                              </p>
                            </div>
                          </div>

                          <div className={styles.socioInfoBox}>
                            {socio.dias_atencion && (
                              <div className={styles.socioInfoRow}>
                                <span className={styles.socioInfoIcon}>📅</span>
                                <span>{socio.dias_atencion}</span>
                              </div>
                            )}

                            {socio.horarios_atencion && (
                              <div className={styles.socioInfoRow}>
                                <span className={styles.socioInfoIcon}>🕒</span>
                                <span>{socio.horarios_atencion}</span>
                              </div>
                            )}

                            {socio.direccion && (
                              <div className={styles.socioInfoRow}>
                                <span className={styles.socioInfoIcon}>📍</span>
                                <span>{socio.direccion}</span>
                              </div>
                            )}

                            {socio.whatsapp && (
                              <div className={styles.socioInfoRow}>
                                <span className={styles.socioInfoIcon}>📲</span>
                                <span>{socio.whatsapp}</span>
                              </div>
                            )}
                          </div>

                          {socio.descripcion && (
                            <p className={styles.socioDescription}>
                              {socio.descripcion}
                            </p>
                          )}

                          {socio.whatsapp && (
                            <Button
                              className={styles.socioContactBtn}
                              onClick={() =>
                                enviarWhatsApp(
                                  socio.whatsapp,
                                  socio.nombre_local || socio.nombre
                                )
                              }
                            >
                              <Heart size={16} />
                              Contactar por WhatsApp
                            </Button>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </Tab>
        </Tabs>

        {/* MODALES */}
        <ModalContacto
          show={showModalContacto}
          onHide={() => { setShowModalContacto(false); setContactoEdit(null); setEditandoContactoId(null); }}
          contactoEdit={contactoEdit}
          onSave={handleGuardarContacto}
          mascotas={mascotas}
          mascotaId={currentMascotaId}
        />

        <ModalCita
          show={showModalCita}
          onHide={() => { setShowModalCita(false); setCitaEdit(null); setEditandoCitaId(null); }}
          citaEdit={citaEdit}
          contactos={contactos}
          mascotaId={currentMascotaId}
          onSave={handleGuardarCita}
        />

        <ModalVacuna
          show={showModalVacuna}
          onHide={() => { setShowModalVacuna(false); setVacunaEdit(null); setEditandoVacunaId(null); }}
          vacunaEdit={vacunaEdit}
          onSave={handleGuardarVacuna}
          mascotas={mascotas}
          mascotaId={currentMascotaId}
        />

        <ModalHistorial
          show={showModalHistorial}
          onHide={() => { setShowModalHistorial(false); setHistorialEdit(null); setEditandoHistorialId(null); }}
          historialEdit={historialEdit}
          onSave={handleGuardarHistorial}
          mascotas={mascotas}
          mascotaId={currentMascotaId}
        />
      </Container>
    </>
  );
}

export default ContactosMascota;