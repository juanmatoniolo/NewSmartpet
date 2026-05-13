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
  Calendar,
  Syringe,
  Users,
  Plus,
  Heart,
  Trash2,
  Edit2,
  Phone,
  Search,
  Star,
  MapPin,
  Clock,
  ExternalLink
} from "lucide-react";

import API_BASE from "../../../config/api";
import HeaderLogout from "../../Logout/Logout";
import ModalContacto from "./ContactosMascota/ModalContacto";
import ModalCita from "./ContactosMascota/ModalCita";
import ModalVacuna from "./ContactosMascota/ModalVacuna";
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
  if (Array.isArray(data?.socios)) return data.socios;
  return [];
};

const toNumberOrNull = (value) => {
  if (value === "" || value === null || value === undefined) return null;

  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

const isComplete = (value) => {
  return value === true || value === 1 || value === "1";
};

// Reemplazá la función formatDate por esta:
const formatDate = (dateStr) => {
  if (!dateStr) return "Sin fecha";
  const [year, month, day] = String(dateStr).split("T")[0].split("-");
  if (!year || !month || !day) return "Sin fecha";
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const normalizarMascotaDesdeCodigo = (item) => {
  const mascota = item.mascota || item.mascota_data || item.pet || item;

  const mascotaId =
    mascota.id ||
    mascota.id_mascota ||
    mascota.mascota_id ||
    item.id_mascota ||
    item.mascota_id;

  if (!mascotaId) return null;

  return {
    ...mascota,
    id: mascotaId,
    id_mascota: mascotaId,
    mascota_id: mascotaId,
    codigo_id: item.codigo_id || mascota.codigo_id || "",
    usuario_codigo_id: item.usuario_codigo_id || item.id || "",
    codigo_unico: item.codigo_unico || mascota.codigo_unico || "",
    nombre:
      mascota.nombre ||
      item.nombre_mascota ||
      item.nombre ||
      `Mascota #${mascotaId}`,
    urlImg: mascota.urlImg || item.urlImg || item.imagen || "",
    fecha_nacimiento:
      mascota.fecha_nacimiento || item.fecha_nacimiento || "",
    sexo: mascota.sexo || item.sexo || ""
  };
};

const normalizarSocio = (socio) => ({
  ...socio,
  id:
    socio.id ||
    socio.socio_id ||
    `${socio.nombre_local || socio.nombre || "socio"}-${socio.whatsapp || socio.telefono || ""}`,
  nombre:
    socio.nombre_local ||
    socio.nombre_comercial ||
    socio.razon_social ||
    `${socio.nombre || ""} ${socio.apellido || ""}`.trim() ||
    "Amigo SP",
  rubro: socio.rubro || socio.tipo_servicio || socio.tipo || socio.categoria || "Servicio",
  direccion: socio.direccion || socio.localidad || "",
  telefono: socio.whatsapp || socio.telefono || socio.celular || "",
  email: socio.email || "",
  descripcion: socio.descripcion || socio.detalle || socio.observaciones || "",
  imagen:
    socio.imagen ||
    socio.logo ||
    socio.foto ||
    socio.urlImg ||
    socio.imagen_url ||
    socio.logo_url ||
    "",
  horarios: socio.horarios || socio.horarios_atencion || "",
  dias_atencion: socio.dias_atencion || "",
  web: socio.web || socio.website || socio.instagram || socio.url || ""
});

export default function ContactosMascota() {
  const { mascotaId: mascotaIdParam } = useParams();
  const userId = localStorage.getItem("userId");

  const [mascotas, setMascotas] = useState([]);
  const [mascotaSeleccionadaId, setMascotaSeleccionadaId] = useState(
    mascotaIdParam || "todas"
  );
  const recargarContactos = useCallback(async (mascotasData) => {
    const res = await axios.get(`${API_URL}/contactos-mascota`, {
      params: { usuario_id: userId }
    }).catch(() => ({ data: [] }));

    const lista = normalizarArray(res.data).map((c) => ({
      ...c,
      mascota_id: c.mascota_id || c.id_mascota,
      id_mascota: c.id_mascota || c.mascota_id,
      mascotaId: c.mascota_id || c.id_mascota,
      nombreMascota: mascotasData.find(
        (m) => String(m.id) === String(c.id_mascota || c.mascota_id)
      )?.nombre || ""
    }));
    setContactos(lista);
  }, [userId]);

  const recargarHistorial = useCallback(async (mascotasData) => {
    const promesas = mascotasData.map((m) =>
      axios.get(`${API_URL}/historial-mascota`, {
        params: { mascota_id: m.id }
      }).catch(() => ({ data: [] }))
    );
    const resultados = await Promise.all(promesas);
    const lista = [];
    mascotasData.forEach((m, idx) => {
      normalizarArray(resultados[idx].data).forEach((h) => {
        lista.push({
          ...h,
          mascota_id: h.mascota_id || h.id_mascota || m.id,
          id_mascota: h.id_mascota || h.mascota_id || m.id,
          mascotaId: h.mascota_id || h.id_mascota || m.id,
          nombreMascota: m.nombre
        });
      });
    });
    setHistorial(lista);
    setVacunas(lista.filter((item) => item.tipo_evento === "vacuna"));
  }, []);


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
  const [showModalVacuna, setShowModalVacuna] = useState(false);

  const [editandoContactoId, setEditandoContactoId] = useState(null);
  const [editandoCitaId, setEditandoCitaId] = useState(null);
  const [editandoVacunaId, setEditandoVacunaId] = useState(null);

  const [contactoEdit, setContactoEdit] = useState(null);
  const [citaEdit, setCitaEdit] = useState(null);
  const [vacunaEdit, setVacunaEdit] = useState(null);

  const [mascotaIdParaContacto, setMascotaIdParaContacto] = useState("");
  const [volverACitaDespuesContacto, setVolverACitaDespuesContacto] = useState(false);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    window.clearTimeout(showSuccess.timer);
    showSuccess.timer = window.setTimeout(() => setSuccessMsg(""), 2800);
  };

  const clearEditingStates = () => {
    setEditandoContactoId(null);
    setEditandoCitaId(null);
    setEditandoVacunaId(null);
    setContactoEdit(null);
    setCitaEdit(null);
    setVacunaEdit(null);
  };

  const getItemMascotaId = (item) =>
    item?.mascotaId ||
    item?.mascota_id ||
    item?.id_mascota ||
    item?.mascota_id_fk;

  const filtrarPorMascota = useCallback((data, mascotaId) => {
    if (mascotaId === "todas") return data;

    return data.filter(
      (item) => String(getItemMascotaId(item)) === String(mascotaId)
    );
  }, []);

  const currentMascotaId = useMemo(() => {
    if (mascotaSeleccionadaId !== "todas") return mascotaSeleccionadaId;
    return mascotas[0]?.id ? String(mascotas[0].id) : "";
  }, [mascotaSeleccionadaId, mascotas]);

  const mascotaIdParaModal = useMemo(() => {
    return mascotaSeleccionadaId !== "todas" ? mascotaSeleccionadaId : "";
  }, [mascotaSeleccionadaId]);

  const mascotaActual = useMemo(() => {
    if (!currentMascotaId) return null;

    return (
      mascotas.find((m) => String(m.id) === String(currentMascotaId)) ||
      null
    );
  }, [mascotas, currentMascotaId]);

  const cargarMascotaPorCodigo = useCallback(
    async (codigoItem) => {
      if (codigoItem.mascota) {
        return normalizarMascotaDesdeCodigo(codigoItem);
      }

      if (!codigoItem.codigo_id) return null;

      try {
        const resMascota = await axios.get(`${API_URL}/mascotas`, {
          params: {
            codigo_id: codigoItem.codigo_id,
            usuario_id: userId
          }
        });

        const data = resMascota.data;

        let mascota = null;

        if (Array.isArray(data)) {
          mascota = data[0] || null;
        } else if (Array.isArray(data?.data)) {
          mascota = data.data[0] || null;
        } else if (data && typeof data === "object" && data.id) {
          mascota = data;
        }

        if (!mascota) return null;

        return normalizarMascotaDesdeCodigo({
          ...codigoItem,
          mascota
        });
      } catch (err) {
        console.error("Error al cargar mascota por código:", err);
        return null;
      }
    },
    [userId]
  );

  const cargarMascotasVinculadas = useCallback(async () => {
    const resVinculadas = await axios.get(`${API_URL}/user-codes`, {
      params: {
        usuario_id: userId
      }
    });

    const codigos = normalizarArray(resVinculadas.data);

    const mascotasPorCodigo = await Promise.all(
      codigos.map((codigoItem) => cargarMascotaPorCodigo(codigoItem))
    );

    const mascotasMap = new Map();

    mascotasPorCodigo
      .filter(Boolean)
      .forEach((mascota) => {
        mascotasMap.set(String(mascota.id), mascota);
      });

    return Array.from(mascotasMap.values());
  }, [userId, cargarMascotaPorCodigo]);

  const cargarSocios = useCallback(async () => {
    setCargandoSocios(true);

    try {
      const res = await axios.get(`${API_URL}/socios`);
      const sociosData = normalizarArray(res.data).map(normalizarSocio);
      setSocios(sociosData);
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
      const mascotasData = await cargarMascotasVinculadas();
      setMascotas(mascotasData);

      if (mascotasData.length === 0) {
        setContactos([]);
        setHistorial([]);
        setVacunas([]);
        setMascotaSeleccionadaId("todas");
        return;
      }

      setMascotaSeleccionadaId((prev) => {
        if (
          mascotaIdParam &&
          mascotasData.some((m) => String(m.id) === String(mascotaIdParam))
        ) {
          return String(mascotaIdParam);
        }

        if (
          prev === "todas" ||
          mascotasData.some((m) => String(m.id) === String(prev))
        ) {
          return prev;
        }

        return "todas";
      });

      // Contactos: una sola llamada por usuario_id
      const resContactos = await axios
        .get(`${API_URL}/contactos-mascota`, {
          params: { usuario_id: userId }
        })
        .catch(() => ({ data: [] }));

      const todosContactos = normalizarArray(resContactos.data).map((c) => ({
        ...c,
        mascota_id: c.mascota_id || c.id_mascota,
        id_mascota: c.id_mascota || c.mascota_id,
        mascotaId: c.mascota_id || c.id_mascota,
        nombreMascota:
          mascotasData.find(
            (m) => String(m.id) === String(c.id_mascota || c.mascota_id)
          )?.nombre || ""
      }));

      // Historial: una llamada por mascota
      const promesasHistorial = mascotasData.map((m) =>
        axios
          .get(`${API_URL}/historial-mascota`, {
            params: { mascota_id: m.id }
          })
          .catch(() => ({ data: [] }))
      );

      const resultadosHistorial = await Promise.all(promesasHistorial);

      const todoHistorial = [];

      mascotasData.forEach((m, idx) => {
        const historialMascota = normalizarArray(resultadosHistorial[idx].data);

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
  }, [userId, mascotaIdParam, cargarMascotasVinculadas]);
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return undefined;
    }

    cargarTodosLosDatos();
    cargarSocios();

    return () => {
      window.clearTimeout(showSuccess.timer);
    };
  }, [userId, cargarTodosLosDatos, cargarSocios]);

  const normalizarFecha = (fecha) => {
    const partes = String(fecha).split("T")[0].split("-");
    return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
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
  }, [
    contactos,
    mascotaSeleccionadaId,
    filtroTipo,
    searchTerm,
    filtrarPorMascota
  ]);

  const citas = useMemo(() => {
    return historial
      .filter((item) => item.tipo_evento === "cita" || item.tipo_evento === "turno")
      .sort(
        (a, b) =>
          new Date(a.fecha_evento || 0) - new Date(b.fecha_evento || 0)
      );
  }, [historial]);

  const citasFiltradas = useMemo(() => {
    return filtrarPorMascota(citas, mascotaSeleccionadaId);
  }, [citas, mascotaSeleccionadaId, filtrarPorMascota]);

  const citasProximas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    return citasFiltradas.filter(
      (c) => c.fecha_evento && normalizarFecha(c.fecha_evento) >= hoy
    );
  }, [citasFiltradas]);

  const vacunasFiltradas = useMemo(() => {
    return filtrarPorMascota(vacunas, mascotaSeleccionadaId);
  }, [vacunas, mascotaSeleccionadaId, filtrarPorMascota]);

  const vacunasPendientes = useMemo(() => {
    return vacunasFiltradas.filter((v) => !isComplete(v.completada));
  }, [vacunasFiltradas]);

  const sociosFiltrados = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return socios;

    return socios.filter((socio) => {
      const texto = [
        socio.nombre,
        socio.nombre_local,
        socio.rubro,
        socio.direccion,
        socio.telefono,
        socio.descripcion,
        socio.email
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return texto.includes(term);
    });
  }, [socios, searchTerm]);

  const calcularSaludVacunas = () => {
    if (vacunasFiltradas.length === 0) return 0;

    const completadas = vacunasFiltradas.filter((v) => isComplete(v.completada)).length;
    return Math.round((completadas / vacunasFiltradas.length) * 100);
  };

  const renderTipo = (contacto) => {
    if (contacto?.tipo === "otro") return contacto.categoria_personalizada || "Otro";

    const tipos = {
      veterinario: "Veterinario",
      peluqueria: "Peluquería",
      paseador: "Paseador",
      petshop: "Pet Shop",
      guarderia: "Guardería"
    };

    return tipos[contacto?.tipo] || "Contacto";
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

  const getSocioIcon = (socio) => {
    const tipo = String(
      socio.tipo_servicio ||
      socio.rubro ||
      socio.tipo ||
      socio.categoria ||
      ""
    ).toLowerCase();

    if (tipo.includes("veterin")) return "🏥";
    if (tipo.includes("pase")) return "🦮";
    if (tipo.includes("pet")) return "🏪";
    if (tipo.includes("pelu")) return "✂️";
    if (tipo.includes("guard")) return "🏠";
    if (tipo.includes("adies")) return "🎓";

    return "🤝";
  };

  const getSocioImagenUrl = (socio) => {
    const imagen =
      socio.imagen ||
      socio.logo ||
      socio.foto ||
      socio.imagen_url ||
      socio.logo_url ||
      "";

    if (!imagen) return "";

    if (String(imagen).startsWith("http")) return imagen;

    return `${API_BASE}/${String(imagen).replace(/^\/+/, "")}`;
  };

  const getSocioNombre = (socio) => {
    return (
      socio.nombre_local ||
      socio.nombre_comercial ||
      socio.razon_social ||
      `${socio.nombre || ""} ${socio.apellido || ""}`.trim() ||
      "Amigo SP"
    );
  };

  const getSocioTelefono = (socio) => {
    return socio.whatsapp || socio.telefono || socio.celular || socio.telefono_contacto || "";
  };

  const getSocioTipo = (socio) => {
    return socio.tipo_servicio || socio.rubro || socio.tipo || socio.categoria || "Servicio";
  };

  const enviarWhatsApp = (celular, nombre) => {
    if (!celular) return;

    let numero = String(celular).replace(/\D/g, "");

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
      const payload = { ...payloadConMascota(formData), usuario_id: Number(userId) };

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

      await recargarContactos(mascotas);

      if (volverACitaDespuesContacto) {
        setShowModalContacto(false);
        setVolverACitaDespuesContacto(false);
        clearEditingStates();
        setShowModalCita(true); // sin setTimeout
        return true;
      }

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

      await recargarHistorial(mascotas);
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

      await recargarHistorial(mascotas);
      clearEditingStates();
      return true;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al guardar vacuna.");
      return false;
    }
  };

  const eliminarContacto = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    try {
      await axios.delete(`${API_URL}/contactos-mascota/${id}`);
      showSuccess("Contacto eliminado.");
      await recargarContactos(mascotas);
    } catch (err) {
      setError("Error al eliminar contacto.");
    }
  };

  const eliminarHistorialItem = async (id, titulo, tipo = "elemento") => {
    if (!window.confirm(`¿Eliminar ${tipo} "${titulo}"?`)) return;
    try {
      await axios.delete(`${API_URL}/historial-mascota/${id}`);
      showSuccess("Elemento eliminado.");
      await recargarHistorial(mascotas);
    } catch (err) {
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
      await recargarContactos(mascotas);
    } catch (err) {
      setError("No se pudo actualizar favorito.");
    }
  };

  const abrirNuevoContacto = () => {
    clearEditingStates();
    setMascotaIdParaContacto(mascotaIdParaModal);
    setVolverACitaDespuesContacto(false);
    setShowModalContacto(true);
  };

  const abrirContactoDesdeCita = (mascotaIdSeleccionada) => {
    setMascotaIdParaContacto(mascotaIdSeleccionada);
    setVolverACitaDespuesContacto(true);
    setContactoEdit(null);
    setEditandoContactoId(null);
    setShowModalCita(false);
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

  const abrirEditarContacto = (contacto) => {
    setContactoEdit(contacto);
    setEditandoContactoId(contacto.id);
    setMascotaIdParaContacto(
      contacto.mascota_id ||
      contacto.id_mascota ||
      contacto.mascotaId ||
      mascotaIdParaModal
    );
    setVolverACitaDespuesContacto(false);
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

  const abrirWebSocio = (socio) => {
    const url = socio.web || socio.website || socio.instagram || socio.url;
    if (!url) return;

    const finalUrl = String(url).startsWith("http") ? url : `https://${url}`;
    window.open(finalUrl, "_blank", "noopener,noreferrer");
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
                  <Calendar size={24} className="me-1" />
                  Agenda de mascotas
                </h2>

                <small>
                  Gestioná contactos, citas, vacunas y servicios recomendados.
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


            <Tabs
              activeKey={tabActivo}
              onSelect={(key) => setTabActivo(key || "resumen")}
              className={`${styles.tabs} mb-3`}
            >
              <Tab eventKey="resumen" title="Resumen">
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
                              {vacunasFiltradas.filter((v) => isComplete(v.completada)).length}/
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
                    <Card className={styles.summaryCard} onClick={() => setTabActivo("socios")}>
                      <Card.Body>
                        <div className="d-flex align-items-center gap-3">
                          <div className={`${styles.iconCircle} ${styles.bgDarkLight}`}>
                            <Heart size={22} />
                          </div>

                          <div>
                            <div className={styles.cardLabel}>Amigos SP</div>
                            <div className={styles.cardValue}>{socios.length}</div>
                          </div>
                        </div>

                        <div className={styles.cardPreview}>
                          Servicios y comercios recomendados
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row className="g-3">
                  <Col xs={12} lg={6}>
                    <Card className={styles.homePanelCard}>
                      <Card.Header className={styles.homePanelHeader}>
                        <div>
                          <strong>Próximas citas</strong>
                          <span>Actividades agendadas más cercanas</span>
                        </div>

                        <Button
                          type="button"
                          className={styles.homePanelAddBtn}
                          onClick={abrirNuevaCita}
                        >
                          <Plus size={15} />
                          Nueva
                        </Button>
                      </Card.Header>

                      <Card.Body className={styles.homePanelBody}>
                        {citasProximas.length === 0 ? (
                          <div className={styles.homeEmptyState}>
                            <div className={styles.homeEmptyIcon}>
                              <Calendar size={24} />
                            </div>

                            <strong>No hay citas próximas</strong>
                            <p>Agendá controles, turnos o recordatorios importantes.</p>

                            <Button type="button" onClick={abrirNuevaCita}>
                              <Plus size={15} />
                              Crear cita
                            </Button>
                          </div>
                        ) : (
                          <div className={styles.homeCitasList}>
                            {citasProximas.slice(0, 4).map((cita) => {
                              const fecha = cita.fecha_evento || cita.fecha || "";
                              const partes = fecha ? String(fecha).split("T")[0].split("-") : [];
                              const dia = partes.length === 3 ? partes[2] : "--";
                              const mes = partes.length === 3
                                ? new Date(Number(partes[0]), Number(partes[1]) - 1, 1).toLocaleDateString("es-AR", { month: "short" })
                                : "Sin fecha";

                              return (
                                <article key={cita.id} className={styles.homeCitaItem}>
                                  <div className={styles.homeCitaDate}>
                                    <span>{dia}</span>
                                    <small>{mes}</small>
                                  </div>

                                  <div className={styles.homeCitaContent}>
                                    <div className={styles.homeCitaTop}>
                                      <h4>{cita.titulo || "Cita sin título"}</h4>

                                      <span className={styles.homeCitaBadge}>
                                        Próxima
                                      </span>
                                    </div>

                                    <div className={styles.homeCitaMeta}>
                                      <span>
                                        <Calendar size={14} />
                                        {formatDate(cita.fecha_evento)}
                                      </span>

                                      <span>
                                        <Heart size={14} />
                                        {cita.nombreMascota || "Mascota"}
                                      </span>
                                    </div>

                                    {cita.nota && (
                                      <p className={styles.homeCitaNote}>{cita.nota}</p>
                                    )}
                                  </div>

                                  <div className={styles.homeCitaActions}>
                                    <Button
                                      type="button"
                                      className={styles.homeCitaEditBtn}
                                      onClick={() => abrirEditarCita(cita)}
                                    >
                                      <Edit2 size={15} />
                                      Editar
                                    </Button>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
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
                          vacunasPendientes.slice(0, 5).map((vacuna) => (
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
                <div className={styles.contactosSection}>
                  <div className={styles.contactosToolbar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Contactos útiles</h3>
                      <p className={styles.sectionSubtitle}>
                        Veterinarios, peluquerías, paseadores y servicios de confianza.
                      </p>
                    </div>

                    <div className={styles.contactosToolbarActions}>
                      <Form.Select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className={styles.contactosFilter}
                      >
                        <option value="todos">Todos los tipos</option>
                        <option value="veterinario">Veterinario</option>
                        <option value="peluqueria">Peluquería</option>
                        <option value="paseador">Paseador</option>
                        <option value="petshop">Pet Shop</option>
                        <option value="guarderia">Guardería</option>
                        <option value="otro">Otro</option>
                      </Form.Select>

                      <Button className={styles.createContactoBtn} onClick={abrirNuevoContacto}>
                        <Plus size={16} />
                        Nuevo contacto
                      </Button>
                    </div>
                  </div>

                  {contactosFiltradosPorMascota.length === 0 ? (
                    <div className={styles.emptyInline}>
                      <Users size={32} />
                      <p>No hay contactos cargados para esta mascota.</p>
                      <Button onClick={abrirNuevoContacto}>Crear contacto</Button>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {contactosFiltradosPorMascota.map((contacto) => {
                        const nombreCompleto = `${contacto.nombre || ""} ${contacto.apellido || ""}`.trim();
                        const nombreVisible = nombreCompleto || "Contacto sin nombre";
                        const tipoVisible = renderTipo(contacto);
                        const iconoVisible = getIconoTipo(contacto.tipo);
                        const favorito = contacto.favorito === true || contacto.favorito === 1 || contacto.favorito === "1";

                        return (
                          <Col key={contacto.id} xs={12} md={6} xl={4}>
                            <Card className={styles.contactoCard}>
                              <div className={styles.contactoCardTop}>
                                <div className={styles.contactoAvatar}>
                                  <span>{iconoVisible}</span>
                                </div>

                                <button
                                  type="button"
                                  className={`${styles.contactoFavBtn} ${favorito ? styles.contactoFavActive : ""}`}
                                  onClick={() => toggleFavorito(contacto)}
                                  aria-label={favorito ? "Quitar favorito" : "Marcar favorito"}
                                >
                                  <Star size={18} fill={favorito ? "currentColor" : "none"} />
                                </button>
                              </div>

                              <Card.Body className={styles.contactoCardBody}>
                                <div className={styles.contactoHeader}>
                                  <Badge className={styles.contactoTypeBadge}>
                                    {iconoVisible} {tipoVisible}
                                  </Badge>

                                  <h4 className={styles.contactoName}>{nombreVisible}</h4>

                                  {contacto.nombreMascota && (
                                    <p className={styles.contactoPet}>
                                      <Heart size={14} />
                                      {contacto.nombreMascota}
                                    </p>
                                  )}
                                </div>

                                <div className={styles.contactoInfoBox}>
                                  {contacto.celular && (
                                    <div className={styles.contactoInfoRow}>
                                      <Phone size={16} />
                                      <span>{contacto.celular}</span>
                                    </div>
                                  )}

                                  {contacto.email && (
                                    <div className={styles.contactoInfoRow}>
                                      <span className={styles.contactoMiniIcon}>@</span>
                                      <span>{contacto.email}</span>
                                    </div>
                                  )}

                                  {contacto.direccion && (
                                    <div className={styles.contactoInfoRow}>
                                      <MapPin size={16} />
                                      <span>{contacto.direccion}</span>
                                    </div>
                                  )}

                                  {(contacto.horarios || contacto.dias_atencion) && (
                                    <div className={styles.contactoInfoRow}>
                                      <Clock size={16} />
                                      <span>
                                        {contacto.horarios}
                                        {contacto.horarios && contacto.dias_atencion ? " · " : ""}
                                        {contacto.dias_atencion}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className={styles.contactoActions}>
                                  {contacto.celular && (
                                    <Button
                                      type="button"
                                      className={styles.contactoWhatsappBtn}
                                      onClick={() => enviarWhatsApp(contacto.celular, contacto.nombre)}
                                    >
                                      <Phone size={15} />
                                      WhatsApp
                                    </Button>
                                  )}

                                  <Button
                                    type="button"
                                    variant="outline-secondary"
                                    className={styles.contactoActionBtn}
                                    onClick={() => abrirEditarContacto(contacto)}
                                  >
                                    <Edit2 size={15} />
                                    Editar
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline-danger"
                                    className={`${styles.contactoActionBtn} ${styles.contactoDeleteBtn}`}
                                    onClick={() => eliminarContacto(contacto.id, nombreVisible)}
                                  >
                                    <Trash2 size={15} />
                                    Eliminar
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
              </Tab>

              <Tab eventKey="citas" title={`Citas (${citasFiltradas.length})`}>
                <div className={styles.citasSection}>
                  <div className={styles.citasToolbar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Citas agendadas</h3>
                      <p className={styles.sectionSubtitle}>
                        Turnos, controles y actividades importantes de tus mascotas.
                      </p>
                    </div>

                    <Button className={styles.createCitaBtn} onClick={abrirNuevaCita}>
                      <Plus size={16} />
                      Nueva cita
                    </Button>
                  </div>

                  {citasFiltradas.length === 0 ? (
                    <div className={styles.emptyInline}>
                      <Calendar size={32} />
                      <p>No hay citas registradas.</p>
                      <Button onClick={abrirNuevaCita}>Crear cita</Button>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {citasFiltradas.map((cita) => {
                        const fecha = cita.fecha_evento || cita.fecha || "";

                        const partes = fecha ? String(fecha).split("T")[0].split("-") : [];
                        const dia = partes.length === 3 ? partes[2] : "--";
                        const mes = partes.length === 3
                          ? new Date(Number(partes[0]), Number(partes[1]) - 1, 1).toLocaleDateString("es-AR", { month: "short" })
                          : "Sin fecha";

                        const hoy = new Date();
                        hoy.setHours(0, 0, 0, 0);



                        return (
                          <Col key={cita.id} xs={12} md={6} xl={4}>
                            <Card className={styles.citaCard}>
                              <Card.Body className={styles.citaCardBody}>
                                <div className={styles.citaCardTop}>
                                  <div className={styles.citaDateBox}>
                                    <span className={styles.citaDay}>{dia}</span>
                                    <span className={styles.citaMonth}>{mes}</span>
                                  </div>


                                </div>

                                <div className={styles.citaContent}>
                                  <h4 className={styles.citaTitle}>
                                    {cita.titulo || "Cita sin título"}
                                  </h4>

                                  <div className={styles.citaMeta}>
                                    <span>
                                      <Calendar size={14} />
                                      {formatDate(cita.fecha_evento)}
                                    </span>

                                    <span>
                                      <Heart size={14} />
                                      {cita.nombreMascota || "Mascota"}
                                    </span>
                                  </div>

                                  {cita.nota ? (
                                    <p className={styles.citaNote}>{cita.nota}</p>
                                  ) : (
                                    <p className={styles.citaNoteMuted}>
                                      Sin observaciones cargadas.
                                    </p>
                                  )}

                                  {cita.proxima_fecha && (
                                    <div className={styles.citaNextDate}>
                                      <Clock size={15} />
                                      Próxima fecha: {formatDate(cita.proxima_fecha)}
                                    </div>
                                  )}
                                </div>

                                <div className={styles.citaActions}>
                                  <Button
                                    type="button"
                                    variant="outline-primary"
                                    className={styles.citaActionBtn}
                                    onClick={() => abrirEditarCita(cita)}
                                  >
                                    <Edit2 size={15} />
                                    Editar
                                  </Button>

                                  <Button
                                    type="button"
                                    variant="outline-danger"
                                    className={`${styles.citaActionBtn} ${styles.citaDeleteBtn}`}
                                    onClick={() =>
                                      eliminarHistorialItem(cita.id, cita.titulo, "cita")
                                    }
                                  >
                                    <Trash2 size={15} />
                                    Eliminar
                                  </Button>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
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

                            {isComplete(vacuna.completada) ? (
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

              <Tab eventKey="socios" title={`Amigos SP (${sociosFiltrados.length})`}>
                <div className={styles.sociosSection}>
                  <div className={styles.sociosToolbar}>
                    <div>
                      <h3 className={styles.sectionTitle}>Amigos SP</h3>
                      <p className={styles.sectionSubtitle}>
                        Servicios, comercios y profesionales recomendados para tus mascotas.
                      </p>
                    </div>
                  </div>

                  {cargandoSocios ? (
                    <div className="py-4 text-center">
                      <Spinner animation="border" />
                    </div>
                  ) : sociosFiltrados.length === 0 ? (
                    <div className={styles.emptyInline}>
                      <Heart size={32} />
                      <p>No hay Amigos SP disponibles por ahora.</p>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {sociosFiltrados.map((socio) => {
                        const imagenUrl = getSocioImagenUrl(socio);
                        const nombreSocio = getSocioNombre(socio);
                        const tipoSocio = getSocioTipo(socio);
                        const telefonoSocio = getSocioTelefono(socio);
                        const tieneWeb = socio.web || socio.website || socio.instagram || socio.url;

                        return (
                          <Col key={socio.id} xs={12} md={6} xl={4}>
                            <Card className={styles.socioCard}>
                              <div className={styles.socioMedia}>
                                {imagenUrl ? (
                                  <img
                                    src={imagenUrl}
                                    alt={nombreSocio}
                                    className={styles.socioImage}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <div className={styles.socioPlaceholder}>
                                    <span>{getSocioIcon(socio)}</span>
                                  </div>
                                )}

                                <div className={styles.socioMediaOverlay} />

                                <div className={styles.socioTopBadges}>
                                  <span className={styles.socioMainBadge}>
                                    {getSocioIcon(socio)} {tipoSocio}
                                  </span>

                                  {Number(socio.servicio_24h) === 1 && (
                                    <span className={styles.badgeInfo}>24 hs</span>
                                  )}

                                  {Number(socio.emergencias) === 1 && (
                                    <span className={styles.badgeDanger}>Emergencias</span>
                                  )}
                                </div>
                              </div>

                              <Card.Body className={styles.socioBody}>
                                <div className={styles.socioHeader}>
                                  <div>
                                    <h5 className={styles.socioName}>{nombreSocio}</h5>
                                    <p className={styles.socioSubtitle}>{tipoSocio}</p>
                                  </div>

                                  <div className={styles.socioHeart}>
                                    <Heart size={18} />
                                  </div>
                                </div>

                                <div className={styles.socioInfoBox}>
                                  {socio.direccion && (
                                    <div className={styles.socioInfoRow}>
                                      <MapPin size={16} />
                                      <span>{socio.direccion}</span>
                                    </div>
                                  )}

                                  {telefonoSocio && (
                                    <div className={styles.socioInfoRow}>
                                      <Phone size={16} />
                                      <span>{telefonoSocio}</span>
                                    </div>
                                  )}

                                  {(socio.horarios || socio.horarios_atencion || socio.dias_atencion) && (
                                    <div className={styles.socioInfoRow}>
                                      <Clock size={16} />
                                      <span>
                                        {socio.horarios || socio.horarios_atencion || socio.dias_atencion}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {(socio.descripcion || socio.detalle || socio.observaciones) && (
                                  <p className={styles.socioDescription}>
                                    {socio.descripcion || socio.detalle || socio.observaciones}
                                  </p>
                                )}

                                <div className={styles.socioActions}>
                                  {telefonoSocio && (
                                    <Button
                                      type="button"
                                      className={styles.socioContactBtn}
                                      onClick={() => enviarWhatsApp(telefonoSocio, nombreSocio)}
                                    >
                                      <Phone size={16} />
                                      Contactar
                                    </Button>
                                  )}

                                  {tieneWeb && (
                                    <Button
                                      type="button"
                                      variant="outline-secondary"
                                      className={styles.socioMoreBtn}
                                      onClick={() => abrirWebSocio(socio)}
                                    >
                                      <ExternalLink size={16} />
                                      Ver más
                                    </Button>
                                  )}
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  )}
                </div>
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
            setMascotaIdParaContacto("");
            setVolverACitaDespuesContacto(false);
          }}
          contactoEdit={contactoEdit}
          onSave={handleGuardarContacto}
          mascotas={mascotas}
          mascotaId={mascotaIdParaContacto || mascotaIdParaModal}
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
          mascotaId={mascotaIdParaModal}
          onSave={handleGuardarCita}
          onCrearContacto={abrirContactoDesdeCita}
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
          mascotaId={mascotaIdParaModal}
          onSave={handleGuardarVacuna}
        />
      </Container>
    </>
  );
}