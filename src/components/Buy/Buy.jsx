// src/components/Buy/Buy.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ShoppingBag } from "lucide-react";
import { API_URL, getImageUrl, withCacheBust } from "../../config/api";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import SmartHeader from "../nav/SmartHeader";
import Footers from "../footer/Footer";

import ProductoCard from "./components/ProductoCard";
import OfertasDestacadas from "./components/OfertasDestacadas";
import BeneficiosCompra from "./components/BeneficiosCompra";
import ComoComprar from "./components/ComoComprar";
import ModalCrearIA from "./components/ModalCrearIA";

import {
    FALLBACK_IMG,
    buildIAPrompt,
    getWhatsappCompraUrl,
} from "./helpers/buyHelpers";

import "./buy.css";

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.productos)) return data.productos;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const normalizeProducto = (item) => {
    const imagenes = [item.imagen1, item.imagen2, item.imagen3]
        .filter(Boolean)
        .map((img) =>
            withCacheBust(getImageUrl(img, FALLBACK_IMG), item.updated_at || img)
        );

    return {
        id: item.id,
        titulo: item.titulo || "Producto sin título",
        descripcion: item.descripcion || "",
        precio: item.precio || 0,
        imagen1: item.imagen1 || "",
        imagen2: item.imagen2 || "",
        imagen3: item.imagen3 || "",
        oferta: Number(item.oferta) === 1,
        activo: Number(item.activo) === 1,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
        imagenes: imagenes.length > 0 ? imagenes : [FALLBACK_IMG],
    };
};

function Buy() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [selectedProducto, setSelectedProducto] = useState(null);
    const [selectedPrompt, setSelectedPrompt] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setLoading(true);
                setError("");

                const res = await axios.get(`${API_URL}/productos`, {
                    timeout: 10000,
                });

                const productosNormalizados = normalizeList(res.data)
                    .map(normalizeProducto)
                    .filter((producto) => producto.activo);

                setProductos(productosNormalizados);
            } catch (err) {
                console.error("Error al cargar productos:", err);

                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    "No se pudieron cargar los productos."
                );

                setProductos([]);
            } finally {
                setLoading(false);
            }
        };

        cargarProductos();
    }, []);

    const productosFiltrados = useMemo(() => {
        const term = search.trim().toLowerCase();

        if (!term) return productos;

        return productos.filter((producto) => {
            return [
                producto.titulo,
                producto.descripcion,
                producto.precio,
                producto.oferta ? "oferta" : "",
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(term);
        });
    }, [productos, search]);

    const productosEnOferta = useMemo(() => {
        return productos.filter((producto) => producto.oferta).slice(0, 4);
    }, [productos]);

    const handleCrearIA = (producto) => {
        const prompt = buildIAPrompt(producto);

        setSelectedProducto(producto);
        setSelectedPrompt(prompt);
        setCopied(false);
    };

    const closeModal = () => {
        setSelectedProducto(null);
        setSelectedPrompt("");
        setCopied(false);
    };

    const copiarPrompt = async () => {
        if (!selectedPrompt) return;

        try {
            await navigator.clipboard.writeText(selectedPrompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        } catch (err) {
            console.error("No se pudo copiar el prompt:", err);
        }
    };

    return (
        <>
            <SmartHeader />

            <main className="buy-page">
                <section className="buy-hero">
                    <div className="buy-hero-content">
                        <span className="buy-kicker">
                            <ShoppingBag size={17} />
                            Tienda SmartPet
                        </span>

                        <h1>Comprá nuestros productos</h1>

                        <p>
                            Explorá productos cargados desde la base de datos, mirá sus
                            imágenes y generá referencias profesionales con IA usando la
                            descripción real.
                        </p>
                    </div>

                    <div className="buy-search">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar producto..."
                            aria-label="Buscar producto"
                        />
                    </div>
                </section>

                <OfertasDestacadas
                    productosEnOferta={productosEnOferta}
                    getWhatsappCompraUrl={getWhatsappCompraUrl}
                />

                <BeneficiosCompra />

                <ComoComprar />

                <section className="buy-content">
                    {loading && (
                        <div className="buy-state">
                            <div className="buy-loader" />
                            <p>Cargando productos...</p>
                        </div>
                    )}

                    {!loading && error && (
                        <div className="buy-state error">
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && productosFiltrados.length === 0 && (
                        <div className="buy-state">
                            <ShoppingBag size={46} />

                            <h2>No hay productos disponibles</h2>

                            <p>
                                {search
                                    ? "No encontramos productos con ese filtro."
                                    : "Todavía no hay productos activos para mostrar."}
                            </p>
                        </div>
                    )}

                    {!loading && !error && productosFiltrados.length > 0 && (
                        <div className="buy-grid">
                            {productosFiltrados.map((producto) => (
                                <ProductoCard
                                    key={producto.id}
                                    producto={producto}
                                    onCrearIA={handleCrearIA}
                                    getWhatsappCompraUrl={getWhatsappCompraUrl}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <ModalCrearIA
                    selectedProducto={selectedProducto}
                    selectedPrompt={selectedPrompt}
                    copied={copied}
                    onClose={closeModal}
                    onCopy={copiarPrompt}
                />
            </main>

            <Footers />
        </>
    );
}

export default Buy;