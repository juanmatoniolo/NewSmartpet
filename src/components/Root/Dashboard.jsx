import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Modal, Form, Badge, Alert } from "react-bootstrap";
import {
  Users,
  Dog,
  Tag,
  Phone,
  Calendar,
  MapPin,
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";

import AdminHeader from "./AdminHeader";
import "./dashboard.css";

import {
  API_URL,
  getAdminHeaders,
  getMultipartAdminHeaders,
  normalizeList,
  resolveUploadUrl,
} from "../../config/adminApi";

const SECTIONS = {
  usuarios: {
    title: "Usuarios",
    icon: Users,
    endpoint: "usuarios",
    singular: "usuario",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "apellido", label: "Apellido", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Contraseña", type: "password", required: true },
      { name: "fecha_nacimiento", label: "Fecha nacimiento", type: "date" },
      { name: "recibir_emails", label: "Recibir emails", type: "checkbox" },
      { name: "root", label: "Usuario root", type: "checkbox" },
    ],
    columns: ["foto", "nombre", "apellido", "email", "root"],
  },

  mascotas: {
    title: "Mascotas",
    icon: Dog,
    endpoint: "mascotas",
    singular: "mascota",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "fecha_nacimiento", label: "Fecha nacimiento", type: "date" },
      {
        name: "sexo",
        label: "Sexo",
        type: "select",
        required: true,
        options: [
          { value: 0, label: "Macho" },
          { value: 1, label: "Hembra" },
        ],
      },
      { name: "descripcion", label: "Descripción", type: "textarea" },
      { name: "direccion", label: "Dirección", type: "textarea" },
      {
        name: "id_usuario",
        label: "Usuario",
        type: "fk_select",
        required: true,
        fkEndpoint: "usuarios",
        fkValue: "id",
        fkLabel: (u) => `${u.nombre || ""} ${u.apellido || ""} — ${u.email || ""}`,
      },
      {
        name: "codigo_unico",
        label: "Código QR/NFC",
        type: "text",
        required: true,
        placeholder: "ABCD1234",
        readonlyOnEdit: true,
      },
      { name: "mensajeRescate", label: "Mensaje rescate", type: "textarea" },
      { name: "persona1", label: "Persona 1", type: "text" },
      { name: "persona1tel", label: "Teléfono persona 1", type: "tel" },
      { name: "persona1ig", label: "Instagram persona 1", type: "text" },
      { name: "persona2", label: "Persona 2", type: "text" },
      { name: "persona2tel", label: "Teléfono persona 2", type: "tel" },
      { name: "persona2ig", label: "Instagram persona 2", type: "text" },
    ],
    columns: ["foto", "nombre", "id_usuario", "codigo_id", "sexo"],
    fkColumns: {
      id_usuario: { endpoint: "usuarios", label: (u) => `${u.nombre || ""} ${u.apellido || ""}` },
      codigo_id: { endpoint: "codigos", label: (c) => c.codigo_unico },
    },
  },

  codigos: {
    title: "Códigos",
    icon: Tag,
    endpoint: "codigos",
    singular: "codigo",
    fields: [
      {
        name: "codigo_unico",
        label: "Código único",
        type: "text",
        required: true,
        placeholder: "ABCD1234",
        readonlyOnEdit: true,
      },
    ],
    columns: ["id", "codigo_unico"],
  },

  contactos: {
    title: "Contactos",
    icon: Phone,
    endpoint: "contactos",
    singular: "contacto",
    fields: [
      {
        name: "id_mascota",
        label: "Mascota",
        type: "fk_select",
        required: true,
        fkEndpoint: "mascotas",
        fkValue: "id",
        fkLabel: (m) => `${m.nombre || "Mascota"} (ID ${m.id})`,
      },
      {
        name: "tipo",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "veterinario", label: "Veterinario" },
          { value: "paseador", label: "Paseador" },
          { value: "peluqueria", label: "Peluquería" },
          { value: "petshop", label: "Petshop" },
          { value: "guarderia", label: "Guardería" },
          { value: "otro", label: "Otro" },
        ],
      },
      { name: "categoria_personalizada", label: "Categoría personalizada", type: "text" },
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "apellido", label: "Apellido", type: "text" },
      { name: "celular", label: "Celular", type: "tel" },
      { name: "telefono_fijo", label: "Teléfono fijo", type: "tel" },
      { name: "email", label: "Email", type: "email" },
      { name: "direccion", label: "Dirección", type: "text" },
      { name: "horarios", label: "Horarios", type: "text" },
      { name: "dias_atencion", label: "Días atención", type: "text" },
      { name: "notas", label: "Notas", type: "textarea" },
      { name: "favorito", label: "Favorito", type: "checkbox" },
    ],
    columns: ["id", "id_mascota", "nombre", "tipo", "celular"],
    fkColumns: {
      id_mascota: { endpoint: "mascotas", label: (m) => m.nombre },
    },
  },

  historial: {
    title: "Historial",
    icon: Calendar,
    endpoint: "historial",
    singular: "historial",
    fields: [
      {
        name: "id_mascota",
        label: "Mascota",
        type: "fk_select",
        required: true,
        fkEndpoint: "mascotas",
        fkValue: "id",
        fkLabel: (m) => `${m.nombre || "Mascota"} (ID ${m.id})`,
      },
      {
        name: "tipo_evento",
        label: "Tipo",
        type: "select",
        required: true,
        options: [
          { value: "cita", label: "Cita" },
          { value: "vacuna", label: "Vacuna" },
          { value: "bitacora", label: "Bitácora" },
        ],
      },
      { name: "titulo", label: "Título", type: "text", required: true },
      { name: "fecha_evento", label: "Fecha evento", type: "date", required: true },
      { name: "proxima_fecha", label: "Próxima fecha", type: "date" },
      { name: "nota", label: "Nota", type: "textarea" },
      { name: "laboratorio", label: "Laboratorio", type: "text" },
      { name: "lote", label: "Lote", type: "text" },
      { name: "completada", label: "Completada", type: "checkbox" },
      { name: "recordatorio", label: "Recordatorio", type: "checkbox" },
    ],
    columns: ["id", "id_mascota", "titulo", "tipo_evento", "fecha_evento"],
    fkColumns: {
      id_mascota: { endpoint: "mascotas", label: (m) => m.nombre },
    },
  },

  socios: {
    title: "Socios SmartPet",
    icon: Stethoscope,
    endpoint: "socios",
    singular: "socio",
    fields: [
      { name: "nombre", label: "Nombre", type: "text", required: true },
      { name: "apellido", label: "Apellido", type: "text" },
      { name: "nombre_local", label: "Nombre del local", type: "text", required: true },
      {
        name: "tipo_servicio",
        label: "Tipo de servicio",
        type: "select",
        required: true,
        options: [
          { value: "veterinaria", label: "Veterinaria" },
          { value: "paseador", label: "Paseador" },
          { value: "petshop", label: "Petshop" },
          { value: "guarderia", label: "Guardería" },
          { value: "peluqueria", label: "Peluquería" },
          { value: "otros", label: "Otros" },
        ],
      },
      { name: "whatsapp", label: "WhatsApp", type: "tel", required: true },
      { name: "direccion", label: "Dirección", type: "text" },
      { name: "descripcion", label: "Descripción", type: "textarea" },
      { name: "dias_atencion", label: "Días de atención", type: "text" },
      { name: "horarios_atencion", label: "Horarios", type: "text" },
      { name: "servicio_24h", label: "Servicio 24 horas", type: "checkbox" },
      { name: "emergencias", label: "Emergencias", type: "checkbox" },
    ],
    columns: ["foto", "nombre_local", "tipo_servicio", "whatsapp", "servicio_24h", "emergencias"],
  },

  ubicaciones: {
    title: "Ubicaciones",
    icon: MapPin,
    endpoint: "ubicaciones",
    singular: "ubicacion",
    fields: [
      {
        name: "id_mascota",
        label: "Mascota",
        type: "fk_select",
        required: true,
        fkEndpoint: "mascotas",
        fkValue: "id",
        fkLabel: (m) => `${m.nombre || "Mascota"} (ID ${m.id})`,
      },
      {
        name: "ubicacion",
        label: "Coordenadas",
        type: "text",
        required: true,
        placeholder: "-30.766238,-57.984069",
      },
    ],
    columns: ["id", "id_mascota", "ubicacion", "fecha_hora"],
    fkColumns: {
      id_mascota: { endpoint: "mascotas", label: (m) => m.nombre },
    },
  },
};

const BOOL_COLS = new Set([
  "favorito",
  "completada",
  "recordatorio",
  "recibir_emails",
  "servicio_24h",
  "emergencias",
  "root",
]);

const getFallbackImage = (section) => {
  if (section === "usuarios") return "/default.jpg";
  if (section === "mascotas") return "/a.jpg";
  if (section === "socios") return "/icono.png";
  return "/icono.png";
};

const withRefresh = (src, refreshKey) => {
  if (!src) return src;
  return `${src}${src.includes("?") ? "&" : "?"}_=${refreshKey}`;
};

const getImageSrc = (section, item) => {
  if (section === "usuarios") {
    return item.foto_perfil ? resolveUploadUrl(item.foto_perfil) : "/default.jpg";
  }

  if (section === "mascotas") {
    return item.urlImg ? resolveUploadUrl(item.urlImg) : "/a.jpg";
  }

  if (section === "socios") {
    return item.logo_url ? resolveUploadUrl(item.logo_url) : "/icono.png";
  }

  return "/icono.png";
};

const getImageAlt = (section, item) => {
  if (section === "usuarios") return `Foto de ${item.nombre || "usuario"}`;
  if (section === "mascotas") return `Foto de ${item.nombre || "mascota"}`;
  if (section === "socios") return `Logo de ${item.nombre_local || item.nombre || "socio"}`;
  return "Imagen";
};

function ImageCell({ section, item, onImageClick, refreshKey }) {
  if (!["usuarios", "mascotas", "socios"].includes(section)) return <span>—</span>;

  const src = getImageSrc(section, item);
  const imageUrl = withRefresh(src, refreshKey);
  const alt = getImageAlt(section, item);

  return (
    <button
      type="button"
      className="border-0 p-0 bg-transparent"
      onClick={(e) => {
        e.stopPropagation();
        onImageClick(imageUrl, alt);
      }}
      title="Ver imagen"
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: 44,
          height: 44,
          borderRadius: section === "socios" ? 14 : "50%",
          objectFit: "cover",
          border: "1px solid #e5d9f2",
          background: "#f8f5fc",
        }}
        onError={(e) => {
          e.currentTarget.src = getFallbackImage(section);
        }}
      />
    </button>
  );
}

function FkSelectField({ field, value, fkCatalog, disabled }) {
  const options = fkCatalog[field.fkEndpoint] || [];

  return (
    <div className={`db-fk-wrap ${disabled ? "db-fk-wrap--locked" : ""}`}>
      <select
        name={field.name}
        defaultValue={value ?? ""}
        required={!disabled && field.required}
        disabled={disabled}
        className="db-fk-select form-select"
      >
        <option value="">Seleccionar…</option>

        {options.map((opt) => (
          <option key={opt[field.fkValue]} value={opt[field.fkValue]}>
            {field.fkLabel(opt)}
          </option>
        ))}
      </select>

      {disabled && <input type="hidden" name={field.name} value={value ?? ""} />}
    </div>
  );
}

function CellValue({ col, value, fkData, section, item, onImageClick, refreshKey }) {
  if (col === "foto") {
    return (
      <ImageCell
        section={section}
        item={item}
        onImageClick={onImageClick}
        refreshKey={refreshKey}
      />
    );
  }

  if (col === "sexo") return value == 0 ? "Macho" : "Hembra";

  if (BOOL_COLS.has(col)) {
    return (
      <Badge bg={value == 1 ? "success" : "secondary"} className="ds-badge">
        {value == 1 ? "Sí" : "No"}
      </Badge>
    );
  }

  if (fkData?.data) {
    const found = fkData.data.find((r) => String(r.id) === String(value));

    if (found) {
      return (
        <span className="db-fk-chip">
          <LinkIcon size={11} />
          {fkData.label(found)}
        </span>
      );
    }
  }

  return <>{value ?? "—"}</>;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentItem, setCurrentItem] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [fkCatalog, setFkCatalog] = useState({});
  const [refreshKey, setRefreshKey] = useState(Date.now());

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: null, lng: null });
  const [imageModal, setImageModal] = useState({ show: false, src: "", alt: "" });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [socioImageFile, setSocioImageFile] = useState(null);
  const [socioImagePreview, setSocioImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sec = SECTIONS[activeTab];

  const cleanupModalEffects = () => {
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
  };

  const resetImageStates = () => {
    if (profileImagePreview) URL.revokeObjectURL(profileImagePreview);
    if (petImagePreview) URL.revokeObjectURL(petImagePreview);
    if (socioImagePreview) URL.revokeObjectURL(socioImagePreview);

    setProfileImageFile(null);
    setProfileImagePreview(null);
    setPetImageFile(null);
    setPetImagePreview(null);
    setSocioImageFile(null);
    setSocioImagePreview(null);
  };

  const closeMainModal = () => {
    setShowModal(false);
    setUploading(false);
    resetImageStates();
    setTimeout(cleanupModalEffects, 80);
  };

  const closeDetailModal = () => {
    setShowDetail(false);
    setTimeout(cleanupModalEffects, 80);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setTimeout(cleanupModalEffects, 80);
  };

  const closeImageModal = () => {
    setImageModal({ show: false, src: "", alt: "" });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        API_URL,
        { action: `get${sec.endpoint}` },
        { headers: getAdminHeaders() }
      );

      setData(normalizeList(res.data, sec.endpoint));
      setRefreshKey(Date.now());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al cargar datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sec.endpoint]);

  const loadFkCatalog = useCallback(async () => {
    const needed = new Set();

    sec.fields
      .filter((f) => f.type === "fk_select")
      .forEach((f) => needed.add(f.fkEndpoint));

    if (sec.fkColumns) {
      Object.values(sec.fkColumns).forEach((fc) => needed.add(fc.endpoint));
    }

    for (const ep of needed) {
      try {
        const res = await axios.post(
          API_URL,
          { action: `get${ep}` },
          { headers: getAdminHeaders() }
        );

        setFkCatalog((prev) => ({
          ...prev,
          [ep]: normalizeList(res.data, ep),
        }));
      } catch (err) {
        console.error(`Error cargando FK ${ep}:`, err);
      }
    }
  }, [sec.fields, sec.fkColumns]);

  const refreshAllData = async () => {
    await loadFkCatalog();
    await loadData();
  };

  useEffect(() => {
    loadData();
    loadFkCatalog();
  }, [loadData, loadFkCatalog]);

  useEffect(() => {
    if (!success) return undefined;

    const t = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [success]);

  useEffect(() => {
    if (!error) return undefined;

    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    return () => {
      resetImageStates();
      cleanupModalEffects();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getFkDataForCol = (col) => {
    const fc = sec.fkColumns?.[col];

    if (!fc) return null;

    return {
      data: fkCatalog[fc.endpoint],
      label: fc.label,
    };
  };

  const openMap = (ubicacionStr) => {
    if (!ubicacionStr) return;

    const parts = String(ubicacionStr).split(",");

    if (parts.length !== 2) {
      setError("Formato de ubicación incorrecto. Esperado: lat,lng");
      return;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError("Coordenadas inválidas");
      return;
    }

    setMapCoordinates({ lat, lng });
    setShowMapModal(true);
  };

  const openImageModal = (src, alt) => {
    setImageModal({
      show: true,
      src: resolveUploadUrl(src),
      alt,
    });
  };

  const handleCreate = () => {
    setModalMode("create");
    setCurrentItem({});
    resetImageStates();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setCurrentItem(item);
    resetImageStates();
    setShowModal(true);
  };

  const handleDetail = (item) => {
    setDetailItem(item);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;

    try {
      await axios.post(
        API_URL,
        {
          action: `delete${sec.singular}`,
          id,
        },
        {
          headers: getAdminHeaders(),
        }
      );

      setSuccess("Registro eliminado");
      await refreshAllData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al eliminar");
    }
  };

  const uploadImageIfNeeded = async (savedId) => {
    if (sec.endpoint === "usuarios" && profileImageFile) {
      const formData = new FormData();
      formData.append("imagen", profileImageFile);

      await axios.post(`${API_URL}/upload-perfil/${savedId}`, formData, {
        headers: getMultipartAdminHeaders(),
      });
    }

    if (sec.endpoint === "mascotas" && petImageFile) {
      const formData = new FormData();
      formData.append("imagen", petImageFile);

      await axios.post(`${API_URL}/upload-mascota/${savedId}`, formData, {
        headers: getMultipartAdminHeaders(),
      });
    }

    if (sec.endpoint === "socios" && socioImageFile) {
      const formData = new FormData();
      formData.append("imagen", socioImageFile);

      await axios.post(`${API_URL}/upload-socio/${savedId}`, formData, {
        headers: getMultipartAdminHeaders(),
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);

    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);

    sec.fields.forEach((field) => {
      if (field.type === "checkbox") {
        body[field.name] = fd.get(field.name) ? 1 : 0;
      }
    });

    if (sec.endpoint === "usuarios" && modalMode === "edit" && !body.password) {
      delete body.password;
    }

    if (sec.endpoint === "mascotas" && modalMode === "edit") {
      delete body.codigo_unico;
    }

    try {
      const action =
        modalMode === "create"
          ? `create${sec.singular}`
          : `update${sec.singular}`;

      let savedId = currentItem.id;

      const res = await axios.post(
        API_URL,
        {
          action,
          ...(modalMode === "edit" ? { id: currentItem.id } : {}),
          ...body,
        },
        {
          headers: getAdminHeaders(),
        }
      );

      if (modalMode === "create") {
        savedId = res.data?.id || res.data?.data?.id;

        if (!savedId) {
          throw new Error("No se pudo obtener el ID creado");
        }
      }

      await uploadImageIfNeeded(savedId);

      setSuccess(`Registro ${modalMode === "create" ? "creado" : "actualizado"} correctamente`);
      closeMainModal();
      await refreshAllData();
      window.dispatchEvent(new Event("userPhotoUpdated"));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || "Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      sec.columns.join(","),
      ...filtered.map((row) =>
        sec.columns
          .map((col) => `"${String(row[col] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${sec.title}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const renderField = (field) => {
    const locked = modalMode === "edit" && field.readonlyOnEdit === true;
    let val = currentItem[field.name] ?? "";

    if (field.name === "password" && modalMode === "edit") val = "";

    if (sec.endpoint === "mascotas" && field.name === "codigo_unico" && modalMode === "edit") {
      const codigoObj = fkCatalog.codigos?.find((c) => String(c.id) === String(currentItem.codigo_id));
      val = codigoObj?.codigo_unico || currentItem.codigo_unico || "";

      return (
        <Form.Control
          type="text"
          name={field.name}
          value={val}
          readOnly
          disabled
          className="db-field-locked"
        />
      );
    }

    if (field.type === "fk_select") {
      return (
        <FkSelectField
          field={field}
          value={val}
          fkCatalog={fkCatalog}
          disabled={locked}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <Form.Control
          as="textarea"
          rows={3}
          name={field.name}
          defaultValue={val}
          required={field.required && modalMode === "create"}
          placeholder={field.placeholder}
          readOnly={locked}
        />
      );
    }

    if (field.type === "select") {
      return (
        <Form.Select
          name={field.name}
          defaultValue={val}
          required={field.required}
          disabled={locked}
        >
          <option value="">Seleccionar…</option>

          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Form.Select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <Form.Check
          type="checkbox"
          name={field.name}
          defaultChecked={val == 1}
          disabled={locked}
        />
      );
    }

    return (
      <Form.Control
        type={field.type}
        name={field.name}
        defaultValue={val}
        required={field.required && !(field.name === "password" && modalMode === "edit")}
        placeholder={field.placeholder}
        readOnly={locked}
      />
    );
  };

  const resolveDetailValue = (field, value) => {
    if (field.type === "fk_select") {
      const opts = fkCatalog[field.fkEndpoint] || [];
      const found = opts.find((o) => String(o[field.fkValue]) === String(value));

      return found ? (
        <span className="db-fk-chip">
          <LinkIcon size={11} />
          {field.fkLabel(found)}
        </span>
      ) : (
        value ?? "—"
      );
    }

    return (
      <CellValue
        col={field.name}
        value={value}
        section={sec.endpoint}
        item={detailItem}
        onImageClick={openImageModal}
        refreshKey={refreshKey}
      />
    );
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return data;

    return data.filter((item) =>
      sec.columns.some((col) =>
        String(item[col] ?? "")
          .toLowerCase()
          .includes(term)
      )
    );
  }, [data, search, sec.columns]);

  const SidebarNav = ({ onSelect }) => (
    <nav className="db-sidebar-nav">
      {Object.entries(SECTIONS).map(([key, section]) => {
        const Icon = section.icon;

        return (
          <button
            key={key}
            type="button"
            className={`db-sidebar-item ${activeTab === key ? "active" : ""}`}
            onClick={() => {
              setActiveTab(key);
              setSearch("");
              onSelect?.();
            }}
          >
            <Icon size={18} />
            <span>{section.title}</span>
            <ChevronRight size={14} className="db-sidebar-arrow" />
          </button>
        );
      })}
    </nav>
  );

  const renderImageUpload = () => {
    if (!["usuarios", "mascotas", "socios"].includes(sec.endpoint)) return null;

    const config = {
      usuarios: {
        label: "Foto de perfil",
        file: profileImageFile,
        preview: profileImagePreview,
        current: currentItem.foto_perfil,
        setFile: setProfileImageFile,
        setPreview: setProfileImagePreview,
        fallback: "/default.jpg",
        shape: "50%",
      },
      mascotas: {
        label: "Foto de la mascota",
        file: petImageFile,
        preview: petImagePreview,
        current: currentItem.urlImg,
        setFile: setPetImageFile,
        setPreview: setPetImagePreview,
        fallback: "/a.jpg",
        shape: "50%",
      },
      socios: {
        label: "Logo o foto del local",
        file: socioImageFile,
        preview: socioImagePreview,
        current: currentItem.logo_url,
        setFile: setSocioImageFile,
        setPreview: setSocioImagePreview,
        fallback: "/icono.png",
        shape: "16px",
      },
    }[sec.endpoint];

    const previewSrc = config.preview || resolveUploadUrl(config.current);

    return (
      <div className="db-form-group full">
        <label className="db-label">{config.label}</label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="form-control"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (!file) {
              config.setFile(null);
              config.setPreview(null);
              return;
            }

            config.setFile(file);
            config.setPreview(URL.createObjectURL(file));
          }}
        />

        <small className="text-muted d-block mt-1">
          Se guardará en formato WEBP.
        </small>

        {previewSrc && (
          <div className="mt-2">
            <img
              src={previewSrc}
              alt="Preview"
              style={{
                width: sec.endpoint === "socios" ? 120 : 80,
                height: sec.endpoint === "socios" ? 82 : 80,
                borderRadius: config.shape,
                objectFit: "cover",
                border: "1px solid #e5d9f2",
                background: "#f8f5fc",
              }}
              onError={(e) => {
                e.currentTarget.src = config.fallback;
              }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="db-root">
      <AdminHeader />

      {sidebarOpen && (
        <div
          className="db-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      )}

      <div className="db-layout">
        <aside className="db-sidebar db-sidebar--desktop">
          <SidebarNav />
        </aside>

        <aside className={`db-sidebar db-sidebar--mobile ${sidebarOpen ? "open" : ""}`}>
          <SidebarNav onSelect={() => setSidebarOpen(false)} />
        </aside>

        <main className="db-main">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="db-alert">
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="db-alert">
              {success}
            </Alert>
          )}

          <div className="db-card">
            <div className="db-card-head">
              <div className="db-card-title">
                <button
                  type="button"
                  className="db-tab-toggle d-md-none"
                  onClick={() => setSidebarOpen((v) => !v)}
                >
                  {React.createElement(sec.icon, { size: 18 })}
                  <span>{sec.title}</span>
                  <ChevronRight size={14} />
                </button>

                <h5 className="db-card-h d-none d-md-flex">
                  {React.createElement(sec.icon, { size: 20 })}
                  {sec.title}
                </h5>

                <span className="db-count">{filtered.length}</span>
              </div>

              <div className="db-card-actions">
                <button className="db-btn db-btn--ghost" onClick={refreshAllData} type="button">
                  <RefreshCw size={16} />
                </button>

                <button className="db-btn db-btn--ghost" onClick={handleExport} type="button">
                  <Download size={16} />
                </button>

                <button className="db-btn db-btn--primary" onClick={handleCreate} type="button">
                  <Plus size={16} />
                  <span className="db-btn-label">Crear</span>
                </button>
              </div>
            </div>

            <div className="db-search-wrap">
              <Search size={16} className="db-search-icon" />

              <input
                className="db-search"
                placeholder={`Buscar en ${sec.title.toLowerCase()}…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button className="db-search-clear" onClick={() => setSearch("")} type="button">
                  <X size={14} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="db-loading">
                <div className="db-spinner" />
                <p>Cargando…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="db-empty">
                {React.createElement(sec.icon, { size: 48, opacity: 0.3 })}
                <p>Sin registros{search ? ` para "${search}"` : ""}</p>
              </div>
            ) : (
              <>
                <div className="db-table-wrap d-none d-md-block">
                  <table className="db-table">
                    <thead>
                      <tr>
                        {sec.columns.map((col) => (
                          <th key={col}>{col === "foto" ? "Foto" : col}</th>
                        ))}
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filtered.map((item) => (
                        <tr key={item.id}>
                          {sec.columns.map((col) => (
                            <td key={col}>
                              <CellValue
                                col={col}
                                value={item[col]}
                                fkData={getFkDataForCol(col)}
                                section={sec.endpoint}
                                item={item}
                                onImageClick={openImageModal}
                                refreshKey={refreshKey}
                              />
                            </td>
                          ))}

                          <td className="db-actions-cell">
                            <button className="db-icon-btn info" onClick={() => handleDetail(item)} type="button">
                              <Eye size={14} />
                            </button>

                            <button className="db-icon-btn edit" onClick={() => handleEdit(item)} type="button">
                              <Edit2 size={14} />
                            </button>

                            <button className="db-icon-btn del" onClick={() => handleDelete(item.id)} type="button">
                              <Trash2 size={14} />
                            </button>

                            {activeTab === "ubicaciones" && item.ubicacion && (
                              <button className="db-icon-btn map" onClick={() => openMap(item.ubicacion)} type="button">
                                <MapPin size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="db-mobile-list d-md-none">
                  {filtered.map((item) => {
                    const imgSrc = withRefresh(getImageSrc(sec.endpoint, item), refreshKey);

                    return (
                      <div className="db-mobile-card" key={item.id}>
                        <div className="db-mc-icon" onClick={() => openImageModal(imgSrc, getImageAlt(sec.endpoint, item))}>
                          <img
                            src={imgSrc}
                            alt={getImageAlt(sec.endpoint, item)}
                            style={{
                              width: 48,
                              height: 48,
                              borderRadius: sec.endpoint === "socios" ? 14 : "50%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = getFallbackImage(sec.endpoint);
                            }}
                          />
                        </div>

                        <div className="db-mc-body" onClick={() => handleDetail(item)}>
                          <p className="db-mc-primary">
                            {sec.endpoint === "usuarios"
                              ? `${item.nombre || ""} ${item.apellido || ""}`
                              : sec.endpoint === "socios"
                                ? item.nombre_local || `${item.nombre || ""} ${item.apellido || ""}`.trim()
                                : item.nombre || item.titulo || `ID ${item.id}`}
                          </p>

                          <p className="db-mc-secondary">
                            {sec.endpoint === "usuarios"
                              ? item.email
                              : sec.endpoint === "mascotas"
                                ? item.sexo == 0 ? "Macho" : "Hembra"
                                : sec.endpoint === "socios"
                                  ? `${item.tipo_servicio || "Servicio"} · ${item.whatsapp || "Sin WhatsApp"}`
                                  : `ID: ${item.id}`}
                          </p>
                        </div>

                        <div className="db-mc-actions">
                          <button className="db-icon-btn edit" onClick={() => handleEdit(item)} type="button">
                            <Edit2 size={14} />
                          </button>

                          <button className="db-icon-btn del" onClick={() => handleDelete(item.id)} type="button">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <Modal
        show={showModal}
        onHide={closeMainModal}
        onExited={cleanupModalEffects}
        backdrop="static"
        keyboard={!uploading}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton={!uploading} className="db-modal-head">
          <Modal.Title>
            {modalMode === "create" ? "Crear" : "Editar"} {sec.title}
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSave}>
          <Modal.Body className="db-modal-body">
            <div className="db-form-grid">
              {sec.fields.map((field) => {
                const locked = modalMode === "edit" && field.readonlyOnEdit;

                return (
                  <div
                    key={field.name}
                    className={`db-form-group ${field.type === "textarea" ? "full" : ""}`}
                  >
                    <label className="db-label">
                      {field.label}
                      {field.required && <span className="db-required">*</span>}
                      {field.name === "password" && modalMode === "edit" && (
                        <span className="text-muted"> (dejar vacío para no cambiar)</span>
                      )}
                      {locked && <span className="db-locked-badge">🔒 no editable</span>}
                    </label>

                    {renderField(field)}
                  </div>
                );
              })}

              {renderImageUpload()}
            </div>
          </Modal.Body>

          <Modal.Footer className="db-modal-foot">
            <button
              type="button"
              className="db-btn db-btn--ghost"
              onClick={closeMainModal}
              disabled={uploading}
            >
              <X size={15} /> Cancelar
            </button>

            <button type="submit" className="db-btn db-btn--primary" disabled={uploading}>
              <Save size={15} /> {uploading ? "Guardando..." : "Guardar"}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      <Modal
        show={showDetail}
        onHide={closeDetailModal}
        onExited={cleanupModalEffects}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton className="db-modal-head">
          <Modal.Title>Detalle · {sec.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body className="db-modal-body">
          {detailItem && (
            <div className="db-detail-grid">
              {["usuarios", "mascotas", "socios"].includes(sec.endpoint) && (
                <div className="db-detail-row">
                  <span className="db-detail-label">Imagen</span>
                  <span className="db-detail-val">
                    <img
                      src={withRefresh(getImageSrc(sec.endpoint, detailItem), refreshKey)}
                      alt={getImageAlt(sec.endpoint, detailItem)}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: sec.endpoint === "socios" ? 16 : "50%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                      onClick={() => openImageModal(getImageSrc(sec.endpoint, detailItem), getImageAlt(sec.endpoint, detailItem))}
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(sec.endpoint);
                      }}
                    />
                  </span>
                </div>
              )}

              {sec.fields.map((field) => (
                <div key={field.name} className="db-detail-row">
                  <span className="db-detail-label">{field.label}</span>
                  <span className="db-detail-val">
                    {resolveDetailValue(field, detailItem[field.name])}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="db-modal-foot">
          <button className="db-btn db-btn--ghost" onClick={closeDetailModal} type="button">
            <X size={15} /> Cerrar
          </button>

          {detailItem && (
            <button
              className="db-btn db-btn--primary"
              type="button"
              onClick={() => {
                closeDetailModal();
                handleEdit(detailItem);
              }}
            >
              <Edit2 size={15} /> Editar
            </button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal
        show={showMapModal}
        onHide={closeMapModal}
        onExited={cleanupModalEffects}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="db-modal-head">
          <Modal.Title>Ubicación registrada</Modal.Title>
        </Modal.Header>

        <Modal.Body className="db-modal-body" style={{ padding: 0 }}>
          {mapCoordinates.lat && mapCoordinates.lng && (
            <iframe
              title="mapa"
              width="100%"
              height="400"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoordinates.lng - 0.01},${mapCoordinates.lat - 0.01},${mapCoordinates.lng + 0.01},${mapCoordinates.lat + 0.01}&layer=mapnik&marker=${mapCoordinates.lat},${mapCoordinates.lng}`}
              allowFullScreen
            />
          )}
        </Modal.Body>

        <Modal.Footer className="db-modal-foot">
          <button className="db-btn db-btn--ghost" onClick={closeMapModal} type="button">
            <X size={15} /> Cerrar
          </button>

          <a
            href={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="db-btn db-btn--primary"
          >
            <MapPin size={15} /> Abrir en Google Maps
          </a>
        </Modal.Footer>
      </Modal>

      {imageModal.show && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "pointer",
            padding: 20,
          }}
          onClick={closeImageModal}
          role="presentation"
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                display: "block",
                borderRadius: 14,
              }}
              onError={(e) => {
                e.currentTarget.src = "/icono.png";
              }}
            />

            <button
              type="button"
              onClick={closeImageModal}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: 0,
                background: "rgba(0,0,0,.65)",
                color: "#fff",
                fontSize: 24,
                lineHeight: "40px",
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}