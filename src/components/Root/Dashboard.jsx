import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, Form, Badge, Alert } from 'react-bootstrap';
import {
  Users, Dog, Tag, Phone, Calendar, MapPin, Stethoscope,
  Plus, Edit2, Trash2, Save, X, Eye, Search, Download,
  RefreshCw, ChevronRight, Link as LinkIcon
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import './dashboard.css';

const API_URL = 'http://localhost/api-smartpet/index.php';

/* ─────────────────────────────────────────────────────────────
   SECCIONES (igual que antes)
───────────────────────────────────────────────────────────── */
const SECTIONS = {
  usuarios: {
    title: 'Usuarios', icon: Users, endpoint: 'usuarios',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'apellido', label: 'Apellido', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'password', label: 'Contraseña', type: 'password', required: true, hideOnEdit: false },
      { name: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date', required: true },
      { name: 'recibir_emails', label: 'Recibir Emails', type: 'checkbox' },
    ],
    columns: ['foto', 'nombre', 'apellido', 'email', 'fecha_nacimiento'],
  },
  mascotas: {
    title: 'Mascotas', icon: Dog, endpoint: 'mascotas',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date', required: true },
      {
        name: 'sexo', label: 'Sexo', type: 'select', required: true,
        options: [{ value: 0, label: 'Macho' }, { value: 1, label: 'Hembra' }]
      },
      { name: 'descripcion', label: 'Descripción', type: 'textarea' },
      { name: 'direccion', label: 'Dirección', type: 'textarea' },
      {
        name: 'id_usuario', label: 'Usuario', type: 'fk_select', required: true,
        fkEndpoint: 'usuarios',
        fkLabel: (u) => `${u.nombre} ${u.apellido} — ${u.email}`,
        fkValue: 'id', readonlyOnEdit: true
      },
      {
        name: 'codigo_unico', label: 'Código QR/NFC', type: 'text', required: true,
        pattern: '[A-Z]{4}[0-9]{4}', placeholder: 'ABCD1234', readonlyOnEdit: true
      },
      { name: 'mensajeRescate', label: 'Mensaje Rescate', type: 'textarea' },
      { name: 'persona1', label: 'Persona 1', type: 'text' },
      { name: 'persona1tel', label: 'Tel Persona 1', type: 'tel' },
      { name: 'persona2', label: 'Persona 2', type: 'text' },
      { name: 'persona2tel', label: 'Tel Persona 2', type: 'tel' },
    ],
    columns: ['foto', 'nombre', 'id_usuario', 'codigo_id', 'sexo'],
    fkColumns: {
      id_usuario: { endpoint: 'usuarios', label: (u) => `${u.nombre} ${u.apellido}` },
      codigo_id: { endpoint: 'codigos', label: (c) => c.codigo_unico },
    },
  },
  codigos: {
    title: 'Códigos', icon: Tag, endpoint: 'codigos',
    fields: [
      {
        name: 'codigo_unico', label: 'Código Único', type: 'text', required: true,
        pattern: '[A-Z]{4}[0-9]{4}', placeholder: 'ABCD1234', readonlyOnEdit: true
      },
    ],
    columns: ['id', 'codigo_unico'],
  },
  contactos: {
    title: 'Contactos', icon: Phone, endpoint: 'contactos',
    fields: [
      {
        name: 'id_mascota', label: 'Mascota', type: 'fk_select', required: true,
        fkEndpoint: 'mascotas',
        fkLabel: (m) => `${m.nombre} (ID ${m.id})`,
        fkValue: 'id', readonlyOnEdit: true
      },
      {
        name: 'tipo', label: 'Tipo', type: 'select', required: true,
        options: [
          { value: 'veterinario', label: 'Veterinario' },
          { value: 'paseador', label: 'Paseador' },
          { value: 'peluquero', label: 'Peluquero' },
          { value: 'guarderia', label: 'Guardería' },
          { value: 'otro', label: 'Otro' },
        ]
      },
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'apellido', label: 'Apellido', type: 'text' },
      { name: 'celular', label: 'Celular', type: 'tel' },
      { name: 'telefono_fijo', label: 'Tel. Fijo', type: 'tel' },
      { name: 'direccion', label: 'Dirección', type: 'text' },
      { name: 'horarios', label: 'Horarios', type: 'text' },
      { name: 'dias_atencion', label: 'Días Atención', type: 'text' },
      { name: 'notas', label: 'Notas', type: 'textarea' },
      { name: 'favorito', label: 'Favorito', type: 'checkbox' },
    ],
    columns: ['id', 'id_mascota', 'nombre', 'tipo', 'celular'],
    fkColumns: {
      id_mascota: { endpoint: 'mascotas', label: (m) => m.nombre },
    },
  },
  historial: {
    title: 'Historial', icon: Calendar, endpoint: 'historial',
    fields: [
      {
        name: 'id_mascota', label: 'Mascota', type: 'fk_select', required: true,
        fkEndpoint: 'mascotas',
        fkLabel: (m) => `${m.nombre} (ID ${m.id})`,
        fkValue: 'id', readonlyOnEdit: true
      },
      {
        name: 'tipo_evento', label: 'Tipo', type: 'select', required: true,
        options: [
          { value: 'cita', label: 'Cita' },
          { value: 'vacuna', label: 'Vacuna' },
          { value: 'bitacora', label: 'Bitácora' },
        ]
      },
      { name: 'titulo', label: 'Título', type: 'text', required: true },
      { name: 'fecha_evento', label: 'Fecha Evento', type: 'date', required: true },
      { name: 'proxima_fecha', label: 'Próxima Fecha', type: 'date' },
      { name: 'nota', label: 'Nota', type: 'textarea', required: true },
      { name: 'laboratorio', label: 'Laboratorio', type: 'text' },
      { name: 'lote', label: 'Lote', type: 'text' },
      { name: 'completada', label: 'Completada', type: 'checkbox' },
      { name: 'recordatorio', label: 'Recordatorio', type: 'checkbox' },
    ],
    columns: ['id', 'id_mascota', 'titulo', 'tipo_evento', 'fecha_evento'],
    fkColumns: {
      id_mascota: { endpoint: 'mascotas', label: (m) => m.nombre },
    },
  },
  socios: {
    title: 'Socios SmartPet', icon: Stethoscope, endpoint: 'socios',
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'apellido', label: 'Apellido', type: 'text', required: true },
      { name: 'nombre_local', label: 'Nombre del local', type: 'text', required: true },
      {
        name: 'tipo_servicio', label: 'Tipo de servicio', type: 'select', required: true,
        options: [
          { value: 'veterinaria', label: 'Veterinaria' },
          { value: 'paseador', label: 'Paseador' },
          { value: 'petshop', label: 'Petshop' },
          { value: 'guarderia', label: 'Guardería' },
          { value: 'peluqueria', label: 'Peluquería' },
          { value: 'otros', label: 'Otros' },
        ]
      },
      { name: 'whatsapp', label: 'WhatsApp', type: 'tel', required: true, placeholder: 'Ej: 5491123456789' },
      { name: 'dias_atencion', label: 'Días de atención', type: 'text', required: true, placeholder: 'Lunes a Viernes' },
      { name: 'horarios_atencion', label: 'Horarios', type: 'text', required: true, placeholder: '9:00 - 18:00' },
      { name: 'servicio_24h', label: 'Servicio 24 horas', type: 'checkbox' },
      { name: 'emergencias', label: 'Atención de emergencias', type: 'checkbox' },
    ],
    columns: ['id', 'nombre', 'apellido', 'nombre_local', 'tipo_servicio', 'whatsapp'],
  },
  ubicaciones: {
    title: 'Ubicaciones', icon: MapPin, endpoint: 'ubicaciones',
    fields: [
      {
        name: 'id_mascota', label: 'Mascota', type: 'fk_select', required: true,
        fkEndpoint: 'mascotas',
        fkLabel: (m) => `${m.nombre} (ID ${m.id})`,
        fkValue: 'id', readonlyOnEdit: true
      },
      {
        name: 'ubicacion', label: 'Coordenadas (lat,lng)', type: 'text', required: true,
        placeholder: '-30.766238,-57.984069'
      },
    ],
    columns: ['id', 'id_mascota', 'ubicacion', 'fecha_hora'],
    fkColumns: {
      id_mascota: { endpoint: 'mascotas', label: (m) => m.nombre },
    },
  },
};

const BOOL_COLS = new Set(['favorito', 'completada', 'recordatorio', 'recibir_emails', 'servicio_24h', 'emergencias']);

// Componente para mostrar imagen en tabla (con clic para ampliar y timestamp para forzar refresco)
function ImageCell({ section, item, onImageClick, refreshKey }) {
  let src = '';
  let alt = '';
  if (section === 'usuarios') {
    src = item.foto_perfil || '/default.jpg';
    alt = `Foto de ${item.nombre}`;
  } else if (section === 'mascotas') {
    src = item.urlImg && item.urlImg.trim() !== '' ? item.urlImg : '/a.jpg';
    alt = `Foto de ${item.nombre}`;
  } else {
    return <span>—</span>;
  }
  // Añadir timestamp para evitar caché
  const imageUrl = src + (src.includes('?') ? `&_=${refreshKey}` : `?_=${refreshKey}`);
  return (
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onImageClick(src, alt);
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = section === 'usuarios' ? '/default.jpg' : '/a.jpg';
        }}
      />
    </div>
  );
}

/* ── CellValue ── */
function CellValue({ col, value, fkData, section, item, onImageClick, refreshKey }) {
  if (col === 'foto') {
    return <ImageCell section={section} item={item} onImageClick={onImageClick} refreshKey={refreshKey} />;
  }
  if (col === 'sexo') return value == 0 ? 'Macho' : 'Hembra';
  if (BOOL_COLS.has(col)) return (
    <Badge bg={value == 1 ? 'success' : 'secondary'} className="ds-badge">
      {value == 1 ? 'Sí' : 'No'}
    </Badge>
  );
  if (fkData?.data) {
    const found = fkData.data.find(r => String(r.id) === String(value));
    if (found) return (
      <span className="db-fk-chip">
        <LinkIcon size={11} />
        {fkData.label(found)}
      </span>
    );
  }
  return <>{value ?? '-'}</>;
}

/* ── FkSelectField (sin cambios) ── */
function FkSelectField({ field, value, fkCatalog, disabled }) {
  const options = fkCatalog[field.fkEndpoint] || [];
  return (
    <div className={`db-fk-wrap ${disabled ? 'db-fk-wrap--locked' : ''}`}>
      <select
        name={field.name}
        defaultValue={value}
        required={!disabled && field.required}
        disabled={disabled}
        className="db-fk-select form-select"
      >
        <option value="">Seleccionar…</option>
        {options.map(opt => (
          <option key={opt[field.fkValue]} value={opt[field.fkValue]}>
            {field.fkLabel(opt)}
          </option>
        ))}
      </select>
      {disabled && <input type="hidden" name={field.name} value={value} />}
    </div>
  );
}

/* ════════════════════════════════════════════════
   DASHBOARD PRINCIPAL
════════════════════════════════════════════════ */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentItem, setCurrentItem] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState('');
  const [fkCatalog, setFkCatalog] = useState({});
  const [refreshKey, setRefreshKey] = useState(Date.now()); // Para forzar refresco de imágenes

  // Mapa
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: null, lng: null });

  // Modal para ampliar imagen
  const [imageModal, setImageModal] = useState({ show: false, src: '', alt: '' });

  // Estados para subir fotos
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const sec = SECTIONS[activeTab];

  const openMap = (ubicacionStr) => {
    if (!ubicacionStr) return;
    const parts = ubicacionStr.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setMapCoordinates({ lat, lng });
        setShowMapModal(true);
      } else {
        setError('Coordenadas inválidas');
      }
    } else {
      setError('Formato de ubicación incorrecto (esperado: lat,lng)');
    }
  };

  const openImageModal = (src, alt) => {
    setImageModal({ show: true, src, alt });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, src: '', alt: '' });
  };

  // Función para recargar todos los datos (tabla y catálogos) y forzar refresco visual
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Recargar datos de la sección actual
      const r = await axios.post(API_URL, { action: `get${sec.endpoint}` });
      setData(Array.isArray(r.data) ? r.data : []);

      // Recargar catálogos FK importantes (usuarios y códigos)
      if (sec.endpoint === 'usuarios' || sec.endpoint === 'mascotas') {
        const usuariosRes = await axios.post(API_URL, { action: 'getusuarios' });
        if (Array.isArray(usuariosRes.data)) setFkCatalog(prev => ({ ...prev, usuarios: usuariosRes.data }));
        const codigosRes = await axios.post(API_URL, { action: 'getcodigos' });
        if (Array.isArray(codigosRes.data)) setFkCatalog(prev => ({ ...prev, codigos: codigosRes.data }));
      }

      // Cambiar refreshKey para forzar recarga de imágenes
      setRefreshKey(Date.now());
    } catch (e) {
      setError('Error al refrescar datos: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [sec.endpoint]);

  // loadData tradicional (similar pero sin forzar refreshKey)
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.post(API_URL, { action: `get${sec.endpoint}` });
      setData(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      setError('Error al cargar: ' + e.message);
      setData([]);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => { loadData(); }, [loadData]);

  // Cargar catálogos FK al cambiar de sección
  useEffect(() => {
    const needed = new Set();
    sec.fields.filter(f => f.type === 'fk_select').forEach(f => needed.add(f.fkEndpoint));
    if (sec.fkColumns) Object.values(sec.fkColumns).forEach(fc => needed.add(fc.endpoint));

    needed.forEach(async (ep) => {
      if (fkCatalog[ep]) return;
      try {
        const r = await axios.post(API_URL, { action: `get${ep}` });
        if (Array.isArray(r.data))
          setFkCatalog(prev => ({ ...prev, [ep]: r.data }));
      } catch { /* silencioso */ }
    });
  }, [activeTab]);

  /* ── Auto-dismiss ── */
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(null), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  /* ── CRUD ── */
  const handleCreate = () => {
    setModalMode('create');
    setCurrentItem({});
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setPetImageFile(null);
    setPetImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setProfileImageFile(null);
    setProfileImagePreview(null);
    setPetImageFile(null);
    setPetImagePreview(null);
    // Para mascotas, precargar el código actual
    if (sec.endpoint === 'mascotas' && item.codigo_id) {
      const codigoObj = fkCatalog['codigos']?.find(c => c.id === item.codigo_id);
      if (codigoObj) {
        setCurrentItem(prev => ({ ...prev, codigo_unico: codigoObj.codigo_unico }));
      }
    }
    setShowModal(true);
  };

  const handleDetail = (item) => { setDetailItem(item); setShowDetail(true); };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try {
      await axios.post(API_URL, { action: `delete${sec.endpoint.slice(0, -1)}`, id });
      setSuccess('Registro eliminado');
      await refreshAllData(); // Refrescar todo después de eliminar
    } catch (e) { setError('Error al eliminar: ' + e.message); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    const fd = new FormData(e.target);
    let body = Object.fromEntries(fd);

    // checkboxes
    sec.fields.forEach(f => {
      if (f.type === 'checkbox') body[f.name] = fd.get(f.name) ? 1 : 0;
    });

    try {
      let savedId = currentItem.id;
      let action = modalMode === 'create' ? `create${sec.endpoint.slice(0, -1)}` : `update${sec.endpoint.slice(0, -1)}`;

      if (modalMode === 'create') {
        const createRes = await axios.post(API_URL, { action, ...body });
        if (createRes.data && createRes.data.id) savedId = createRes.data.id;
        else throw new Error('No se pudo crear el registro');
      } else {
        body.id = currentItem.id;
        if (sec.endpoint === 'usuarios' && (!body.password || body.password === '')) delete body.password;
        if (sec.endpoint === 'mascotas') delete body.codigo_unico;
        await axios.post(API_URL, { action, ...body });
      }

      // Subir foto si corresponde
      if (sec.endpoint === 'usuarios' && profileImageFile) {
        const formData = new FormData();
        formData.append('imagen', profileImageFile);
        await axios.post(`${API_URL}/upload-perfil/${savedId}`, formData);
      } else if (sec.endpoint === 'mascotas' && petImageFile) {
        const formData = new FormData();
        formData.append('imagen', petImageFile);
        await axios.post(`${API_URL}/upload-imagen/${savedId}`, formData);
      }

      setSuccess(`Registro ${modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`);
      setShowModal(false);
      // Refrescar todos los datos después de guardar
      await refreshAllData();
    } catch (err) {
      console.error(err);
      setError('Error al guardar: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      sec.columns.join(','),
      ...filtered.map(r => sec.columns.map(c => r[c]).join(','))
    ].join('\n');
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([csv], { type: 'text/csv' })),
      download: `${sec.title}_${new Date().toISOString().slice(0, 10)}.csv`,
    }).click();
  };

  /* ── Render field ── */
  const renderField = (field) => {
    if (modalMode === 'edit' && field.hideOnEdit) return null;
    let val = currentItem[field.name] ?? '';
    if (field.name === 'password' && modalMode === 'edit') val = '';
    const locked = modalMode === 'edit' && (field.readonlyOnEdit === true);

    // Para mascotas en edición, mostrar código como solo lectura
    if (sec.endpoint === 'mascotas' && modalMode === 'edit' && field.name === 'codigo_unico') {
      const codigoObj = fkCatalog['codigos']?.find(c => c.id === currentItem.codigo_id);
      val = codigoObj?.codigo_unico || '';
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

    if (field.type === 'fk_select') {
      return <FkSelectField field={field} value={val} fkCatalog={fkCatalog} disabled={locked} />;
    }

    switch (field.type) {
      case 'textarea':
        return <Form.Control as="textarea" rows={3} name={field.name} defaultValue={val}
          required={field.required} placeholder={field.placeholder}
          readOnly={locked} className={locked ? 'db-field-locked' : ''} />;
      case 'select':
        return (
          <Form.Select name={field.name} defaultValue={val} required={field.required} disabled={locked}>
            <option value="">Seleccionar…</option>
            {field.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Form.Select>
        );
      case 'checkbox':
        return <Form.Check type="checkbox" name={field.name} defaultChecked={val == 1} disabled={locked} />;
      default:
        return <Form.Control type={field.type} name={field.name} defaultValue={val}
          required={field.required} pattern={field.pattern} placeholder={field.placeholder}
          readOnly={locked} className={locked ? 'db-field-locked' : ''} />;
    }
  };

  const getFkDataForCol = (col) => {
    const fc = sec.fkColumns?.[col];
    if (!fc) return null;
    return { data: fkCatalog[fc.endpoint], label: fc.label };
  };

  const resolveDetailValue = (field, value) => {
    if (field.type === 'fk_select') {
      const opts = fkCatalog[field.fkEndpoint] || [];
      const found = opts.find(o => String(o[field.fkValue]) === String(value));
      return found ? (
        <span className="db-fk-chip">
          <LinkIcon size={11} />
          {field.fkLabel(found)}
          <small className="db-fk-id"> (ID: {value})</small>
        </span>
      ) : (value ?? '-');
    }
    return <CellValue col={field.name} value={value} section={sec.endpoint} item={detailItem} onImageClick={openImageModal} refreshKey={refreshKey} />;
  };

  const filtered = data.filter(item =>
    !search || sec.columns.some(c => String(item[c] ?? '').toLowerCase().includes(search.toLowerCase()))
  );

  const SidebarNav = ({ onSelect }) => (
    <nav className="db-sidebar-nav">
      {Object.entries(SECTIONS).map(([key, s]) => {
        const Icon = s.icon;
        return (
          <button key={key}
            className={`db-sidebar-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => { setActiveTab(key); setSearch(''); onSelect?.(); }}
          >
            <Icon size={18} />
            <span>{s.title}</span>
            <ChevronRight size={14} className="db-sidebar-arrow" />
          </button>
        );
      })}
    </nav>
  );

  /* ════════════ RENDER (igual que antes, pasando refreshKey a CellValue) ════════════ */
  return (
    <div className="db-root">
      <AdminHeader />

      {sidebarOpen && <div className="db-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <div className="db-layout">
        <aside className="db-sidebar db-sidebar--desktop"><SidebarNav /></aside>
        <aside className={`db-sidebar db-sidebar--mobile ${sidebarOpen ? 'open' : ''}`}>
          <SidebarNav onSelect={() => setSidebarOpen(false)} />
        </aside>

        <main className="db-main">
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)} className="db-alert">{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="db-alert">{success}</Alert>}

          <div className="db-card">
            <div className="db-card-head">
              <div className="db-card-title">
                <button className="db-tab-toggle d-md-none" onClick={() => setSidebarOpen(v => !v)}>
                  {React.createElement(sec.icon, { size: 18 })}
                  <span>{sec.title}</span>
                  <ChevronRight size={14} style={{ transform: sidebarOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }} />
                </button>
                <h5 className="db-card-h d-none d-md-flex">
                  {React.createElement(sec.icon, { size: 20 })}
                  {sec.title}
                </h5>
                <span className="db-count">{filtered.length}</span>
              </div>
              <div className="db-card-actions">
                <button className="db-btn db-btn--ghost" onClick={refreshAllData} title="Refrescar"><RefreshCw size={16} /></button>
                <button className="db-btn db-btn--ghost" onClick={handleExport} title="CSV"><Download size={16} /></button>
                <button className="db-btn db-btn--primary" onClick={handleCreate}>
                  <Plus size={16} /><span className="db-btn-label">Crear</span>
                </button>
              </div>
            </div>

            <div className="db-search-wrap">
              <Search size={16} className="db-search-icon" />
              <input className="db-search"
                placeholder={`Buscar en ${sec.title.toLowerCase()}…`}
                value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button className="db-search-clear" onClick={() => setSearch('')}><X size={14} /></button>
              )}
            </div>

            {loading ? (
              <div className="db-loading"><div className="db-spinner" /><p>Cargando…</p></div>
            ) : filtered.length === 0 ? (
              <div className="db-empty">
                {React.createElement(sec.icon, { size: 48, opacity: .3 })}
                <p>Sin registros{search ? ` para "${search}"` : ''}</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="db-table-wrap d-none d-md-block">
                  <table className="db-table">
                    <thead>
                      <tr>
                        {sec.columns.map(c => <th key={c}>{c === 'foto' ? 'Foto' : c}</th>)}
                        <th className="text-end">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id}>
                          {sec.columns.map(c => (
                            <td key={c}>
                              <CellValue col={c} value={item[c]} fkData={getFkDataForCol(c)} section={sec.endpoint} item={item} onImageClick={openImageModal} refreshKey={refreshKey} />
                            </td>
                          ))}
                          <td className="db-actions-cell">
                            <button className="db-icon-btn info" onClick={() => handleDetail(item)} title="Ver"><Eye size={14} /></button>
                            <button className="db-icon-btn edit" onClick={() => handleEdit(item)} title="Editar"><Edit2 size={14} /></button>
                            <button className="db-icon-btn del" onClick={() => handleDelete(item.id)} title="Eliminar"><Trash2 size={14} /></button>
                            {activeTab === 'ubicaciones' && item.ubicacion && (
                              <button className="db-icon-btn map" onClick={() => openMap(item.ubicacion)} title="Ver en mapa" style={{ backgroundColor: '#10b981' }}>
                                <MapPin size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="db-mobile-list d-md-none">
                  {filtered.map(item => {
                    let imgSrc = '';
                    if (sec.endpoint === 'usuarios') {
                      imgSrc = item.foto_perfil || '/default.jpg';
                    } else if (sec.endpoint === 'mascotas') {
                      imgSrc = item.urlImg && item.urlImg.trim() !== '' ? item.urlImg : '/a.jpg';
                    }
                    const imageUrl = imgSrc + (imgSrc.includes('?') ? `&_=${refreshKey}` : `?_=${refreshKey}`);
                    return (
                      <div className="db-mobile-card" key={item.id}>
                        <div
                          className="db-mc-icon"
                          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                          onClick={() => openImageModal(imgSrc, `Foto de ${item.nombre || item.email}`)}
                        >
                          <img
                            src={imageUrl}
                            alt="avatar"
                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = sec.endpoint === 'usuarios' ? '/default.jpg' : '/a.jpg';
                            }}
                          />
                        </div>
                        <div className="db-mc-body" onClick={() => handleDetail(item)}>
                          <p className="db-mc-primary">
                            {sec.endpoint === 'usuarios' ? `${item.nombre} ${item.apellido}` : item.nombre}
                          </p>
                          <p className="db-mc-secondary">
                            {sec.endpoint === 'usuarios' ? item.email : (item.sexo == 0 ? 'Macho' : 'Hembra')}
                          </p>
                          <p className="db-mc-id">ID: {item.id}</p>
                        </div>
                        <div className="db-mc-actions">
                          <button className="db-icon-btn edit" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                          <button className="db-icon-btn del" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                          {activeTab === 'ubicaciones' && item.ubicacion && (
                            <button className="db-icon-btn map" onClick={() => openMap(item.ubicacion)} title="Ver mapa">
                              <MapPin size={14} />
                            </button>
                          )}
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

      {/* Modal CRUD (igual que antes, sin cambios) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered scrollable>
        <Modal.Header closeButton className="db-modal-head">
          <Modal.Title>{modalMode === 'create' ? 'Crear' : 'Editar'} {sec.title}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body className="db-modal-body">
            <div className="db-form-grid">
              {sec.fields.map(field => {
                if (modalMode === 'edit' && field.hideOnEdit) return null;
                const locked = modalMode === 'edit' && field.readonlyOnEdit;
                return (
                  <div key={field.name}
                    className={`db-form-group ${field.type === 'textarea' ? 'full' : ''}`}>
                    <label className="db-label">
                      {field.label}
                      {field.required && modalMode === 'create' && <span className="db-required">*</span>}
                      {field.name === 'password' && modalMode === 'edit' && <span className="text-muted"> (dejar vacío para no cambiar)</span>}
                      {locked && <span className="db-locked-badge">🔒 no editable</span>}
                    </label>
                    {renderField(field)}
                  </div>
                );
              })}
              {/* Campo para foto de perfil (usuarios) */}
              {sec.endpoint === 'usuarios' && (
                <div className="db-form-group full">
                  <label className="db-label">Foto de perfil</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setProfileImageFile(file);
                        setProfileImagePreview(URL.createObjectURL(file));
                      } else {
                        setProfileImageFile(null);
                        setProfileImagePreview(null);
                      }
                    }}
                    className="form-control"
                  />
                  {(profileImagePreview || currentItem.foto_perfil) && (
                    <div className="mt-2">
                      <img
                        src={profileImagePreview || currentItem.foto_perfil}
                        alt="Preview"
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              )}
              {/* Campo para foto de mascota */}
              {sec.endpoint === 'mascotas' && (
                <div className="db-form-group full">
                  <label className="db-label">Foto de la mascota</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPetImageFile(file);
                        setPetImagePreview(URL.createObjectURL(file));
                      } else {
                        setPetImageFile(null);
                        setPetImagePreview(null);
                      }
                    }}
                    className="form-control"
                  />
                  {(petImagePreview || currentItem.urlImg) && (
                    <div className="mt-2">
                      <img
                        src={petImagePreview || currentItem.urlImg}
                        alt="Preview"
                        style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="db-modal-foot">
            <button type="button" className="db-btn db-btn--ghost" onClick={() => setShowModal(false)} disabled={uploading}>
              <X size={15} /> Cancelar
            </button>
            <button type="submit" className="db-btn db-btn--primary" disabled={uploading}>
              <Save size={15} /> {uploading ? 'Guardando...' : 'Guardar'}
            </button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Detalle (sin cambios, pero también pasa refreshKey) */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered scrollable>
        <Modal.Header closeButton className="db-modal-head">
          <Modal.Title>Detalle · {sec.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="db-modal-body">
          {detailItem && (
            <div className="db-detail-grid">
              {sec.fields.map(f => {
                if (sec.endpoint === 'mascotas' && f.name === 'codigo_unico') {
                  const codigoObj = fkCatalog['codigos']?.find(c => c.id === detailItem.codigo_id);
                  return (
                    <div key="codigo_unico" className="db-detail-row">
                      <span className="db-detail-label">Código QR/NFC</span>
                      <span className="db-detail-val">{codigoObj?.codigo_unico || detailItem.codigo_id}</span>
                    </div>
                  );
                }
                return (
                  <div key={f.name} className="db-detail-row">
                    <span className="db-detail-label">{f.label}</span>
                    <span className="db-detail-val">
                      {resolveDetailValue(f, detailItem[f.name])}
                    </span>
                  </div>
                );
              })}
              {/* Ampliar foto en detalle */}
              {sec.endpoint === 'usuarios' && detailItem.foto_perfil && (
                <div className="db-detail-row">
                  <span className="db-detail-label">Foto de perfil</span>
                  <span className="db-detail-val">
                    <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => openImageModal(detailItem.foto_perfil, `Foto de ${detailItem.nombre}`)}>
                      <img src={detailItem.foto_perfil} alt="perfil" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  </span>
                </div>
              )}
              {sec.endpoint === 'mascotas' && detailItem.urlImg && (
                <div className="db-detail-row">
                  <span className="db-detail-label">Foto de mascota</span>
                  <span className="db-detail-val">
                    <div style={{ cursor: 'pointer', display: 'inline-block' }} onClick={() => openImageModal(detailItem.urlImg, `Foto de ${detailItem.nombre}`)}>
                      <img src={detailItem.urlImg} alt="mascota" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                  </span>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="db-modal-foot">
          <button className="db-btn db-btn--ghost" onClick={() => setShowDetail(false)}>
            <X size={15} /> Cerrar
          </button>
          {detailItem && (
            <button className="db-btn db-btn--primary" onClick={() => { setShowDetail(false); handleEdit(detailItem); }}>
              <Edit2 size={15} /> Editar
            </button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal Mapa (igual) */}
      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="lg" centered>
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
          <button className="db-btn db-btn--ghost" onClick={() => setShowMapModal(false)}><X size={15} /> Cerrar</button>
          <a href={`https://www.google.com/maps?q=${mapCoordinates.lat},${mapCoordinates.lng}`} target="_blank" rel="noopener noreferrer" className="db-btn db-btn--primary">
            <MapPin size={15} /> Abrir en Google Maps
          </a>
        </Modal.Footer>
      </Modal>

      {/* Modal para ampliar imagen (igual) */}
      {imageModal.show && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={closeImageModal}
        >
          <div
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              backgroundColor: 'transparent',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              cursor: 'default'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageModal.src}
              alt={imageModal.alt}
              style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '90vh', display: 'block' }}
            />
            <div
              style={{
                position: 'absolute',
                top: '20px',
                right: '30px',
                color: 'white',
                fontSize: '30px',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: 'rgba(0,0,0,0.6)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={closeImageModal}
            >
              &times;
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;