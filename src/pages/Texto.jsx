import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Button } from "react-bootstrap";
import Contacto from "./Landing";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import videoSmartPet from "../assets/video/funcionamiento.mp4";

const cardsData = [
    {
        title: "¿Qué es SmartPet?",
        content: [
            "SmartPet es más que una chapita. Es un collar con QR y/o chip NFC que almacena toda la información vital de tu mascota.",
            "Al escanearlo, cualquier persona puede ver los datos y contactarte al instante.",
            "Ideal para emergencias, viajes o pérdidas. Incluso muestra la última ubicación donde fue escaneado.",
        ],
    },
    {
        title: "¿Cómo Funciona?",
        content: [
            "🟣 Recibís un código único con tu compra.",
            "🟣 Lo activás en nuestra web.",
            "🟣 Cargás los datos: foto, nombre, edad, tratamientos y contactos.",
            "🟣 ¡Listo! Tu mascota está conectada a vos 24/7.",
        ],
    },
    {
        title: "¿Por Qué Elegirnos?",
        content: [
            "✔️ Material resistente: resina epoxi y plástico sublimable.",
            "✔️ Compatible con cualquier smartphone, sin app.",
            "✔️ Contacto directo vía WhatsApp, llamada o Instagram.",
            "✔️ Editá los datos sin cambiar el collar.",
        ],
    },
    {
        title: "Diseñá el Collar Ideal",
        content: [
            "🎨 Elegí color, tamaño, chip NFC o solo QR.",
            "🎨 Añadí nombre, fondo y detalles únicos.",
            "🎨 Producción personalizada: de 3 a 5 días (1 a 2 si es sublimado).",
            "🎨 Porque tu mascota es única, su collar también debe serlo.",
        ],
    },
    {
        title: "Nuestra Misión",
        content: [
            "Facilitar que si tu mascota se pierde, puedan contactarte al instante escaneando el collar.",
            "Actualizá los datos cuando lo necesites, sin cambiar el accesorio.",
        ],
    },
    {
        title: "La Historia Detrás",
        content: [
            "En mayo de 2023, mi perrita Minerva se perdió en Rosario.",
            "El número mal escrito en su chapa retrasó que pudiera volver a casa.",
            "Ese error, un curso de programación y un video en TikTok inspiraron SmartPet.",
            "Después de mucha investigación, nació SmartPet: tecnología con corazón.",
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

const Texto = () => {
    return (
        <main className="smartpet-main container-fluid px-3 text-center">
            <section className="hero my-5">
                <h1 className="title">
                    Protegé a quien más querés con <span className="highlight">SmartPet</span>
                </h1>
                <p className="subtitle">
                    El collar inteligente que conecta a tu mascota con vos, siempre y en cualquier lugar.
                </p>
                <Button
                    variant="primary"
                    className="cta-button mt-3"
                    onClick={() =>
                        window.open("https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!", "_blank")
                    }
                >
                    ¡Quiero el mío!
                </Button>
            </section>

            <section className="cards-section bg-white rounded p-4 my-4">
                <h2 className="text-brand mb-4">¿Por qué elegir SmartPet?</h2>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={10}
                    slidesPerView={1}
                    navigation
                    breakpoints={{
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 },
                    }}
                >
                    {cardsData.map((card, index) => (
                        <SwiperSlide key={index}>
                            <div className="card-custom p-3 text-start h-100">
                                <h4 className="fw-bold mb-3 text-brand">{card.title}</h4>
                                {card.content.map((paragraph, idx) => (
                                    <p className="mb-2" key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            <section className="clientes-section my-5">
                <h3 className="fw-semibold text-brand">Mascotas SmartPet</h3>
                <p className="text-muted mb-3">Algunos de nuestros usuarios felices</p>
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={1.2}
                    navigation
                    breakpoints={{
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 },
                    }}
                >
                    {imagenes.map((url, index) => (
                        <SwiperSlide key={index}>
                            <div className="card-custom p-2">
                                <img
                                    src={url}
                                    alt={`Mascota SmartPet ${index + 1}`}
                                    className="img-fluid rounded"
                                    style={{ maxHeight: "300px", objectFit: "cover" }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <Button
                    variant="success"
                    className="cta-button my-4"
                    id="Buy"
                    onClick={() =>
                        window.open("https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!", "_blank")
                    }
                >
                    Comprar Ahora
                </Button>
            </section>

            <section className="video-section bg-white rounded p-4 mt-5">
                <h3 className="fw-bold text-brand mb-4">¿Cómo Funciona?</h3>
                <div className="video-card card-shadow rounded">
                    <video
                        src={videoSmartPet}
                        controls
                        className="w-100 rounded"
                        style={{ maxHeight: "500px", objectFit: "contain" }}
                    >
                        Tu navegador no soporta el video.
                    </video>
                    <p className="mt-3 fw-semibold">Mirá cómo funciona SmartPet en la vida real</p>
                </div>
            </section>

            <section className="contacto-section mt-5">
                <Contacto />
            </section>
            <div className="seo-keywords">
                Collares inteligentes para mascotas, chapitas con QR para perros y gatos, identificador digital para mascotas, etiquetas NFC para perros, SmartPet collar, collar con chip NFC, collar QR gato, collar QR perro, accesorios inteligentes para mascotas, collar con geolocalización para perros, identificación rápida para mascotas, SmartPet Argentina, tag con chip para mascotas, QR en chapa, tags inteligentes para animales domésticos.
            </div>

        </main>
    );
};

export default Texto;
