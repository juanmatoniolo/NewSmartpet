import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import "./faq.css";

const faqs = [
    {
        question: "¿Tengo que pagar una cuota mensual?",
        answer: "No. Pagás una sola vez al adquirir el producto. Sin suscripciones ni costos ocultos.",
    },
    {
        question: "¿Puedo agregar varios collares a una misma cuenta?",
        answer: "Sí, podés agregar todos los collares que quieras. Cada uno tiene un código único para identificar a cada mascota.",
    },
    {
        question: "¿Cuál es el alcance máximo del collar?",
        answer: "No hay límite. Cuando alguien escanea el QR o acerca su celular al chip NFC, recibís la ubicación gracias al GPS del teléfono de quien encontró a tu mascota.",
    },
    {
        question: "¿Los collares necesitan baterías o recarga?",
        answer: "No. Funcionan con tecnología pasiva — siempre activos, sin baterías, sin carga, sin mantenimiento.",
    },
];

const FAQComponent = () => {
    const [active, setActive] = useState(null);

    const toggle = (i) => setActive(active === i ? null : i);

    return (
        <div className="faq-wrap">
            <span className="sp-label">FAQ</span>
            <h2 className="faq-title">Preguntas frecuentes</h2>
            <p className="faq-desc">
                Todo lo que necesitás saber sobre SmartPet antes de dar el paso.
            </p>

            <div className="faq-list">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        className={`faq-item ${active === i ? "open" : ""}`}
                    >
                        <button
                            className="faq-question"
                            onClick={() => toggle(i)}
                            aria-expanded={active === i}
                        >
                            <span>{faq.question}</span>
                            <span className="faq-icon">
                                {active === i ? <AiOutlineMinus /> : <AiOutlinePlus />}
                            </span>
                        </button>
                        <div className="faq-answer">
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FAQComponent;