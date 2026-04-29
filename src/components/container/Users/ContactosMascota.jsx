import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Form,
  Tabs,
  Tab,
  Spinner,
  Alert,
  ProgressBar
} from "react-bootstrap";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Calendar,
  Syringe,
  Users,
  Plus,
  Heart,
  Trash2,
  Edit2,
  Clock,
  Phone,
  Search,
  Star
} from "lucide-react";

import API_BASE from "../../../config/api";
import HeaderLogout from "../../Logout/Logout";
import ModalContacto from "./ContactosMascota/ModalContacto";
import ModalCita from "./ContactosMascota/ModalCita";
import ModalVacuna from "./ContactosMascota/ModalVacuna";
import ModalHistorial from "./ContactosMascota/ModalHistorial";
import TarjetaContacto from "./ContactosMascota/TarjetaContacto";

import styles from "./ContactosMascota.module.css";

const API_URL = `${API_BASE}/index.php`;

const normalizarArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.contactos)) return data.contactos;
  if (Array.isArray(data?.historial)) return data.historial;
  if (Array.isArray(data?.mascotas)) return data.mascotas;
  return [];
};

const normalizarMascotasVinculadas = (data) => {
  const items = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  const mascotasMap = new Map();

  items.forEach((item) => {
    const mascota = item.mascota || item;

    const mascotaId =
      mascota.id ||
      mascota.id_mascota ||
      mascota.mascota_id ||
      item.id_mascota ||
      item.mascota_id;

    if (!mascotaId) return;

    mascotasMap.set(String(mascotaId), {
      ...mascota,
      id: mascotaId,
      id_mascota: mascotaId,
      mascota_id: mascotaId,
      codigo_id: item.codigo_id || mascota.codigo_id || "",
      usuario_codigo_id: item.usuario_codigo_id || item.id || "",
      codigo_unico: item.codigo_unico || mascota.codigo_unico || "",
      nombre: mascota.nombre || item.nombre_mascota || `Mascota #${mascotaId}`,
      urlImg: mascota.urlImg || item.urlImg || "",
      fecha_nacimiento: mascota.fecha_nacimiento || "",
      sexo: mascota.sexo || ""
    });
  });

  return Array.from(mascotasMap.values());
};

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const formatDate = (dateStr) => {
  if (!dateStr) return "Sin fecha";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

export default function ContactosMascota() {
  const { mascotaId: mascotaIdParam } = useParams();
  const userId = localStorage.getItem("userId");

  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionadaId, setMascotaSeleccionadaId] = useState(
    mascotaIdParam || "todas"
  );

  const [contactos, setContactos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [vacunas, setVacunas] = useState([]);
  const [socios, setSocios] = useState([]);

  const [loading, setLoading] = useState(true);
  const [cargandoSocios, setCargandoSocios] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    window.clearTimeout(showSuccess.timer);
    showSuccess.timer = window.setTimeout(() => setSuccessMsg(""), 2800);
  };

  const clearEditingStates = () => {
    setEditandoContactoId(null);
    setEditandoCitaId(null);
    setEditandoHistorialId(null);
    setEditandoVacunaId(null);
    setContactoEdit(null);
    setCitaEdit(null);
    setHistorialEdit(null);
    setVacunaEdit(null);
  };

  const currentMascotaId = useMemo(() => {
    if (mascotaSeleccionadaId !== "todas") return mascotaSeleccionadaId;
    if (mascotaIdParam) return mascotaIdParam;
    return mascotas[0]?.id ? String(mascotas[0].id) : "";
  }, [mascotaSeleccionadaId, mascotaIdParam, mascotas]);

  const mascotaActual = useMemo(() => {
    if (!currentMascotaId) return null;

    return (
      mascotas.find((m) => String(m.id) === String(currentMascotaId)) ||
      null
    );
  }, [mascotas, currentMascotaId]);

  const cargarSocios = useCallback(async () => {
    setCargandoSocios(true);

    try {
      const res = await axios.get(`${API_URL}/socios`);
      setSocios(normalizarArray(res.data));
    } catch (err) {
      console.error("Error al cargar socios:", err);
      setSocios([]);
    } finally {
      setCargandoSocios(false);
    }
  }, []);

  const cargarTodosLosDatos = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setError("No se encontró el usuario autenticado.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resVinculadas = await axios.get(`${API_URL}/user-codes`, {
        params: {
          usuario_id: userId
        }
      });

      const mascotasData = normalizarMascotasVinculadas(resVinculadas.data);
      setMascotas(mascotasData);

      if (mascotasData.length === 0) {
        setContactos([]);
        setHistorial([]);
        setVacunas([]);
        setMascotaSeleccionadaId("todas");
        setLoading(false);
        return;
      }

      const mascotaParamValida =
        mascotaIdParam &&
        mascotasData.some((m) => String(m.id) === String(mascotaIdParam));

      const seleccionActualValida =
        mascotaSeleccionadaId === "todas" ||
        mascotasData.some(
          (m) => String(m.id) === String(mascotaSeleccionadaId)
        );

      if (mascotaParamValida) {
        setMascotaSeleccionadaId(String(mascotaIdParam));
      } else if (!seleccionActualValida) {
        setMascotaSeleccionadaId("todas");
      }

      const promesasContactos = mascotasData.map((m) =>
        axios
          .get(`${API_URL}/contactos-mascota`, {
            params: {
              mascota_id: m.id
            }
          })
          .catch(() => ({ data: [] }))
      );

      const promesasHistorial = mascotasData.map((m) =>
        axios
          .get(`${API_URL}/historial-mascota`, {
            params: {
              mascota_id: m.id
            }
          })
          .catch(() => ({ data: [] }))
      );

      const [resultadosContactos, resultadosHistorial] = await Promise.all([
        Promise.all(promesasContactos),
        Promise.all(promesasHistorial)
      ]);

      const todosContactos = [];
      const todoHistorial = [];

      mascotasData.forEach((m, idx) => {
        const contactosMascota = normalizarArray(resultadosContactos[idx].data);
        const historialMascota = normalizarArray(resultadosHistorial[idx].data);

        contactosMascota.forEach((c) => {
          todosContactos.push({
            ...c,
            mascota_id: c.mascota_id || c.id_mascota || m.id,
            id_mascota: c.id_mascota || c.mascota_id || m.id,
            mascotaId: c.mascota_id || c.id_mascota || m.id,
            nombreMascota: m.nombre
          });
        });

        historialMascota.forEach((h) => {
          todoHistorial.push({
            ...h,
            mascota_id: h.mascota_id || h.id_mascota || m.id,
            id_mascota: h.id_mascota || h.mascota_id || m.id,
            mascotaId: h.mascota_id || h.id_mascota || m.id,
            nombreMascota: m.nombre
          });
        });
      });

      setContactos(todosContactos);
      setHistorial(todoHistorial);
      setVacunas(todoHistorial.filter((item) => item.tipo_evento === "vacuna"));
    } catch (err) {
      console.error(err);
      setMascotas([]);
      setContactos([]);
      setHistorial([]);
      setVacunas([]);
      setError("No se pudieron cargar las mascotas vinculadas a tu usuario.");
    } finally {
      setLoading(false);
    }
  }, [userId, mascotaSeleccionadaId, mascotaIdParam]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    cargarTodosLosDatos();
    cargarSocios();

    return () => {
      window.clearTimeout(showSuccess.timer);
    };
  }, [userId, cargarTodosLosDatos, cargarSocios]);

  const normalizarFecha = (fecha) => {
    const d = new Date(fecha);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const getItemMascotaId = (item) =>
    item?.mascotaId ||
    item?.mascota_id ||
    item?.id_mascota ||
    item?.mascota_id_fk;

  const filtrarPorMascota = (data, mascotaId) => {
    if (mascotaId === "todas") return data;

    return data.filter(
      (item) => String(getItemMascotaId(item)) === String(mascotaId)
    );
  };

  const contactosFiltradosPorMascota = useMemo(() => {
    let resultado = filtrarPorMascota(contactos, mascotaSeleccionadaId);
    const term = searchTerm.trim().toLowerCase();

    if (filtroTipo !== "todos") {
      resultado = resultado.filter((c) => c.tipo === filtroTipo);
    }

    if (term) {
      resultado = resultado.filter((c) => {
        const texto = [
          c.nombre,
          c.apellido,
          c.celular,
          c.email,
          c.direccion,
          c.nombreMascota,
          c.categoria_personalizada
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return texto.includes(term);
      });
    }

    return resultado.sort((a, b) => {
      if (a.favorito && !b.favorito) return -1;
      if (!a.favorito && b.favorito) return 1;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });
  }, [contactos, mascotaSeleccionadaId, filtroTipo, searchTerm]);

  const citas = useMemo(() => {
    return historial
      .filter((item) => item.tipo_evento === "cita" || item.tipo_evento === "turno")
      .sort(
        (a, b) =>
          new Date(a.fecha_evento || 0) - new Date(b.fecha_evento || 0)
      );
  }, [historial]);

  const vacunasFiltradas = useMemo(() => {
    return filtrarPorMascota(vacunas, mascotaSeleccionadaId);
  }, [vacunas, mascotaSeleccionadaId]);

  const bitacora = useMemo(() => {
    return historial
      .filter((item) => item.tipo_evento === "historial")
      .sort(
        (a, b) =>
          new Date(b.fecha_evento || 0) - new Date(a.fecha_evento || 0)
      );
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

    return citasFiltradas.filter(
      (c) => c.fecha_evento && normalizarFecha(c.fecha_evento) >= hoy
    );
  }, [citasFiltradas]);

  const vacunasPendientes = useMemo(() => {
    return vacunasFiltradas.filter((v) => !v.completada);
  }, [vacunasFiltradas]);

  const calcularSaludVacunas = () => {
    if (vacunasFiltradas.length === 0) return 0;

    const completadas = vacunasFiltradas.filter((v) => v.completada).length;
    return Math.round((completadas / vacunasFiltradas.length) * 100);
  };

  const renderTipo = (contacto) => {
    if (contacto.tipo === "otro") return contacto.categoria_personalizada || "Otro";

    const tipos = {
      veterinario: "Veterinario",
      peluqueria: "Peluquería",
      paseador: "Paseador",
      petshop: "Pet Shop",
      guarderia: "Guardería"
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
      otro: "📌"
    };

    return mapa[tipo] || "📋";
  };

  const enviarWhatsApp = (celular, nombre) => {
    if (!celular) return;

    let numero = celular.replace(/\D/g, "");

    if (numero.length === 10) numero = `54${numero}`;

    window.open(
      `https://wa.me/${numero}?text=Hola%20${encodeURIComponent(nombre || "")}`,
      "_blank"
    );
  };

  const payloadConMascota = (data) => {
    const mascotaIdFinal =
      data.mascota_id ||
      data.id_mascota ||
      data.mascotaId ||
      currentMascotaId;

    return {
      ...data,
      mascota_id: toNumberOrNull(mascotaIdFinal),
      id_mascota: toNumberOrNull(mascotaIdFinal)
    };
  };

  const handleGuardarContacto = async (formData) => {
    try {
      const payload = payloadConMascota(formData);

      if (!payload.mascota_id) {
        setError("Seleccioná una mascota para guardar el contacto.");
        return false;
      }

      if (editandoContactoId) {
        await axios.put(`${API_URL}/contactos-mascota/${editandoContactoId}`, payload);
        showSuccess("Contacto actualizado correctamente.");
      } else {
        await axios.post(`${API_URL}/contactos-mascota`, payload);
        showSuccess("Contacto creado correctamente.");
      }

      await cargarTodosLosDatos();
      clearEditingStates();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar contacto.");
      return false;
    }
  };

  const handleGuardarCita = async (data) => {
    try {
      const payload = {
        ...payloadConMascota(data),
        tipo_evento: "cita",
        recordatorio: data.recordatorio ? 1 : 0
      };

      if (!payload.mascota_id) {
        setError("Seleccioná una mascota para guardar la cita.");
        return false;
      }

      if (editandoCitaId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoCitaId}`, payload);
        showSuccess("Cita actualizada correctamente.");
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
        showSuccess("Cita creada correctamente.");
      }

      await cargarTodosLosDatos();
      clearEditingStates();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar cita.");
      return false;
    }
  };

  const handleGuardarVacuna = async (data) => {
    try {
      const payload = {
        ...payloadConMascota(data),
        tipo_evento: "vacuna",
        completada: data.completada ? 1 : 0
      };

      if (!payload.mascota_id) {
        setError("Seleccioná una mascota para guardar la vacuna.");
        return false;
      }

      if (editandoVacunaId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoVacunaId}`, payload);
        showSuccess("Vacuna actualizada correctamente.");
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
        showSuccess("Vacuna creada correctamente.");
      }

      await cargarTodosLosDatos();
      clearEditingStates();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar vacuna.");
      return false;
    }
  };

  const handleGuardarHistorial = async (data) => {
    try {
      const payload = {
        ...payloadConMascota(data),
        tipo_evento: "historial"
      };

      if (!payload.mascota_id) {
        setError("Seleccioná una mascota para guardar el registro.");
        return false;
      }

      if (editandoHistorialId) {
        await axios.put(`${API_URL}/historial-mascota/${editandoHistorialId}`, payload);
        showSuccess("Registro actualizado correctamente.");
      } else {
        await axios.post(`${API_URL}/historial-mascota`, payload);
        showSuccess("Registro creado correctamente.");
      }

      await cargarTodosLosDatos();
      clearEditingStates();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar registro.");
      return false;
    }
  };

  const eliminarContacto = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;

    try {
      await axios.delete(`${API_URL}/contactos-mascota/${id}`);
      showSuccess("Contacto eliminado.");
      await cargarTodosLosDatos();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar contacto.");
    }
  };

  const eliminarHistorialItem = async (id, titulo, tipo = "registro") => {
    if (!window.confirm(`¿Eliminar ${tipo} "${titulo}"?`)) return;

    try {
      await axios.delete(`${API_URL}/historial-mascota/${id}`);
      showSuccess("Elemento eliminado.");
      await cargarTodosLosDatos();
    } catch (err) {
      console.error(err);
      setError("Error al eliminar.");
    }
  };

  const toggleFavorito = async (contacto) => {
    try {
      const payload = {
        ...contacto,
        favorito: contacto.favorito ? 0 : 1,
        mascota_id: contacto.mascota_id || contacto.id_mascota || contacto.mascotaId,
        id_mascota: contacto.id_mascota || contacto.mascota_id || contacto.mascotaId
      };

      await axios.put(`${API_URL}/contactos-mascota/${contacto.id}`, payload);
      await cargarTodosLosDatos();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar favorito.");
    }
  };

  const abrirNuevoContacto = () => {
    clearEditingStates();
    setShowModalContacto(true);
  };

  const abrirNuevaCita = () => {
    clearEditingStates();
    setShowModalCita(true);
  };

  const abrirNuevaVacuna = () => {
    clearEditingStates();
    setShowModalVacuna(true);
  };

  const abrirNuevoHistorial = () => {
    clearEditingStates();
    setShowModalHistorial(true);
  };

  const abrirEditarContacto = (contacto) => {
    setContactoEdit(contacto);
    setEditandoContactoId(contacto.id);
    setShowModalContacto(true);
  };

  const abrirEditarCita = (cita) => {
    setCitaEdit(cita);
    setEditandoCitaId(cita.id);
    setShowModalCita(true);
  };

  const abrirEditarVacuna = (vacuna) => {
    setVacunaEdit(vacuna);
    setEditandoVacunaId(vacuna.id);
    setShowModalVacuna(true);
  };

  const abrirEditarHistorial = (registro) => {
    setHistorialEdit(registro);
    setEditandoHistorialId(registro.id);
    setShowModalHistorial(true);
  };

  if (loading) {
    return (
      <>
        <HeaderLogout />
        <Container className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-3">Cargando tu agenda...</div>
        </Container>
      </>
    );
  }

  return (
    <>
      <HeaderLogout />

      <Container fluid className={styles.container}>
        <Row className="mb-3">
          <Col>
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <h2>
                  <FileText size={24} className="me-1" />
                  Mi Agenda General
                </h2>
                <small>
                  Gestioná contactos, citas, vacunas y servicios por mascota.
                </small>
              </div>

              <Link
                to={`/Consultas/${userId}`}
                className={`btn btn-outline-secondary ${styles.backButton}`}
              >
                ← Volver
              </Link>
            </div>
          </Col>
        </Row>

        {error && (
          <Alert
            variant="danger"
            dismissible
            onClose={() => setError("")}
            className="rounded-4"
          >
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert variant="success" className="rounded-4">
            {successMsg}
          </Alert>
        )}

        {mascotas.length === 0 ? (
          <Card className={styles.emptyCard}>
            <Card.Body>
              <Heart size={36} />
              <h5>No tenés mascotas vinculadas</h5>
              <p>
                Para usar la agenda, primero vinculá un código desde tu panel.
              </p>

              <Link to={`/Consultas/${userId}`} className="btn btn-primary">
                Ir al panel
              </Link>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Row className="g-3 mb-4">
              <Col xs={12} lg={5}>
                <Card className={styles.selectorCard}>
                  <Card.Body>
                    <Form.Group>
                      <Form.Label className="fw-bold">🐾 Ver agenda de</Form.Label>

                      <Form.Select
                        value={mascotaSeleccionadaId}
                        onChange={(e) => setMascotaSeleccionadaId(e.target.value)}
                      >
                        <option value="todas">
                          Todas mis mascotas ({mascotas.length})
                        </option>

                        {mascotas.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.nombre}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    {mascotaSeleccionadaId === "todas" ? (
                      <div className="mt-3 small text-muted">
                        Estás viendo la agenda de todas tus mascotas vinculadas.
                      </div>
                    ) : mascotaActual ? (
                      <div className="mt-3 small text-muted">
                        Estás creando actividades para{" "}
                        <strong>{mascotaActual.nombre}</strong>.
                      </div>
                    ) : null}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} lg={7}>
                <div className={styles.quickActions}>
                  <Button onClick={abrirNuevaCita}>
                    <Calendar size={16} />
                    Nueva cita
                  </Button>

                  <Button onClick={abrirNuevaVacuna}>
                    <Syringe size={16} />
                    Nueva vacuna
                  </Button>

                  <Button onClick={abrirNuevoContacto}>
                    <Users size={16} />
                    Nuevo contacto
                  </Button>

                  <Button onClick={abrirNuevoHistorial}>
                    <FileText size={16} />
                    Nuevo registro
                  </Button>
                </div>
              </Col>
            </Row>

            <Row className="g-3 mb-4">
              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={abrirNuevaCita}>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`${styles.iconCircle} ${styles.bgPrimaryLight}`}>
                        <Calendar size={22} />
                      </div>

                      <div>
                        <div className={styles.cardLabel}>Próximas citas</div>
                        <div className={styles.cardValue}>{citasProximas.length}</div>
                      </div>
                    </div>

                    {citasProximas[0] ? (
                      <div className={styles.cardPreview}>
                        <strong>{citasProximas[0].titulo}</strong>
                        <div>{formatDate(citasProximas[0].fecha_evento)}</div>
                        <div className="small text-muted">
                          🐾 {citasProximas[0].nombreMascota}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted small mt-3">
                        Sin citas programadas
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={abrirNuevaVacuna}>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`${styles.iconCircle} ${styles.bgSuccessLight}`}>
                        <Syringe size={22} />
                      </div>

                      <div>
                        <div className={styles.cardLabel}>Vacunas</div>

                        <div className={styles.cardValue}>
                          {vacunasFiltradas.filter((v) => v.completada).length}/
                          {vacunasFiltradas.length}
                        </div>
                      </div>
                    </div>

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
                            {vacunasPendientes.length} pendientes
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={abrirNuevoContacto}>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`${styles.iconCircle} ${styles.bgInfoLight}`}>
                        <Users size={22} />
                      </div>

                      <div>
                        <div className={styles.cardLabel}>Contactos</div>
                        <div className={styles.cardValue}>
                          {contactosFiltradosPorMascota.length}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardPreview}>
                      <Star size={14} /> Favoritos:{" "}
                      <strong>
                        {contactosFiltradosPorMascota.filter((c) => c.favorito).length}
                      </strong>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xs={12} sm={6} lg={3}>
                <Card className={styles.summaryCard} onClick={abrirNuevoHistorial}>
                  <Card.Body>
                    <div className="d-flex align-items-center gap-3">
                      <div className={`${styles.iconCircle} ${styles.bgDarkLight}`}>
                        <FileText size={22} />
                      </div>

                      <div>
                        <div className={styles.cardLabel}>Bitácora</div>
                        <div className={styles.cardValue}>{bitacoraFiltrada.length}</div>
                      </div>
                    </div>

                    <div className={styles.cardPreview}>
                      {bitacoraFiltrada[0] ? (
                        <>
                          <Clock size={14} /> Último:{" "}
                          {formatDate(bitacoraFiltrada[0].fecha_evento)}
                        </>
                      ) : (
                        "Sin registros"
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Tabs
              activeKey={tabActivo}
              onSelect={(key) => setTabActivo(key || "resumen")}
              className="mb-3"
            >
              <Tab eventKey="resumen" title="Resumen">
                <Row className="g-3">
                  <Col xs={12} lg={6}>
                    <Card className={styles.panelCard}>
                      <Card.Header>
                        <strong>Próximas actividades</strong>
                      </Card.Header>

                      <Card.Body>
                        {citasProximas.length === 0 ? (
                          <div className="text-muted">No hay citas próximas.</div>
                        ) : (
                          citasProximas.slice(0, 6).map((cita) => (
                            <div key={cita.id} className={styles.listItem}>
                              <div>
                                <strong>{cita.titulo}</strong>

                                <div className="small text-muted">
                                  {formatDate(cita.fecha_evento)} · 🐾{" "}
                                  {cita.nombreMascota}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => abrirEditarCita(cita)}
                              >
                                Editar
                              </Button>
                            </div>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  </Col>

                  <Col xs={12} lg={6}>
                    <Card className={styles.panelCard}>
                      <Card.Header>
                        <strong>Vacunas pendientes</strong>
                      </Card.Header>

                      <Card.Body>
                        {vacunasPendientes.length === 0 ? (
                          <div className="text-muted">No hay vacunas pendientes.</div>
                        ) : (
                          vacunasPendientes.slice(0, 6).map((vacuna) => (
                            <div key={vacuna.id} className={styles.listItem}>
                              <div>
                                <strong>{vacuna.titulo}</strong>

                                <div className="small text-muted">
                                  {formatDate(vacuna.proxima_fecha || vacuna.fecha_evento)} ·
                                  🐾 {vacuna.nombreMascota}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => abrirEditarVacuna(vacuna)}
                              >
                                Editar
                              </Button>
                            </div>
                          ))
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab>

              <Tab
                eventKey="contactos"
                title={`Contactos (${contactosFiltradosPorMascota.length})`}
              >
                <Row className="g-3 mb-3">
                  <Col xs={12} md={7}>
                    <div className={styles.searchBox}>
                      <Search size={16} />

                      <Form.Control
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar contacto, teléfono, email o mascota..."
                      />
                    </div>
                  </Col>

                  <Col xs={12} md={5}>
                    <Form.Select
                      value={filtroTipo}
                      onChange={(e) => setFiltroTipo(e.target.value)}
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="veterinario">Veterinario</option>
                      <option value="peluqueria">Peluquería</option>
                      <option value="paseador">Paseador</option>
                      <option value="petshop">Pet Shop</option>
                      <option value="guarderia">Guardería</option>
                      <option value="otro">Otro</option>
                    </Form.Select>
                  </Col>
                </Row>

                <Row className="g-3">
                  {contactosFiltradosPorMascota.length === 0 ? (
                    <Col xs={12}>
                      <Card className={styles.emptyCard}>
                        <Card.Body>
                          <Users size={34} />

                          <h5>No hay contactos</h5>

                          <p>
                            Agregá veterinarios, peluquerías o paseadores para esta mascota.
                          </p>

                          <Button onClick={abrirNuevoContacto}>
                            <Plus size={16} /> Crear contacto
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ) : (
                    contactosFiltradosPorMascota.map((contacto) => (
                      <Col key={contacto.id} xs={12} md={6} xl={4}>
                        <TarjetaContacto
                          contacto={contacto}
                          onToggleFavorito={toggleFavorito}
                          onEditar={abrirEditarContacto}
                          onEliminar={eliminarContacto}
                          onWhatsApp={enviarWhatsApp}
                          renderTipo={renderTipo}
                          getIconoTipo={getIconoTipo}
                        />
                      </Col>
                    ))
                  )}
                </Row>
              </Tab>

              <Tab eventKey="citas" title={`Citas (${citasFiltradas.length})`}>
                <Card className={styles.panelCard}>
                  <Card.Body>
                    {citasFiltradas.length === 0 ? (
                      <div className={styles.emptyInline}>
                        <Calendar size={32} />

                        <p>No hay citas registradas.</p>

                        <Button onClick={abrirNuevaCita}>Crear cita</Button>
                      </div>
                    ) : (
                      citasFiltradas.map((cita) => (
                        <div key={cita.id} className={styles.listItem}>
                          <div>
                            <strong>{cita.titulo}</strong>

                            <div className="small text-muted">
                              {formatDate(cita.fecha_evento)} · 🐾 {cita.nombreMascota}
                            </div>

                            {cita.nota && <div className="small mt-1">{cita.nota}</div>}
                          </div>

                          <div className={styles.itemActions}>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => abrirEditarCita(cita)}
                            >
                              <Edit2 size={14} /> Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                eliminarHistorialItem(cita.id, cita.titulo, "cita")
                              }
                            >
                              <Trash2 size={14} /> Eliminar
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="vacunas" title={`Vacunas (${vacunasFiltradas.length})`}>
                <Card className={styles.panelCard}>
                  <Card.Body>
                    {vacunasFiltradas.length === 0 ? (
                      <div className={styles.emptyInline}>
                        <Syringe size={32} />

                        <p>No hay vacunas registradas.</p>

                        <Button onClick={abrirNuevaVacuna}>Crear vacuna</Button>
                      </div>
                    ) : (
                      vacunasFiltradas.map((vacuna) => (
                        <div key={vacuna.id} className={styles.listItem}>
                          <div>
                            <strong>{vacuna.titulo}</strong>{" "}

                            {vacuna.completada ? (
                              <Badge bg="success">Aplicada</Badge>
                            ) : (
                              <Badge bg="warning" text="dark">
                                Pendiente
                              </Badge>
                            )}

                            <div className="small text-muted">
                              {formatDate(vacuna.fecha_evento)} · 🐾 {vacuna.nombreMascota}
                            </div>

                            {vacuna.proxima_fecha && (
                              <div className="small text-muted">
                                Próxima dosis: {formatDate(vacuna.proxima_fecha)}
                              </div>
                            )}
                          </div>

                          <div className={styles.itemActions}>
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => abrirEditarVacuna(vacuna)}
                            >
                              <Edit2 size={14} /> Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                eliminarHistorialItem(vacuna.id, vacuna.titulo, "vacuna")
                              }
                            >
                              <Trash2 size={14} /> Eliminar
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="bitacora" title={`Bitácora (${bitacoraFiltrada.length})`}>
                <Card className={styles.panelCard}>
                  <Card.Body>
                    {bitacoraFiltrada.length === 0 ? (
                      <div className={styles.emptyInline}>
                        <FileText size={32} />

                        <p>No hay registros en bitácora.</p>

                        <Button onClick={abrirNuevoHistorial}>Crear registro</Button>
                      </div>
                    ) : (
                      bitacoraFiltrada.map((registro) => (
                        <div key={registro.id} className={styles.listItem}>
                          <div>
                            <strong>{registro.titulo}</strong>

                            <div className="small text-muted">
                              {formatDate(registro.fecha_evento)} · 🐾 {registro.nombreMascota}
                            </div>

                            {registro.nota && (
                              <div className="small mt-1">{registro.nota}</div>
                            )}
                          </div>

                          <div className={styles.itemActions}>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => abrirEditarHistorial(registro)}
                            >
                              <Edit2 size={14} /> Editar
                            </Button>

                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() =>
                                eliminarHistorialItem(registro.id, registro.titulo, "registro")
                              }
                            >
                              <Trash2 size={14} /> Eliminar
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>
              </Tab>

              <Tab eventKey="socios" title={`Amigos SP (${socios.length})`}>
                {cargandoSocios ? (
                  <div className="py-4 text-center">
                    <Spinner animation="border" />
                  </div>
                ) : socios.length === 0 ? (
                  <Card className={styles.emptyCard}>
                    <Card.Body>
                      <Heart size={34} />

                      <h5>No hay socios cargados</h5>

                      <p>
                        Próximamente verás proveedores recomendados para tus mascotas.
                      </p>
                    </Card.Body>
                  </Card>
                ) : (
                  <Row className="g-3">
                    {socios.map((socio) => (
                      <Col key={socio.id} xs={12} md={6} xl={4}>
                        <Card className={styles.socioCard}>
                          <Card.Body>
                            <h5>{socio.nombre_local || socio.nombre}</h5>

                            {socio.rubro && (
                              <Badge bg="light" text="dark">
                                {socio.rubro}
                              </Badge>
                            )}

                            {socio.direccion && (
                              <p className="mt-2">📍 {socio.direccion}</p>
                            )}

                            {socio.whatsapp && (
                              <Button
                                className="w-100"
                                onClick={() =>
                                  enviarWhatsApp(
                                    socio.whatsapp,
                                    socio.nombre_local || socio.nombre
                                  )
                                }
                              >
                                <Phone size={16} /> Contactar
                              </Button>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </Tab>
            </Tabs>
          </>
        )}

        <ModalContacto
          show={showModalContacto}
          onHide={() => {
            setShowModalContacto(false);
            setContactoEdit(null);
            setEditandoContactoId(null);
          }}
          contactoEdit={contactoEdit}
          onSave={handleGuardarContacto}
          mascotas={mascotas}
          mascotaId={currentMascotaId}
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
          mascotas={mascotas}
          mascotaId={currentMascotaId}
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
          mascotas={mascotas}
          mascotaId={currentMascotaId}
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
          mascotas={mascotas}
          mascotaId={currentMascotaId}
          onSave={handleGuardarHistorial}
        />
      </Container>
    </>
  );
}