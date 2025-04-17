import React, { useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import { Button } from "react-bootstrap";
import Contacto from "./Landing";

const cardsData = [
    {
        title: "¿Qué es SmartPet?",
        content: [
            "SmartPet es mucho más que una chapita. Es un collar con QR y/o chip NFC que almacena toda la información vital de tu mascota.",
            "Con solo escanearlo, cualquier persona puede ver los datos y contactarte al instante.",
            "Ideal para emergencias, viajes o si tu mascota se pierde. Incluso muestra la última ubicación donde fue escaneado."
        ]
    },
    {
        title: "¿Cómo Funciona?",
        content: [
            "🟣 Recibís un código único junto con tu compra.",
            "🟣 Lo activás en nuestra web en minutos.",
            "🟣 Cargás los datos de tu mascota: foto, nombre, edad, ciudad, tratamientos médicos y dos contactos de emergencia.",
            "🟣 ¡Y listo! Tu mascota ya está conectada a vos las 24hs."
        ]
    },
    {
        title: "¿Por Qué Elegir SmartPet?",
        content: [
            "✔️ Material ultra resistente: resina epoxi y plástico sublimable.",
            "✔️ Compatible con cualquier smartphone (sin app).",
            "✔️ Contacto directo vía WhatsApp, llamada o Instagram.",
            
            "✔️ Podés editar los datos cuantas veces quieras, sin cambiar el collar."
        ]
    },
    {
        title: "Diseñá el Collar Ideal",
        content: [
            "🎨 Elegí color, tamaño, chip NFC o solo QR.",
            "🎨 Añadí nombre, diseños, fondo y más detalles únicos.",
            "🎨 Producción personalizada: de 3 a 5 días (1 a 2 si es sublimado).",
            "🎨 Porque tu mascota es única... su collar también debería serlo."
        ]
    },
    {
        title: "Nuestra Misión",
        content: [
            "Hacer que, si tu mascota se pierde, puedan contactarte al instante escaneando el collar.",
            "Y nuestra visión es simple: que vos puedas actualizar los datos siempre que lo necesites, sin tener que cambiar el accesorio."
        ]
    },
    {
        title: "La Historia Detrás",
        content: [
            "En mayo de 2023, mi perrita Minerva se perdió en Rosario.",
            "El número mal escrito en su chapita retrasó que pudiera volver a casa.",
            "Ese error, sumado a un curso de programación y un video en TikTok, me inspiró a crear SmartPet.",
            "Después de investigar materiales, descubrí la resina epoxi perfecta para proteger el chip NFC. Así nació SmartPet: tecnología con corazón."
        ]
    }
];

const Texto = () => {
    const carouselRef = useRef();

    const scrollCards = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className="text-center px-3">
            {/* Título principal */}
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

            {/* Cards horizontales como slider */}
            <div id="About" className="card-slider-container">
                <Button
                    variant="outline-secondary"
                    className="carousel-control-prev"
                    onClick={() => scrollCards("left")}
                >
                    &lt;
                </Button>
                <div
                    className="d-flex overflow-auto flex-nowrap gap-3 px-2 pb-3"
                    style={{ scrollSnapType: "x mandatory" }}
                    ref={carouselRef}
                >
                    {cardsData.map((card, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 card p-3 text-start"
                            style={{
                                minWidth: "280px",
                                maxWidth: "300px",
                                scrollSnapAlign: "center",
                                borderRadius: "1rem",
                            }}
                        >
                            <h4 className="fw-bold mb-3">{card.title}</h4>
                            {card.content.map((paragraph, idx) => (
                                <p className="mb-2" key={idx}>{paragraph}</p>
                            ))}
                        </div>
                    ))}
                </div>
                <Button
                    variant="outline-secondary"
                    className="carousel-control-next"
                    onClick={() => scrollCards("right")}
                >
                    &gt;
                </Button>
            </div>

            {/* SECCIÓN DE REGISTRO Y COMPRA */}
            <div id="Buy" className="my-5 px-3">
                <h3 className="mt-4 fw-semibold text-center">¡Protegé a tu Mascota Hoy Mismo!</h3>
                <p>
                    Registrate en segundos, ingresá el código único del collar y personalizá el perfil de tu mascota con foto, datos importantes y contactos.
                </p>
                <p>
                    Rápido, fácil y seguro. ¡Dale a tu mascota la seguridad que se merece!
                </p>
                <Button
                    variant="success"
                    className="my-3"
                    onClick={() =>
                        window.open(
                            "https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!",
                            "_blank"
                        )
                    }
                >
                    Comprar Ahora
                </Button>
            </div>

            {/* CONTACTO FINAL */}
            <Contacto />


            {/* AGREGAR CARRUSEL CON IMAGENES DE COLLARES YA HECHOS     */}
        </div>
    );
};

export default Texto;
