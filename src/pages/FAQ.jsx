// FAQComponent.jsx
import React, { useState, useCallback, memo } from "react";
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
    {
        question: "¿El collar resiste el agua y los juegos?",
        answer: "Sí. La resina epoxi y el sublimado con capa protectora están diseñados para acompañar a tu mascota en sus aventuras diarias sin despegarse ni dañarse.",
    },
    {
        question: "¿Cómo recibo mi pedido?",
        answer: "Coordinamos envío a domicilio o punto de encuentro. Si querés más de un collar, te lo llevo personalmente. Hablame por WhatsApp y lo arreglamos.",
    },
    {
        question: "¿Y si quien encuentra a mi mascota no tiene un teléfono moderno?",
        answer: "El QR funciona con cualquier smartphone con cámara. El NFC es un plus para los más tecnológicos, pero no es obligatorio: todos los collares llevan QR.",
    },
];

const FAQComponent = memo(() => {
    const [active, setActive] = useState(null);

    const toggle = useCallback((i) => {
        setActive(prev => prev === i ? null : i);
    }, []);

    return (
        <div className="faq-wrap">

            <h2 className="faq-title">Preguntas frecuentes</h2>
            <p className="faq-desc">
                Todo lo que necesitás saber sobre SmartPet antes de dar el paso.
            </p>
            <div className="faq-list">
                {faqs.map((faq, i) => (
                    <div key={i} className={`faq-item ${active === i ? "open" : ""}`}>
                        <button
                            className="faq-question"
                            onClick={() => toggle(i)}
                            aria-expanded={active === i}
                            type="button"
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
});

FAQComponent.displayName = "FAQComponent";

export default FAQComponent;