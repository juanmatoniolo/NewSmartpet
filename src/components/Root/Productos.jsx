import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import {
    Plus, Search, RefreshCw, Edit3, Trash2,
    Package, Tag, CheckCircle, XCircle, ArrowLeft, GripVertical, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import { API_URL, getImageUrl, withCacheBust } from "../../config/api";
import "./Productos.css";

const PLACEHOLDER_IMG = "/icono.png";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 6;

const initialForm = {
    titulo: "",
    descripcion: "",
    precio: "",
    oferta: false,
    activo: true,
};

const normalizarArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.productos)) return data.productos;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const getUserId = () => {
    const direct = localStorage.getItem("userId");
    if (direct) return direct;
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user?.id || "";
    } catch { return ""; }
};

const getAdminHeaders = () => ({
    "X-User-Id": getUserId(),
    "Content-Type": "application/json",
});

const getMultipartAdminHeaders = () => ({ "X-User-Id": getUserId() });

const formatPrice = (value) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency", currency: "ARS",
        minimumFractionDigits: 0, maximumFractionDigits: 2,
    }).format(Number(value || 0));

// ── ImageSlot: un slot de imagen con preview y botón de quitar ──
function ImageSlot({ slot, index, total, onRemove, onDragStart, onDragOver, onDrop, isDragging }) {
    return (
        <div
            className={`img-slot ${isDragging ? "img-slot--dragging" : ""}`}
            draggable={!!slot}
            onDragStart={() => slot && onDragStart(index)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
            onDrop={() => onDrop(index)}
        >
            {index === 0 && <span className="img-slot-badge">Portada</span>}

            {slot ? (
                <>
                    <img src={slot.preview} alt={`Imagen ${index + 1}`} className="img-slot-preview" />
                    <button
                        type="button"
                        className="img-slot-remove"
                        onClick={() => onRemove(index)}
                        aria-label="Quitar imagen"
                    >
                        <X size={14} />
                    </button>
                    {total > 1 && (
                        <div className="img-slot-grip">
                            <GripVertical size={16} />
                        </div>
                    )}
                    <span className="img-slot-num">{index + 1}</span>
                </>
            ) : (
                <div className="img-slot-empty">
                    <span className="img-slot-empty-icon">+</span>
                    <span>Imagen {index + 1}</span>
                </div>
            )}
        </div>
    );
}

// ── ImageUploader: sube hasta 3 imágenes, drag-to-reorder ──
function ImageUploader({ slots, onChange, error, onError }) {
    const inputRef = useRef(null);
    const [dragFrom, setDragFrom] = useState(null);
    const [dragOver, setDragOver] = useState(null);

    const handleFiles = (files) => {
        const valid = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                onError("Formato inválido. Usá JPG, PNG o WEBP.");
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                onError(`La imagen no puede superar los ${MAX_SIZE_MB}MB.`);
                return;
            }
            valid.push({ file, preview: URL.createObjectURL(file), isNew: true });
        }

        const filled = slots.filter(Boolean);
        const merged = [...filled, ...valid].slice(0, 3);
        const padded = [...merged, null, null, null].slice(0, 3);
        onChange(padded);
        onError("");
    };

    const handleInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) handleFiles(files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) handleFiles(files);
    };

    const handleRemove = (index) => {
        const next = [...slots];
        const slot = next[index];
        if (slot?.preview?.startsWith("blob:")) URL.revokeObjectURL(slot.preview);
        next[index] = null;
        // compactar: mover nulos al final
        const compacted = [...next.filter(Boolean), ...next.filter((s) => !s)];
        onChange(compacted);
    };

    const handleDragStart = (index) => setDragFrom(index);
    const handleDragOver = (index) => setDragOver(index);
    const handleDropSlot = (toIndex) => {
        if (dragFrom === null || dragFrom === toIndex) { setDragFrom(null); setDragOver(null); return; }
        const next = [...slots];
        [next[dragFrom], next[toIndex]] = [next[toIndex], next[dragFrom]];
        onChange(next);
        setDragFrom(null);
        setDragOver(null);
    };

    const filled = slots.filter(Boolean).length;
    const canAdd = filled < 3;

    return (
        <div className="img-uploader">
            <div
                className={`img-dropzone ${canAdd ? "img-dropzone--active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={handleDrop}
                onClick={() => canAdd && inputRef.current?.click()}
            >
                <div className="img-slots-grid">
                    {slots.map((slot, i) => (
                        <ImageSlot
                            key={i}
                            slot={slot}
                            index={i}
                            total={filled}
                            onRemove={handleRemove}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDropSlot}
                            isDragging={dragOver === i && dragFrom !== null && dragFrom !== i}
                        />
                    ))}
                </div>

                {canAdd && (
                    <p className="img-dropzone-hint">
                        {filled === 0
                            ? "Arrastrá hasta 3 imágenes o hacé clic para seleccionar"
                            : `Podés agregar ${3 - filled} imagen${3 - filled > 1 ? "es" : ""} más`}
                    </p>
                )}
            </div>

            {filled > 1 && (
                <p className="img-order-hint">
                    <GripVertical size={14} style={{ verticalAlign: "middle" }} />
                    {" "}Arrastrá las imágenes para cambiar el orden. La primera es la portada.
                </p>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={handleInputChange}
            />

            <small className="img-hint-small">
                JPG, PNG o WEBP · Máx. {MAX_SIZE_MB}MB · El backend las guarda en WEBP
            </small>
        </div>
    );
}

// ── Helpers ──
const buildSlots = (producto) => {
    const fields = ["imagen1", "imagen2", "imagen3"];
    return [
        ...fields
            .filter((f) => producto?.[f])
            .map((f) => ({
                file: null,
                preview: withCacheBust(getImageUrl(producto[f], PLACEHOLDER_IMG), producto.updated_at || producto[f]),
                field: f,
                isNew: false,
            })),
        null, null, null,
    ].slice(0, 3);
};

const slotsToFormData = (slots) => {
    const fd = new FormData();
    const fields = ["imagen1", "imagen2", "imagen3"];
    slots.forEach((slot, i) => {
        if (slot?.isNew && slot.file) fd.append(fields[i], slot.file);
    });
    return fd;
};

const hasNewImages = (slots) => slots.some((s) => s?.isNew && s?.file);

// ── Main ──
function Productos() {
    const navigate = useNavigate();

    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imgError, setImgError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [imageSlots, setImageSlots] = useState([null, null, null]);

    const resetMessages = () => { setError(""); setSuccess(""); };

    const resetImages = useCallback(() => {
        setImageSlots((prev) => {
            prev.forEach((s) => {
                if (s?.preview?.startsWith("blob:")) URL.revokeObjectURL(s.preview);
            });
            return [null, null, null];
        });
        setImgError("");
    }, []);

    const cargarProductos = useCallback(async () => {
        setError("");
        try {
            const res = await axios.get(`${API_URL}/productos`, { timeout: 10000 });
            setProductos(normalizarArray(res.data));
        } catch (err) {
            setProductos([]);
            setError(err.response?.data?.error || err.response?.data?.message || "No se pudieron cargar los productos.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { cargarProductos(); }, [cargarProductos]);
    useEffect(() => () => { resetImages(); }, [resetImages]);

    const productosFiltrados = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return productos;
        return productos.filter((p) =>
            [p.titulo, p.descripcion, p.precio,
            Number(p.oferta) === 1 ? "oferta" : "",
            Number(p.activo) === 1 ? "activo" : "inactivo"]
                .filter(Boolean).join(" ").toLowerCase().includes(term)
        );
    }, [productos, search]);

    const openCreateModal = () => {
        resetMessages(); resetImages();
        setEditingProduct(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEditModal = (producto) => {
        resetMessages(); resetImages();
        setEditingProduct(producto);
        setForm({
            titulo: producto.titulo || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio ?? "",
            oferta: Number(producto.oferta) === 1,
            activo: Number(producto.activo) === 1,
        });
        setImageSlots(buildSlots(producto));
        setShowModal(true);
    };

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setEditingProduct(null);
        setForm(initialForm);
        resetImages();
        resetMessages();
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        resetMessages();
    };

    const validateForm = () => {
        if (!form.titulo.trim()) { setError("El título es obligatorio."); return false; }
        const precio = Number(form.precio);
        if (Number.isNaN(precio) || precio < 0) { setError("El precio no es válido."); return false; }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setSaving(true);
        resetMessages();

        try {
            const payload = {
                titulo: form.titulo.trim(),
                descripcion: form.descripcion.trim(),
                precio: Number(form.precio || 0),
                oferta: form.oferta ? 1 : 0,
                activo: form.activo ? 1 : 0,
            };

            let productoGuardado;

            if (editingProduct?.id) {
                const res = await axios.put(`${API_URL}/productos/${editingProduct.id}`, payload, {
                    headers: getAdminHeaders(), timeout: 10000,
                });
                productoGuardado = res.data?.producto || { ...editingProduct, ...payload };
            } else {
                const res = await axios.post(`${API_URL}/productos`, payload, {
                    headers: getAdminHeaders(), timeout: 10000,
                });
                productoGuardado = res.data?.producto || { id: res.data?.id, ...payload };
            }

            // Subir imágenes solo si hay nuevas
            if (hasNewImages(imageSlots)) {
                const fd = slotsToFormData(imageSlots);
                const res = await axios.post(
                    `${API_URL}/upload-producto/${productoGuardado.id}`,
                    fd,
                    { headers: getMultipartAdminHeaders(), timeout: 30000 }
                );
                if (res.data?.producto) productoGuardado = res.data.producto;
            }

            setSuccess(editingProduct?.id ? "Producto actualizado correctamente." : "Producto creado correctamente.");
            await cargarProductos();
            setTimeout(closeModal, 600);
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || "No se pudo guardar el producto.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (producto) => {
        if (!producto?.id) return;
        if (!window.confirm(`¿Eliminar el producto "${producto.titulo}"?`)) return;
        setDeletingId(producto.id);
        setError("");
        try {
            await axios.delete(`${API_URL}/productos/${producto.id}`, {
                headers: getAdminHeaders(), timeout: 10000,
            });
            setProductos((prev) => prev.filter((item) => item.id !== producto.id));
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || "No se pudo eliminar el producto.");
        } finally {
            setDeletingId(null);
        }
    };

    const getProductImage = (producto) => {
        const baseUrl = getImageUrl(producto?.imagen1, PLACEHOLDER_IMG);
        return withCacheBust(baseUrl, producto?.updated_at || producto?.imagen1 || Date.now());
    };

    return (
        <>
            <AdminHeader />
            <main className="productos-page">

                {/* HEADER */}
                <section className="productos-header">
                    <div>
                        <button type="button" className="productos-back" onClick={() => navigate("/admin")}>
                            <ArrowLeft size={18} /> Volver al dashboard
                        </button>
                        <span className="productos-kicker"><Package size={18} /> Administración</span>
                        <h1>Productos</h1>
                        <p>Gestioná productos, precios, ofertas e imágenes.</p>
                    </div>
                    <div className="productos-header-actions">
                        <button type="button" className="productos-btn secondary" onClick={() => { setRefreshing(true); cargarProductos(); }} disabled={loading || refreshing}>
                            <RefreshCw size={18} className={refreshing ? "productos-spin" : ""} />
                            {refreshing ? "Actualizando..." : "Actualizar"}
                        </button>
                        <button type="button" className="productos-btn primary" onClick={openCreateModal}>
                            <Plus size={18} /> Nuevo producto
                        </button>
                    </div>
                </section>

                {/* TOOLBAR */}
                <section className="productos-toolbar">
                    <div className="productos-search">
                        <Search size={18} />
                        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por título, descripción, oferta..." />
                    </div>
                    <span className="productos-count">{productosFiltrados.length} producto{productosFiltrados.length !== 1 ? "s" : ""}</span>
                </section>

                {error && <Alert variant="danger" className="productos-alert">{error}</Alert>}

                {/* GRID */}
                {loading ? (
                    <section className="productos-grid">
                        {[1, 2, 3].map((i) => (
                            <article className="producto-skeleton" key={i}>
                                <div className="producto-skeleton-img" />
                                <div className="producto-skeleton-line big" />
                                <div className="producto-skeleton-line" />
                                <div className="producto-skeleton-line short" />
                            </article>
                        ))}
                    </section>
                ) : productosFiltrados.length === 0 ? (
                    <section className="productos-empty">
                        <Package size={52} />
                        <h2>No hay productos para mostrar</h2>
                        <p>{search ? "No encontramos productos con ese filtro." : "Creá tu primer producto para comenzar."}</p>
                        {!search && <button type="button" className="productos-btn primary" onClick={openCreateModal}><Plus size={18} /> Crear producto</button>}
                    </section>
                ) : (
                    <section className="productos-grid">
                        {productosFiltrados.map((producto) => (
                            <article className="producto-card" key={producto.id}>
                                <div className="producto-img-wrap">
                                    <img src={getProductImage(producto)} alt={producto.titulo || "Producto"} className="producto-card-img" loading="lazy"
                                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = PLACEHOLDER_IMG; }} />
                                    <div className="producto-badges">
                                        {Number(producto.oferta) === 1 && <span className="producto-badge offer"><Tag size={13} /> Oferta</span>}
                                        <span className={`producto-badge ${Number(producto.activo) === 1 ? "active" : "inactive"}`}>
                                            {Number(producto.activo) === 1 ? <><CheckCircle size={13} /> Activo</> : <><XCircle size={13} /> Inactivo</>}
                                        </span>
                                    </div>
                                </div>
                                <div className="producto-card-body">
                                    <h2>{producto.titulo || "Producto sin título"}</h2>
                                    <p className="producto-price">{formatPrice(producto.precio)}</p>
                                    <p className="producto-description">{producto.descripcion || "Sin descripción cargada."}</p>
                                    <div className="producto-actions">
                                        <button type="button" className="producto-action edit" onClick={() => openEditModal(producto)}><Edit3 size={16} /> Editar</button>
                                        <button type="button" className="producto-action delete" onClick={() => handleDelete(producto)} disabled={deletingId === producto.id}>
                                            {deletingId === producto.id ? <Spinner size="sm" animation="border" /> : <Trash2 size={16} />} Eliminar
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {/* MODAL */}
            <Modal show={showModal} onHide={closeModal} size="lg" centered backdrop="static">
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>{editingProduct?.id ? "Editar producto" : "Nuevo producto"}</Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        {imgError && <Alert variant="warning">{imgError}</Alert>}

                        <div className="productos-form-grid">
                            <Form.Group className="productos-form-full">
                                <Form.Label>Título *</Form.Label>
                                <Form.Control type="text" name="titulo" value={form.titulo} onChange={handleChange} disabled={saving} placeholder="Ej: Chapita QR SmartPet" required />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Precio *</Form.Label>
                                <Form.Control type="number" name="precio" value={form.precio} onChange={handleChange} disabled={saving} min="0" step="0.01" placeholder="0.00" required />
                            </Form.Group>

                            <div className="productos-checks">
                                <Form.Check type="switch" id="producto-oferta" name="oferta" label="En oferta" checked={form.oferta} onChange={handleChange} disabled={saving} />
                                <Form.Check type="switch" id="producto-activo" name="activo" label="Activo" checked={form.activo} onChange={handleChange} disabled={saving} />
                            </div>

                            <Form.Group className="productos-form-full">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control as="textarea" rows={3} name="descripcion" value={form.descripcion} onChange={handleChange} disabled={saving} placeholder="Descripción del producto..." />
                            </Form.Group>

                            <div className="productos-form-full">
                                <Form.Label>Imágenes del producto</Form.Label>
                                <ImageUploader
                                    slots={imageSlots}
                                    onChange={setImageSlots}
                                    error={imgError}
                                    onError={setImgError}
                                />
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" type="button" onClick={closeModal} disabled={saving}>Cancelar</Button>
                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? <><Spinner size="sm" animation="border" className="me-2" />Guardando...</> : "Guardar producto"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default Productos;