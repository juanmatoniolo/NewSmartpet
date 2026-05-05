// src/components/Buy/components/OfertasDestacadas.jsx

import React from "react";
import { BadgePercent } from "lucide-react";
import { FALLBACK_IMG, formatPrice } from "../helpers/buyHelpers";

function OfertasDestacadas({ productosEnOferta = [], getWhatsappCompraUrl }) {
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
                    Aprovechá productos seleccionados para identificar, proteger y
                    personalizar a tu mascota con diseño profesional.
                </p>
            </div>

            <div className="buy-offers-strip">
                {productosEnOferta.map((producto) => (
                    <a
                        key={producto.id}
                        href={getWhatsappCompraUrl(producto)}
                        className="buy-offer-item"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <div className="buy-offer-img-wrap">
                            <img
                                src={producto.imagenes?.[0] || FALLBACK_IMG}
                                alt={producto.titulo}
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMG;
                                }}
                            />
                        </div>

                        <div className="buy-offer-info">
                            <span className="buy-offer-label">Oferta</span>

                            <strong>{producto.titulo}</strong>

                            <small>
                                {producto.descripcion ||
                                    "Producto SmartPet personalizado."}
                            </small>

                            <b>{formatPrice(producto.precio)}</b>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}

export default OfertasDestacadas;