import React, { useState } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai"; // Importamos íconos
import "./faq.css";

const FAQComponent = () => {
    const [activeTab, setActiveTab] = useState(null);

    const toggleTab = (tabIndex) => {
        setActiveTab(activeTab === tabIndex ? null : tabIndex);
    };
    const faqs = [
        {
            question: "¿Tengo que pagar una cuota mensual?",
            answer: "No, los collares con QR o etiquetas con chip NFC de SmartPet no requieren ningún tipo de suscripción ni cuota mensual. Pagás solo una vez al adquirir el producto.",
        },
        {
            question: "¿Puedo agregar varios collares inteligentes a una misma cuenta?",
            answer: "Sí, podés agregar tantos collares con QR o etiquetas NFC como quieras desde tu cuenta. Cada uno tiene un código único para identificar a cada mascota.",
        },
        {
            question: "¿Cuál es el alcance máximo del collar inteligente?",
            answer: "No hay límite de alcance. Cuando alguien escanea el QR o acerca su celular al chip NFC del collar, podés recibir la ubicación gracias a los datos GPS del teléfono de la persona que encontró a tu mascota.",
        },
        {
            question: "¿Los collares con QR o chip NFC necesitan baterías?",
            answer: "No. Los collares funcionan sin baterías, ondas ni necesidad de recarga. Están siempre activos gracias a la tecnología pasiva del QR y del chip NFC.",
        },
    ];


    return (
        <div className="elementor-element e-flex e-con-boxed e-con e-parent faq-container">
            <div className="e-con-inner">
                <div className="elementor-element e-con-full e-flex e-con e-child">
                    <div className="elementor-widget-container">
                        <div className="elementor-image-box-wrapper">
                            <div className="elementor-image-box-content">
                                <h2 className="faq-title">Preguntas frecuentes</h2>
                                <p className="faq-description">
                                    Explore los detalles esenciales de las etiquetas inteligentes para
                                    mascotas, su fuente de referencia para la identificación avanzada de
                                    mascotas. Aprenda cómo nuestra tecnología de vanguardia garantiza la
                                    seguridad de su mascota y descubra las características clave que
                                    distinguen a nuestras etiquetas inteligentes.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="elementor-widget-container faq-accordion">
                    <div className="elementor-accordion">
                        {faqs.map((faq, index) => (
                            <div className="elementor-accordion-item" key={index}>
                                <div
                                    className="elementor-tab-title"
                                    onClick={() => toggleTab(index)}
                                    aria-expanded={activeTab === index ? "true" : "false"}
                                >
                                    <span className="elementor-accordion-icon">
                                        {activeTab === index ? <AiOutlineMinus /> : <AiOutlinePlus />}
                                    </span>
                                    {faq.question}
                                </div>
                                <div
                                    className="elementor-tab-content"
                                    style={{ display: activeTab === index ? "block" : "none" }}
                                >
                                    <p>{faq.answer}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQComponent;
