import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Button } from "react-bootstrap";
import Contacto from "./Landing";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const cardsData = [
    {
        title: "¿Qué es SmartPet?",
        content: [
            "SmartPet es más que una chapita. Es un collar con QR y/o chip NFC que almacena toda la información vital de tu mascota.",
            "Al escanearlo, cualquier persona puede ver los datos y contactarte al instante.",
            "Ideal para emergencias, viajes o pérdidas. Incluso muestra la última ubicación donde fue escaneado."
        ]
    },
    {
        title: "¿Cómo Funciona?",
        content: [
            "🟣 Recibís un código único con tu compra.",
            "🟣 Lo activás en nuestra web.",
            "🟣 Cargás los datos: foto, nombre, edad, tratamientos y contactos.",
            "🟣 ¡Listo! Tu mascota está conectada a vos 24/7."
        ]
    },
    {
        title: "¿Por Qué Elegirnos?",
        content: [
            "✔️ Material resistente: resina epoxi y plástico sublimable.",
            "✔️ Compatible con cualquier smartphone, sin app.",
            "✔️ Contacto directo vía WhatsApp, llamada o Instagram.",
            "✔️ Editá los datos sin cambiar el collar."
        ]
    },
    {
        title: "Diseñá el Collar Ideal",
        content: [
            "🎨 Elegí color, tamaño, chip NFC o solo QR.",
            "🎨 Añadí nombre, fondo y detalles únicos.",
            "🎨 Producción personalizada: de 3 a 5 días (1 a 2 si es sublimado).",
            "🎨 Porque tu mascota es única, su collar también debe serlo."
        ]
    },
    {
        title: "Nuestra Misión",
        content: [
            "Facilitar que si tu mascota se pierde, puedan contactarte al instante escaneando el collar.",
            "Actualizá los datos cuando lo necesites, sin cambiar el accesorio."
        ]
    },
    {
        title: "La Historia Detrás",
        content: [
            "En mayo de 2023, mi perrita Minerva se perdió en Rosario.",
            "El número mal escrito en su chapa retrasó que pudiera volver a casa.",
            "Ese error, un curso de programación y un video en TikTok inspiraron SmartPet.",
            "Después de mucha investigación, nació SmartPet: tecnología con corazón."
        ]
    }
];

const Texto = () => {
    return (
        <div className="text-center px-3">
            <header className="my-5">
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
                        window.open(
                            "https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!",
                            "_blank"
                        )
                    }
                >
                    ¡Quiero el mío!
                </Button>
            </header>

            <section id="About" className="my-5">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20}
                    slidesPerView={1}
                    navigation
                    breakpoints={{
                        400: { slidesPerView: 1.3 },
                        576: { slidesPerView: 2 },
                        768: { slidesPerView: 3 },
                        992: { slidesPerView: 4 }
                    }}
                >
                    {cardsData.map((card, index) => (
                        <SwiperSlide key={index}>
                            <div className="card p-3 text-start h-100 card-shadow">
                                <h4 className="fw-bold mb-3 text-brand">{card.title}</h4>
                                {card.content.map((paragraph, idx) => (
                                    <p className="mb-2" key={idx}>{paragraph}</p>
                                ))}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </section>

            <section id="Buy" className="my-5 px-3">
                <h3 className="mt-4 fw-semibold text-brand">¡Protegé a tu Mascota Hoy Mismo!</h3>
                <p>
                    Registrate, ingresá el código único del collar y personalizá el perfil de tu mascota con foto, datos importantes y contactos.
                </p>
                <p>
                    Rápido, fácil y seguro. ¡Dale a tu mascota la seguridad que se merece!
                </p>
                <Button
                    variant="success"
                    className="cta-button my-3"
                    onClick={() =>
                        window.open(
                            "https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!",
                            "_blank"
                        )
                    }
                >
                    Comprar Ahora
                </Button>
            </section>

            <Contacto />
        </div>
    );
};

export default Texto;
