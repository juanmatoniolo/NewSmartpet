import React from "react";
import "./home.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import videoSmartPet from "../assets/video/funcionamiento.mp4";
import FAQComponent from "./FAQ";
import Contacto from "./Landing";
import Features from "./Features";

const cardsData = [
    {
        title: "¿Qué es SmartPet?",
        icon: "🏷️",
        content: [
            "Un collar con QR y/o chip NFC que almacena toda la info vital de tu mascota.",
            "Al escanearlo, cualquier persona puede ver los datos y contactarte al instante.",
            "Muestra la última ubicación donde fue escaneado.",
        ],
    },
    {
        title: "¿Cómo funciona?",
        icon: "⚡",
        content: [
            "🟣 Recibís un código único con tu compra.",
            "🟣 Lo activás en nuestra web.",
            "🟣 Cargás los datos: foto, nombre, edad, tratamientos y contactos.",
            "🟣 ¡Listo! Tu mascota está conectada 24/7.",
        ],
    },
    {
        title: "¿Por qué elegirnos?",
        icon: "✅",
        content: [
            "✔️ Material resistente: resina epoxi y sublimable.",
            "✔️ Compatible con cualquier smartphone, sin app.",
            "✔️ Contacto directo vía WhatsApp, llamada o Instagram.",
            "✔️ Editá los datos sin cambiar el collar.",
        ],
    },
    {
        title: "Diseñá el collar ideal",
        icon: "🎨",
        content: [
            "🎨 Elegí color, tamaño, NFC o solo QR.",
            "🎨 Añadí nombre, fondo y detalles únicos.",
            "🎨 Producción en 3-5 días (1-2 si es sublimado).",
            "🎨 Porque tu mascota es única, su collar también.",
        ],
    },
    {
        title: "Nuestra misión",
        icon: "💜",
        content: [
            "Facilitar que si tu mascota se pierde, puedan contactarte al instante.",
            "Actualizá los datos cuando lo necesites, sin cambiar el accesorio.",
        ],
    },
    {
        title: "La historia detrás",
        icon: "📖",
        content: [
            "En mayo de 2023, Minerva se perdió en Rosario.",
            "El número mal escrito en su chapa retrasó todo.",
            "Ese error inspiró SmartPet: tecnología con corazón.",
        ],
    },
];

const imagenes = [
    require("../assets/clientes/clientes (3).webp"),
    require("../assets/clientes/clientes (4).webp"),
    require("../assets/clientes/clientes (1).webp"),
    require("../assets/clientes/clientes (5).webp"),
    require("../assets/clientes/clientes (2).webp"),
];

const WA_LINK = "https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!";

const Home = () => {
    return (
        <main className="sp-main">

            {/* HERO */}
            <section className="sp-hero">
                <p className="sp-eyebrow">🐾 Tecnología para mascotas</p>
                <h1 className="sp-hero-title">
                    Protegé a quien más querés con{" "}
                    <span className="sp-highlight">SmartPet</span>
                </h1>
                <p className="sp-hero-sub">
                    El collar inteligente con QR y NFC que conecta a tu mascota con vos,
                    siempre y en cualquier lugar.
                </p>
                <button
                    className="sp-cta"
                    onClick={() => window.open(WA_LINK, "_blank")}
                    aria-label="Comprar collar SmartPet por WhatsApp"
                >
                    ¡Quiero el mío! 🐾
                </button>
            </section>

            {/* CARDS */}
            <Features />
            {/* CLIENTES */}
            <section className="sp-section" aria-labelledby="clients-title">
                <h2 id="clients-title" className="sp-section-title">Mascotas SmartPet</h2>
                <p className="sp-section-sub">Algunos de nuestros usuarios felices</p>
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={16}
                    slidesPerView={1.3}
                    navigation
                    autoplay={{ delay: 3000, disableOnInteraction: true }}
                    breakpoints={{
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 },
                    }}
                >
                    {imagenes.map((src, i) => (
                        <SwiperSlide key={i}>
                            <div className="sp-photo-card">
                                <img
                                    src={src}
                                    alt={`Mascota con collar SmartPet ${i + 1}`}
                                    className="sp-photo"
                                    loading="lazy"
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <div className="sp-cta-center" id="Buy">
                    <button
                        className="sp-cta sp-cta-green"
                        onClick={() => window.open(WA_LINK, "_blank")}
                        aria-label="Comprar collar SmartPet ahora"
                    >
                        Comprar Ahora 🛒
                    </button>
                </div>
            </section>

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



            {/* SEO oculto semántico */}
            <div className="sp-seo" aria-hidden="true">
                Collares inteligentes para mascotas, chapitas con QR para perros y gatos,
                identificador digital para mascotas, etiquetas NFC para perros, SmartPet
                collar, collar con chip NFC, collar QR gato, collar QR perro, SmartPet
                Argentina, tags inteligentes para animales domésticos.
            </div>

            {/* FAQ */}
            <section className="sp-section" aria-labelledby="faq-title">
                <FAQComponent />
            </section>

            {/* CONTACTO */}
            <section className="sp-section contacto-section" aria-labelledby="contact-title">
                <Contacto />
            </section>

        </main>
    );
};

export default Home;