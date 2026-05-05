// src/components/Buy/components/ProductoCard.jsx

import React from "react";
import {
    BadgePercent,
    ChevronLeft,
    ChevronRight,
    ShoppingBag,
    Sparkles,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { FALLBACK_IMG, formatPrice } from "../helpers/buyHelpers";

function ProductoCard({ producto, onCrearIA, getWhatsappCompraUrl }) {
    return (
        <article className="buy-card">
            <div className="buy-card-image-wrap">
                {producto.oferta && (
                    <span className="buy-offer-badge">
                        <BadgePercent size={15} />
                        Oferta
                    </span>
                )}

                <Swiper
                    className="buy-swiper"
                    modules={[Navigation, Pagination, A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation={{
                        prevEl: `.buy-prev-${producto.id}`,
                        nextEl: `.buy-next-${producto.id}`,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    a11y={{
                        prevSlideMessage: "Imagen anterior",
                        nextSlideMessage: "Imagen siguiente",
                    }}
                >
                    {producto.imagenes.map((imagen, index) => (
                        <SwiperSlide key={`${producto.id}-${index}`}>
                            <img
                                src={imagen}
                                alt={`${producto.titulo} imagen ${index + 1}`}
                                className="buy-card-image"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src = FALLBACK_IMG;
                                }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>

                {producto.imagenes.length > 1 && (
                    <>
                        <button
                            type="button"
                            className={`buy-carousel-btn buy-carousel-btn-left buy-prev-${producto.id}`}
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <button
                            type="button"
                            className={`buy-carousel-btn buy-carousel-btn-right buy-next-${producto.id}`}
                            aria-label="Imagen siguiente"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </>
                )}
            </div>

            <div className="buy-card-body">
                <div className="buy-card-main-info">
                    <h2>{producto.titulo}</h2>

                    <p className="buy-card-description">
                        {producto.descripcion || "Sin descripción disponible."}
                    </p>
                </div>

                <div className="buy-card-meta">
                    <div>
                        <span>Precio</span>
                        <strong>{formatPrice(producto.precio)}</strong>
                    </div>

                    {producto.oferta && (
                        <small>
                            <BadgePercent size={14} />
                            Producto en oferta
                        </small>
                    )}
                </div>

                <div className="buy-card-actions">
                    <button
                        type="button"
                        className="buy-action-btn ai"
                        onClick={() => onCrearIA(producto)}
                    >
                        <Sparkles size={17} />
                        Crear con IA
                    </button>

                    <a
                        href={getWhatsappCompraUrl(producto)}
                        className="buy-action-btn buy"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <ShoppingBag size={17} />
                        Comprar
                    </a>
                </div>
            </div>
        </article>
    );
}

export default ProductoCard;