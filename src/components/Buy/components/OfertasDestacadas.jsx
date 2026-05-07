// src/components/Buy/components/OfertasDestacadas.jsx

import React from "react";
import { BadgePercent, ShoppingBag, Sparkles } from "lucide-react";
import { FALLBACK_IMG, formatPrice } from "../helpers/buyHelpers";

function OfertasDestacadas({ productosEnOferta = [], getWhatsappCompraUrl, onCrearIA }) {
    if (!productosEnOferta.length) return null;

    return (
        <section className="buy-offers-section">
            <div className="buy-section-heading">
                <span className="buy-section-kicker">
                    <BadgePercent size={17} />
                    Ofertas destacadas
                </span>

                <h2>Productos con precio especial</h2>

                <p>
                    Promos seleccionadas para personalizar la identificación de tu mascota
                    con diseño profesional y compra rápida por WhatsApp.
                </p>
            </div>

            <div className="buy-offers-highlight-grid">
                {productosEnOferta.map((producto) => (
                    <article className="buy-offer-highlight-card" key={producto.id}>
                        <div className="buy-offer-highlight-img">
                            <img
                                src={producto.imagenes?.[0] || FALLBACK_IMG}
                                alt={producto.titulo}
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMG;
                                }}
                            />

                            <span className="buy-offer-floating-badge">
                                <BadgePercent size={14} />
                                Precio especial
                            </span>
                        </div>

                        <div className="buy-offer-highlight-body">
                            <div>
                                <h3>{producto.titulo}</h3>

                                <p>
                                    {producto.descripcion ||
                                        "Producto SmartPet personalizado con diseño único."}
                                </p>
                            </div>

                            <div className="buy-offer-highlight-price">
                                <span>Promo</span>
                                <strong>{formatPrice(producto.precio)}</strong>
                            </div>

                            <div className="buy-offer-highlight-actions">
                                <a
                                    href={getWhatsappCompraUrl(producto)}
                                    className="buy-offer-action primary"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <ShoppingBag size={17} />
                                    Comprar
                                </a>

                                {onCrearIA && (
                                    <button
                                        type="button"
                                        className="buy-offer-action secondary"
                                        onClick={() => onCrearIA(producto)}
                                    >
                                        <Sparkles size={17} />
                                        Crear con IA
                                    </button>
                                )}
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default OfertasDestacadas;