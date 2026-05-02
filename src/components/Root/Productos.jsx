import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import {
    Plus,
    Search,
    RefreshCw,
    Edit3,
    Trash2,
    ImagePlus,
    Package,
    Tag,
    CheckCircle,
    XCircle,
    ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminHeader from "./AdminHeader";
import { API_URL, getImageUrl, withCacheBust } from "../../config/api";

import "./Productos.css";

const PLACEHOLDER_IMG = "/icono.png";

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
    } catch {
        return "";
    }
};

const getAdminHeaders = () => ({
    "X-User-Id": getUserId(),
    "Content-Type": "application/json",
});

const getMultipartAdminHeaders = () => ({
    "X-User-Id": getUserId(),
});

const formatPrice = (value) => {
    const number = Number(value || 0);

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(number);
};

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

    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [imageFiles, setImageFiles] = useState({
        imagen1: null,
        imagen2: null,
        imagen3: null,
    });

    const [imagePreviews, setImagePreviews] = useState({
        imagen1: "",
        imagen2: "",
        imagen3: "",
    });

    const imagen1Ref = useRef(null);
    const imagen2Ref = useRef(null);
    const imagen3Ref = useRef(null);

    const fileInputRefs = useMemo(
        () => ({
            imagen1: imagen1Ref,
            imagen2: imagen2Ref,
            imagen3: imagen3Ref,
        }),
        []
    );

    const resetMessages = () => {
        setError("");
        setSuccess("");
    };

    const revokePreviews = useCallback(() => {
        Object.values(imagePreviews).forEach((preview) => {
            if (preview && preview.startsWith("blob:")) {
                URL.revokeObjectURL(preview);
            }
        });
    }, [imagePreviews]);

    const resetImages = useCallback(() => {
        revokePreviews();

        setImageFiles({
            imagen1: null,
            imagen2: null,
            imagen3: null,
        });

        setImagePreviews({
            imagen1: "",
            imagen2: "",
            imagen3: "",
        });

        Object.values(fileInputRefs).forEach((ref) => {
            if (ref.current) ref.current.value = "";
        });
    }, [fileInputRefs, revokePreviews]);

    const cargarProductos = useCallback(async () => {
        setError("");

        try {
            const res = await axios.get(`${API_URL}/productos`, {
                timeout: 10000,
            });

            setProductos(normalizarArray(res.data));
        } catch (err) {
            console.error("Error al cargar productos:", err);

            setProductos([]);
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudieron cargar los productos."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        cargarProductos();
    }, [cargarProductos]);

    useEffect(() => {
        return () => {
            revokePreviews();
        };
    }, [revokePreviews]);

    const productosFiltrados = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return productos;

        return productos.filter((producto) => {
            const texto = [
                producto.titulo,
                producto.descripcion,
                producto.precio,
                Number(producto.oferta) === 1 ? "oferta" : "",
                Number(producto.activo) === 1 ? "activo" : "inactivo",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return texto.includes(term);
        });
    }, [productos, search]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await cargarProductos();
    };

    const openCreateModal = () => {
        resetMessages();
        resetImages();
        setEditingProduct(null);
        setForm(initialForm);
        setShowModal(true);
    };

    const openEditModal = (producto) => {
        resetMessages();
        resetImages();

        setEditingProduct(producto);

        setForm({
            titulo: producto.titulo || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio ?? "",
            oferta: Number(producto.oferta) === 1,
            activo: Number(producto.activo) === 1,
        });

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

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        resetMessages();
    };

    const handleImageChange = (field, e) => {
        const file = e.target.files?.[0];

        if (!file) {
            setImageFiles((prev) => ({
                ...prev,
                [field]: null,
            }));

            setImagePreviews((prev) => {
                if (prev[field]?.startsWith("blob:")) {
                    URL.revokeObjectURL(prev[field]);
                }

                return {
                    ...prev,
                    [field]: "",
                };
            });

            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (!allowedTypes.includes(file.type)) {
            setError("Formato inválido. Usá JPG, PNG o WEBP.");
            e.target.value = "";
            return;
        }

        if (file.size > 6 * 1024 * 1024) {
            setError("La imagen no puede superar los 6MB.");
            e.target.value = "";
            return;
        }

        const blobUrl = URL.createObjectURL(file);

        setImageFiles((prev) => ({
            ...prev,
            [field]: file,
        }));

        setImagePreviews((prev) => {
            if (prev[field]?.startsWith("blob:")) {
                URL.revokeObjectURL(prev[field]);
            }

            return {
                ...prev,
                [field]: blobUrl,
            };
        });

        resetMessages();
    };

    const validateForm = () => {
        if (!form.titulo.trim()) {
            setError("El título es obligatorio.");
            return false;
        }

        const precio = Number(form.precio);

        if (Number.isNaN(precio) || precio < 0) {
            setError("El precio no es válido.");
            return false;
        }

        return true;
    };

    const uploadImagesIfNeeded = async (productoId) => {
        const hasImages = Object.values(imageFiles).some(Boolean);

        if (!hasImages) return null;

        const payload = new FormData();

        Object.entries(imageFiles).forEach(([field, file]) => {
            if (file) payload.append(field, file);
        });

        const res = await axios.post(`${API_URL}/upload-producto/${productoId}`, payload, {
            headers: getMultipartAdminHeaders(),
            timeout: 30000,
        });

        return res.data?.producto || null;
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
                const res = await axios.put(
                    `${API_URL}/productos/${editingProduct.id}`,
                    payload,
                    {
                        headers: getAdminHeaders(),
                        timeout: 10000,
                    }
                );

                productoGuardado = res.data?.producto || {
                    ...editingProduct,
                    ...payload,
                };
            } else {
                const res = await axios.post(`${API_URL}/productos`, payload, {
                    headers: getAdminHeaders(),
                    timeout: 10000,
                });

                productoGuardado = res.data?.producto || {
                    id: res.data?.id,
                    ...payload,
                };
            }

            const productoConImagenes = await uploadImagesIfNeeded(productoGuardado.id);

            if (productoConImagenes) {
                productoGuardado = productoConImagenes;
            }

            setSuccess(
                editingProduct?.id
                    ? "Producto actualizado correctamente."
                    : "Producto creado correctamente."
            );

            await cargarProductos();

            setTimeout(() => {
                closeModal();
            }, 600);
        } catch (err) {
            console.error("Error al guardar producto:", err);

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudo guardar el producto."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (producto) => {
        if (!producto?.id) return;

        const ok = window.confirm(`¿Eliminar el producto "${producto.titulo}"?`);

        if (!ok) return;

        setDeletingId(producto.id);
        setError("");

        try {
            await axios.delete(`${API_URL}/productos/${producto.id}`, {
                headers: getAdminHeaders(),
                timeout: 10000,
            });

            setProductos((prev) => prev.filter((item) => item.id !== producto.id));
        } catch (err) {
            console.error("Error al eliminar producto:", err);

            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "No se pudo eliminar el producto."
            );
        } finally {
            setDeletingId(null);
        }
    };

    const getProductImage = (producto) => {
        const baseUrl = getImageUrl(producto?.imagen1, PLACEHOLDER_IMG);
        const version = producto?.updated_at || producto?.imagen1 || Date.now();

        return withCacheBust(baseUrl, version);
    };

    const getPreviewImage = (field) => {
        if (imagePreviews[field]) return imagePreviews[field];

        if (editingProduct?.[field]) {
            return withCacheBust(
                getImageUrl(editingProduct[field], PLACEHOLDER_IMG),
                editingProduct.updated_at || editingProduct[field]
            );
        }

        return "";
    };

    const renderImageInput = (field, label) => {
        const preview = getPreviewImage(field);

        return (
            <div className="producto-img-box">
                <span className="producto-img-label">{label}</span>

                {preview ? (
                    <img
                        src={preview}
                        alt={label}
                        className="producto-img-preview"
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = PLACEHOLDER_IMG;
                        }}
                    />
                ) : (
                    <div className="producto-img-placeholder">
                        <ImagePlus size={26} />
                        <span>Sin imagen</span>
                    </div>
                )}

                <Form.Control
                    ref={fileInputRefs[field]}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleImageChange(field, e)}
                    disabled={saving}
                />
            </div>
        );
    };

    return (
        <>
            <AdminHeader />

            <main className="productos-page">
                <section className="productos-header">
                    <div>
                        <button
                            type="button"
                            className="productos-back"
                            onClick={() => navigate("/admin")}
                        >
                            <ArrowLeft size={18} />
                            Volver al dashboard
                        </button>

                        <span className="productos-kicker">
                            <Package size={18} />
                            Administración
                        </span>

                        <h1>Productos</h1>

                        <p>
                            Gestioná productos, precios, ofertas e imágenes. Las imágenes se guardan
                            en WEBP desde el backend para ahorrar espacio.
                        </p>
                    </div>

                    <div className="productos-header-actions">
                        <button
                            type="button"
                            className="productos-btn secondary"
                            onClick={handleRefresh}
                            disabled={loading || refreshing}
                        >
                            <RefreshCw
                                size={18}
                                className={refreshing ? "productos-spin" : ""}
                            />
                            {refreshing ? "Actualizando..." : "Actualizar"}
                        </button>

                        <button
                            type="button"
                            className="productos-btn primary"
                            onClick={openCreateModal}
                        >
                            <Plus size={18} />
                            Nuevo producto
                        </button>
                    </div>
                </section>

                <section className="productos-toolbar">
                    <div className="productos-search">
                        <Search size={18} />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por título, descripción, oferta..."
                        />
                    </div>

                    <span className="productos-count">
                        {productosFiltrados.length} producto
                        {productosFiltrados.length !== 1 ? "s" : ""}
                    </span>
                </section>

                {error && (
                    <Alert variant="danger" className="productos-alert">
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <section className="productos-grid">
                        {[1, 2, 3].map((item) => (
                            <article className="producto-skeleton" key={item}>
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

                        <p>
                            {search
                                ? "No encontramos productos con ese filtro."
                                : "Creá tu primer producto para comenzar."}
                        </p>

                        {!search && (
                            <button
                                type="button"
                                className="productos-btn primary"
                                onClick={openCreateModal}
                            >
                                <Plus size={18} />
                                Crear producto
                            </button>
                        )}
                    </section>
                ) : (
                    <section className="productos-grid">
                        {productosFiltrados.map((producto) => (
                            <article className="producto-card" key={producto.id}>
                                <div className="producto-img-wrap">
                                    <img
                                        src={getProductImage(producto)}
                                        alt={producto.titulo || "Producto"}
                                        className="producto-card-img"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = PLACEHOLDER_IMG;
                                        }}
                                    />

                                    <div className="producto-badges">
                                        {Number(producto.oferta) === 1 && (
                                            <span className="producto-badge offer">
                                                <Tag size={13} />
                                                Oferta
                                            </span>
                                        )}

                                        <span
                                            className={`producto-badge ${Number(producto.activo) === 1 ? "active" : "inactive"
                                                }`}
                                        >
                                            {Number(producto.activo) === 1 ? (
                                                <>
                                                    <CheckCircle size={13} />
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={13} />
                                                    Inactivo
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <div className="producto-card-body">
                                    <h2>{producto.titulo || "Producto sin título"}</h2>

                                    <p className="producto-price">
                                        {formatPrice(producto.precio)}
                                    </p>

                                    <p className="producto-description">
                                        {producto.descripcion || "Sin descripción cargada."}
                                    </p>

                                    <div className="producto-actions">
                                        <button
                                            type="button"
                                            className="producto-action edit"
                                            onClick={() => openEditModal(producto)}
                                        >
                                            <Edit3 size={16} />
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="producto-action delete"
                                            onClick={() => handleDelete(producto)}
                                            disabled={deletingId === producto.id}
                                        >
                                            {deletingId === producto.id ? (
                                                <Spinner size="sm" animation="border" />
                                            ) : (
                                                <Trash2 size={16} />
                                            )}
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            <Modal
                show={showModal}
                onHide={closeModal}
                size="lg"
                centered
                backdrop="static"
            >
                <Modal.Header closeButton={!saving}>
                    <Modal.Title>
                        {editingProduct?.id ? "Editar producto" : "Nuevo producto"}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}

                        <div className="productos-form-grid">
                            <Form.Group className="productos-form-full">
                                <Form.Label>Título *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="titulo"
                                    value={form.titulo}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder="Ej: Chapita QR SmartPet"
                                    required
                                />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Precio *</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="precio"
                                    value={form.precio}
                                    onChange={handleChange}
                                    disabled={saving}
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                />
                            </Form.Group>

                            <div className="productos-checks">
                                <Form.Check
                                    type="switch"
                                    id="producto-oferta"
                                    name="oferta"
                                    label="En oferta"
                                    checked={form.oferta}
                                    onChange={handleChange}
                                    disabled={saving}
                                />

                                <Form.Check
                                    type="switch"
                                    id="producto-activo"
                                    name="activo"
                                    label="Activo"
                                    checked={form.activo}
                                    onChange={handleChange}
                                    disabled={saving}
                                />
                            </div>

                            <Form.Group className="productos-form-full">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder="Descripción del producto..."
                                />
                            </Form.Group>

                            <div className="productos-form-full">
                                <label className="form-label">Imágenes del producto</label>

                                <div className="productos-images-grid">
                                    {renderImageInput("imagen1", "Imagen 1")}
                                    {renderImageInput("imagen2", "Imagen 2")}
                                    {renderImageInput("imagen3", "Imagen 3")}
                                </div>

                                <small className="text-muted d-block mt-2">
                                    Formatos permitidos: JPG, PNG o WEBP. Máximo 6MB. El backend las guarda en WEBP.
                                </small>
                            </div>
                        </div>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            variant="secondary"
                            type="button"
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancelar
                        </Button>

                        <Button variant="primary" type="submit" disabled={saving}>
                            {saving ? (
                                <>
                                    <Spinner size="sm" animation="border" className="me-2" />
                                    Guardando...
                                </>
                            ) : (
                                "Guardar producto"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}

export default Productos;