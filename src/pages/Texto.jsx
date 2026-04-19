// Home.jsx
import React, { useCallback } from "react";
import "./home.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import videoSmartPet from "../assets/video/funcionamiento.mp4";
import FAQComponent from "./FAQ";
import Contacto from "./Landing";
import Features from "./Features";

const imagenes = [
    require("../assets/clientes/clientes (3).webp"),
    require("../assets/clientes/clientes (4).webp"),
    require("../assets/clientes/clientes (1).webp"),
    require("../assets/clientes/clientes (5).webp"),
    require("../assets/clientes/clientes (2).webp"),
];

const WA_LINK =
    "https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!";

const Home = React.memo(() => {
    const handleBuyClick = useCallback(() => {
        window.open(WA_LINK, "_blank", "noopener,noreferrer");
    }, []);

    return (
        <main className="sp-main">
            <section className="sp-hero" aria-labelledby="hero-title">
                <h1 id="hero-title" className="sp-hero-title">
                    Protegé a quien más querés con{" "}
                    <span className="sp-highlight">SmartPet</span>
                </h1>
                <p className="sp-hero-sub">
                    El collar inteligente con QR y NFC que conecta a tu mascota con vos,
                    siempre y en cualquier lugar.
                </p>
                <button
                    className="sp-cta"
                    onClick={handleBuyClick}
                    aria-label="Comprar collar SmartPet por WhatsApp"
                    type="button"
                >
                    ¡Quiero el mío! 🐾
                </button>
            </section>

            <Features />

            <section
                className="sp-section sp-carousel-section"
                aria-labelledby="clients-title"
            >

                <h2 id="clients-title" className="sp-section-title">
                    Mascotas SmartPet
                </h2>
                <p className="sp-section-sub">Algunos de nuestros usuarios felices</p>
                <div className="sp-carousel-wrapper">
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={24}
                        slidesPerView={1.2}
                        centeredSlides={true}
                        navigation
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        breakpoints={{
                            480: { slidesPerView: 1.5, spaceBetween: 20 },
                            640: { slidesPerView: 2, spaceBetween: 24 },
                            900: { slidesPerView: 2.5, spaceBetween: 28 },
                            1200: { slidesPerView: 3.2, spaceBetween: 32 },
                            1400: { slidesPerView: 4, spaceBetween: 36, centeredSlides: false },
                        }}
                    >
                        {imagenes.map((src, i) => (
                            <SwiperSlide key={i}>
                                <div className="sp-photo-card">
                                    <img
                                        src={src}
                                        alt={`Mascota usando collar inteligente SmartPet ${i + 1}`}
                                        className="sp-photo"
                                        loading="lazy"
                                        decoding="async"
                                        width="400"
                                        height="500"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
                <div className="sp-cta-center" id="Buy">
                    <button
                        className="sp-cta sp-cta-green"
                        onClick={handleBuyClick}
                        aria-label="Comprar collar SmartPet ahora"
                        type="button"
                    >
                        Comprar Ahora 🛒
                    </button>
                </div>
            </section>

            <section className="sp-section" aria-labelledby="video-title">
                <div className="sp-video-wrap">

                    <h3 id="video-title" className="sp-section-title">
                        Así funciona SmartPet
                    </h3>
                    <div className="sp-video-container">
                        <video
                            src={videoSmartPet}
                            controls
                            className="sp-video"
                            preload="metadata"
                            aria-label="Video explicativo de cómo funciona SmartPet"
                        >
                            Tu navegador no soporta el video.
                        </video>
                    </div>
                    <p className="sp-video-caption">
                        Escaneá el QR o acercá el teléfono al NFC · Sin apps · Contacto inmediato
                    </p>
                </div>
            </section>

            <div className="sp-seo" aria-hidden="true">
                Collares inteligentes para mascotas, chapitas con QR para perros y
                gatos, identificador digital para mascotas, etiquetas NFC para perros,
                SmartPet collar, collar con chip NFC, collar QR gato, collar QR perro,
                SmartPet Argentina, tags inteligentes para animales domésticos.
            </div>

            <section className="sp-section" aria-labelledby="faq-title">
                <FAQComponent />
            </section>

            <section
                className="sp-section contacto-section"
                aria-labelledby="contact-title"
            >
                <Contacto />
            </section>
        </main>
    );
});

Home.displayName = "Home";

export default Home;