import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Alert, Badge } from "react-bootstrap";
import {
  Plus, Search, RefreshCw, Download, X, Eye, Edit2, Trash2, MapPin, QrCode, ChevronRight
} from "lucide-react";

import AdminHeader from "./AdminHeader";
import SidebarNav from "./SidebarNav";
import CellValue from "./CellValue";
import CreateEditModal from "./Modals/CreateEditModal";
import DetailModal from "./Modals/DetailModal";
import MapModal from "./Modals/MapModal";
import QRModal from "./Modals/QRModal";
import ImageModal from "./Modals/ImageModal";

import { SECTIONS } from "./sections";
import { withCacheBust, getFallbackImage, formatPrice } from "./helpers";
import { getImageSrc, getImageAlt } from "./imageUtils";
import "./dashboard.css";
import {
  API_URL,
  getAdminHeaders,
  getMultipartAdminHeaders,
  normalizeList,
  resolveUploadUrl,
} from "../../config/adminApi.js";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [search, setSearch] = useState("");
  const [fkCatalog, setFkCatalog] = useState({});
  const [refreshKey, setRefreshKey] = useState(Date.now());
  const [filtroCodigosEstado, setFiltroCodigosEstado] = useState("todos"); // "todos" | "usado" | "libre"
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentItem, setCurrentItem] = useState({});
  const [detailItem, setDetailItem] = useState(null);

  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCoordinates, setMapCoordinates] = useState({ lat: null, lng: null });
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [imageModal, setImageModal] = useState({ show: false, src: "", alt: "" });

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [petImageFile, setPetImageFile] = useState(null);
  const [petImagePreview, setPetImagePreview] = useState(null);
  const [socioImageFile, setSocioImageFile] = useState(null);
  const [socioImagePreview, setSocioImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [productoImageSlots, setProductoImageSlots] = useState([null, null, null]);
  const [imgError, setImgError] = useState("");

  const sec = SECTIONS[activeTab];

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


  const resetProductImages = () => {
    setProductoImageSlots(prev => {
      prev.forEach(s => { if (s?.preview?.startsWith("blob:")) URL.revokeObjectURL(s.preview); });
      return [null, null, null];
    });
    setImgError("");
  };
  const closeMainModal = () => {
    setTimeout(() => {
      setShowModal(false);
      setUploading(false);
      resetImageStates();
      resetProductImages();
    }, 0);
  };

  const closeDetailModal = () => {
    setTimeout(() => setShowDetail(false), 0);
  };

  const closeMapModal = () => {
    setTimeout(() => setShowMapModal(false), 0);
  };

  const closeQRModal = () => {
    setTimeout(() => setShowQRModal(false), 0);
  };

  const closeImageModal = () => {
    setTimeout(() => setImageModal({ show: false, src: "", alt: "" }), 0);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.post(API_URL, { action: `get${sec.endpoint}` }, { headers: getAdminHeaders() });
      setData(normalizeList(res.data, sec.endpoint));
      setRefreshKey(Date.now());
    } catch (err) {
      setError(err.response?.data?.error || "Error al cargar datos");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [sec.endpoint]);

  const loadFkCatalog = useCallback(async () => {
    const needed = new Set();
    sec.fields.filter(f => f.type === "fk_select").forEach(f => needed.add(f.fkEndpoint));
    if (sec.fkColumns) Object.values(sec.fkColumns).forEach(fc => needed.add(fc.endpoint));
    for (const ep of needed) {
      try {
        const res = await axios.post(API_URL, { action: `get${ep}` }, { headers: getAdminHeaders() });
        setFkCatalog(prev => ({ ...prev, [ep]: normalizeList(res.data, ep) }));
      } catch (err) { console.error(`Error cargando FK ${ep}:`, err); }
    }
  }, [sec]);

  const loadMascotas = useCallback(async () => {
    if (activeTab !== "codigos") return;
    try {
      const res = await axios.post(API_URL, { action: "getmascotas" }, { headers: getAdminHeaders() });
      setFkCatalog(prev => ({ ...prev, mascotasList: normalizeList(res.data, "mascotas") }));
    } catch (err) { console.error(err); }
  }, [activeTab]); // añade API_URL si es necesario



  const refreshAllData = async () => {
    await loadFkCatalog();
    await loadData();
    if (activeTab === "codigos") await loadMascotas();
  };

  useEffect(() => { loadData(); loadFkCatalog(); if (activeTab === "codigos") loadMascotas(); }, [loadData, loadFkCatalog, loadMascotas, activeTab]);
  useEffect(() => { if (success) setTimeout(() => setSuccess(null), 3000); }, [success]);
  useEffect(() => { if (error) setTimeout(() => setError(null), 5000); }, [error]);

  const getMascotaByCodigoId = (codigoId) => {
    const mascotas = fkCatalog.mascotasList || [];
    return mascotas.find(m => m.codigo_id === codigoId);
  };

  const handleGenerarQR = (codigoUnico) => {
    setQrValue(`http://tagsmartpet.com/mascotaProtegida/${codigoUnico}`);
    setShowQRModal(true);
  };

  const openMap = (ubicacionStr) => {
    if (!ubicacionStr) return;
    // Limpiar espacios y separar por coma
    const parts = String(ubicacionStr).trim().split(",");
    if (parts.length !== 2) {
      setError("Formato de coordenadas incorrecto. Debe ser: lat,lng");
      return;
    }
    const lat = parseFloat(parts[0].trim());
    const lng = parseFloat(parts[1].trim());
    if (isNaN(lat) || isNaN(lng)) {
      setError("Coordenadas inválidas");
      return;
    }
    setMapCoordinates({ lat, lng });
    setShowMapModal(true);
  };
  const openImageModal = (src, alt) => setImageModal({ show: true, src: resolveUploadUrl(src), alt });

  const handleCreate = () => {
    setModalMode("create");
    setCurrentItem({});
    resetImageStates();
    if (activeTab === "productos") resetProductImages();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode("edit");
    setCurrentItem(item);
    resetImageStates();
    if (activeTab === "productos") {
      const fields = ["imagen1", "imagen2", "imagen3"];
      const slots = fields.filter(f => item[f]).map(f => ({ file: null, preview: withCacheBust(resolveUploadUrl(item[f]), item.updated_at || item[f]), field: f, isNew: false })).concat([null, null, null]).slice(0, 3);
      setProductoImageSlots(slots);
    }
    setShowModal(true);
  };

  const handleDetail = (item) => {
    setDetailItem(item);
    setShowDetail(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este registro?")) return;
    try {
      await axios.post(API_URL, { action: `delete${sec.singular}`, id }, { headers: getAdminHeaders() });
      setSuccess("Registro eliminado");
      await refreshAllData();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
    }
  };

  const uploadImageIfNeeded = async (savedId) => {
    if (sec.endpoint === "usuarios" && profileImageFile) {
      const fd = new FormData(); fd.append("imagen", profileImageFile);
      await axios.post(`${API_URL}/upload-perfil/${savedId}`, fd, { headers: getMultipartAdminHeaders() });
    }
    if (sec.endpoint === "mascotas" && petImageFile) {
      const fd = new FormData(); fd.append("imagen", petImageFile);
      await axios.post(`${API_URL}/upload-mascota/${savedId}`, fd, { headers: getMultipartAdminHeaders() });
    }
    if (sec.endpoint === "socios" && socioImageFile) {
      const fd = new FormData(); fd.append("imagen", socioImageFile);
      await axios.post(`${API_URL}/upload-socio/${savedId}`, fd, { headers: getMultipartAdminHeaders() });
    }
  };

  const hasNewImages = (slots) => slots.some(s => s?.isNew && s?.file);
  const slotsToFormData = (slots) => {
    const fd = new FormData();
    slots.forEach((slot, i) => { if (slot?.isNew && slot.file) fd.append(`imagen${i + 1}`, slot.file); });
    return fd;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const fd = new FormData(e.target);
    const body = Object.fromEntries(fd);
    sec.fields.forEach(f => { if (f.type === "checkbox") body[f.name] = fd.get(f.name) ? 1 : 0; });
    if (sec.endpoint === "usuarios" && modalMode === "edit" && !body.password) delete body.password;
    if (sec.endpoint === "mascotas" && modalMode === "edit") delete body.codigo_unico;

    try {
      const action = modalMode === "create" ? `create${sec.singular}` : `update${sec.singular}`;
      let savedId = currentItem.id;
      const res = await axios.post(API_URL, { action, ...(modalMode === "edit" ? { id: currentItem.id } : {}), ...body }, { headers: getAdminHeaders() });
      if (modalMode === "create") {
        savedId = res.data?.id || res.data?.data?.id;
        if (!savedId) throw new Error("No se obtuvo ID");
      }
      await uploadImageIfNeeded(savedId);
      if (activeTab === "productos" && hasNewImages(productoImageSlots)) {
        const fdImages = slotsToFormData(productoImageSlots);
        await axios.post(`${API_URL}/upload-producto/${savedId}`, fdImages, { headers: getMultipartAdminHeaders(), timeout: 30000 });
      }
      setSuccess(`Registro ${modalMode === "create" ? "creado" : "actualizado"} correctamente`);
      closeMainModal();
      await refreshAllData();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Error al guardar");
    } finally {
      setUploading(false);
    }
  };

  const handleExport = () => {
    const filteredData = data.filter(item => sec.columns.some(col => String(item[col] ?? "").toLowerCase().includes(search.toLowerCase())));
    const csv = [sec.columns.join(","), ...filteredData.map(row => sec.columns.map(col => `"${String(row[col] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `${sec.title}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;
    return data.filter(item => sec.columns.some(col => String(item[col] ?? "").toLowerCase().includes(term)));
  }, [data, search, sec.columns]);

  return (
    <div className="db-root">
      <AdminHeader />
      {sidebarOpen && <div className="db-sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <div className="db-layout">
        <aside className="db-sidebar db-sidebar--desktop">
          <SidebarNav activeTab={activeTab} onSelectTab={(tab) => { setActiveTab(tab); setSearch(""); }} />
        </aside>
        <aside className={`db-sidebar db-sidebar--mobile ${sidebarOpen ? "open" : ""}`}>
          <SidebarNav activeTab={activeTab} onSelectTab={(tab) => { setActiveTab(tab); setSearch(""); setSidebarOpen(false); }} />
        </aside>
        <main className="db-main">
          {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
          <div className="db-card">
            <div className="db-card-head">
              <div className="db-card-title">
                <button className="db-tab-toggle d-md-none" onClick={() => setSidebarOpen(v => !v)}>
                  {React.createElement(sec.icon, { size: 18 })}<span>{sec.title}</span><ChevronRight size={14} />
                </button>
                <h5 className="db-card-h d-none d-md-flex">{React.createElement(sec.icon, { size: 20 })} {sec.title}</h5>
                <span className="db-count">{filtered.length}</span>
              </div>
              <div className="db-card-actions">
                <button className="db-btn db-btn--ghost" onClick={refreshAllData}><RefreshCw size={16} /></button>
                <button className="db-btn db-btn--ghost" onClick={handleExport}><Download size={16} /></button>
                <button className="db-btn db-btn--primary" onClick={handleCreate}><Plus size={16} /><span className="db-btn-label">Crear</span></button>
              </div>
            </div>
            <div className="db-search-wrap">
              <Search size={16} className="db-search-icon" />
              <input className="db-search" placeholder={`Buscar en ${sec.title.toLowerCase()}…`} value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button className="db-search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
            </div>
            {loading ? (
              <div className="db-loading"><div className="db-spinner" /><p>Cargando…</p></div>
            ) : filtered.length === 0 ? (
              <div className="db-empty">{React.createElement(sec.icon, { size: 48, opacity: 0.3 })}<p>Sin registros{search && ` para "${search}"`}</p></div>
            ) : activeTab === "codigos" ? (
              <>
                {/* Filtro */}
                <div style={{ display: "flex", gap: "0.5rem", padding: "0 1rem 1rem" }}>
                  {["todos", "usado", "libre"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFiltroCodigosEstado(f)}
                      className={`db-btn ${filtroCodigosEstado === f ? "db-btn--primary" : "db-btn--ghost"}`}
                      style={{ textTransform: "capitalize", fontSize: "0.8rem" }}
                    >
                      {f === "todos" ? "Todos" : f === "usado" ? "Usados" : "Libres"}
                    </button>
                  ))}
                </div>

                <div className="db-table-wrap d-none d-md-block">
                  <table className="db-table">
                    <thead><tr><th>Código</th><th>Estado</th><th className="text-end">Acción</th></tr></thead>
                    <tbody>
                      {filtered
                        .filter(item => {
                          const isUsed = !!getMascotaByCodigoId(item.id);
                          if (filtroCodigosEstado === "usado") return isUsed;
                          if (filtroCodigosEstado === "libre") return !isUsed;
                          return true;
                        })
                        .map(item => {
                          const mascota = getMascotaByCodigoId(item.id);
                          const isUsed = !!mascota;
                          return (
                            <tr key={item.id}>
                              <td>{item.codigo_unico}</td>
                              <td>{isUsed ? <Badge bg="success">Usado por {mascota.nombre}</Badge> : <Badge bg="secondary">Libre</Badge>}</td>
                              <td className="db-actions-cell">
                                {isUsed ? (
                                  <button className="db-icon-btn info" onClick={() => handleDetail(mascota)}><Eye size={14} /> Ver mascota</button>
                                ) : (
                                  <button className="db-icon-btn primary" onClick={() => handleGenerarQR(item.codigo_unico)}><QrCode size={14} /> Generar QR</button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                <div className="db-mobile-list d-md-none">
                  {filtered
                    .filter(item => {
                      const isUsed = !!getMascotaByCodigoId(item.id);
                      if (filtroCodigosEstado === "usado") return isUsed;
                      if (filtroCodigosEstado === "libre") return !isUsed;
                      return true;
                    })
                    .map(item => {
                      const mascota = getMascotaByCodigoId(item.id);
                      const isUsed = !!mascota;
                      return (
                        <div className="db-mobile-card" key={item.id}>
                          <div className="db-mc-body">
                            <p className="db-mc-primary"><strong>Código:</strong> {item.codigo_unico}</p>
                            <p className="db-mc-secondary"><strong>Estado:</strong> {isUsed ? `Usado por ${mascota.nombre}` : "Libre"}</p>
                          </div>
                          <div className="db-mc-actions">
                            {isUsed ? (
                              <button className="db-icon-btn info" onClick={() => handleDetail(mascota)}><Eye size={14} /></button>
                            ) : (
                              <button className="db-icon-btn primary" onClick={() => handleGenerarQR(item.codigo_unico)}><QrCode size={14} /></button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <>
                <div className="db-table-wrap d-none d-md-block">
                  <table className="db-table">
                    <thead><tr>{sec.columns.map(col => <th key={col}>{col === "foto" ? "Foto" : col}</th>)}<th className="text-end">Acciones</th></tr></thead>
                    <tbody>
                      {filtered.map(item => (
                        <tr key={item.id}>
                          {sec.columns.map(col => (
                            <td key={col}>
                              <CellValue col={col} value={item[col]} fkData={(() => { const fc = sec.fkColumns?.[col]; return fc ? { data: fkCatalog[fc.endpoint], label: fc.label } : null; })()} section={sec.endpoint} item={item} onImageClick={openImageModal} refreshKey={refreshKey} />
                            </td>
                          ))}
                          <td className="db-actions-cell">
                            <button className="db-icon-btn info" onClick={() => handleDetail(item)}><Eye size={14} /></button>
                            <button className="db-icon-btn edit" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                            <button className="db-icon-btn del" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                            {activeTab === "ubicaciones" && item.ubicacion && (
                              <button
                                className="db-icon-btn map"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMap(item.ubicacion);
                                }}
                              >
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
                  {filtered.map(item => {
                    const imgSrc = withCacheBust(getImageSrc(sec.endpoint, item), refreshKey);
                    return (
                      <div className="db-mobile-card" key={item.id}>
                        <div className="db-mc-icon" onClick={() => openImageModal(imgSrc, getImageAlt(sec.endpoint, item))}>
                          <img src={imgSrc} alt={getImageAlt(sec.endpoint, item)} style={{ width: 48, height: 48, borderRadius: sec.endpoint === "socios" || sec.endpoint === "productos" ? 14 : "50%", objectFit: "cover" }} onError={(e) => e.currentTarget.src = getFallbackImage(sec.endpoint)} />
                        </div>
                        <div className="db-mc-body" onClick={() => handleDetail(item)}>
                          <p className="db-mc-primary">{sec.endpoint === "usuarios" ? `${item.nombre || ""} ${item.apellido || ""}` : sec.endpoint === "socios" ? item.nombre_local || `${item.nombre || ""} ${item.apellido || ""}`.trim() : sec.endpoint === "productos" ? item.titulo || `ID ${item.id}` : item.nombre || `ID ${item.id}`}</p>
                          <p className="db-mc-secondary">{sec.endpoint === "usuarios" ? item.email : sec.endpoint === "mascotas" ? (item.sexo == 0 ? "Macho" : "Hembra") : sec.endpoint === "socios" ? `${item.tipo_servicio || "Servicio"} · ${item.whatsapp || "Sin WhatsApp"}` : sec.endpoint === "productos" ? formatPrice(item.precio) : `ID: ${item.id}`}</p>
                        </div>
                        <div className="db-mc-actions">
                          <button className="db-icon-btn edit" onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                          <button className="db-icon-btn del" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
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

      <CreateEditModal show={showModal} onHide={closeMainModal} modalMode={modalMode} currentItem={currentItem} sec={sec} fkCatalog={fkCatalog} uploading={uploading}
        profileImageFile={profileImageFile} setProfileImageFile={setProfileImageFile} profileImagePreview={profileImagePreview} setProfileImagePreview={setProfileImagePreview}
        petImageFile={petImageFile} setPetImageFile={setPetImageFile} petImagePreview={petImagePreview} setPetImagePreview={setPetImagePreview}
        socioImageFile={socioImageFile} setSocioImageFile={setSocioImageFile} socioImagePreview={socioImagePreview} setSocioImagePreview={setSocioImagePreview}
        productoImageSlots={productoImageSlots} setProductoImageSlots={setProductoImageSlots} imgError={imgError} setImgError={setImgError}
        onSave={handleSave} />

      <DetailModal show={showDetail} onHide={closeDetailModal} detailItem={detailItem} sec={sec} fkCatalog={fkCatalog} refreshKey={refreshKey} onImageClick={openImageModal} onEdit={() => { closeDetailModal(); handleEdit(detailItem); }} />
      <MapModal show={showMapModal} onHide={closeMapModal} coordinates={mapCoordinates} />
      <QRModal show={showQRModal} onHide={closeQRModal} value={qrValue} />
      <ImageModal show={imageModal.show} src={imageModal.src} alt={imageModal.alt} onHide={closeImageModal} />
    </div>
  );
}