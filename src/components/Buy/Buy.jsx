// Buy.jsx
import React, { useCallback, useEffect, useState } from "react";
import "./buy.css";
import SmartHeader from "../nav/SmartHeader";
import WhatsAppButton from "../btnWhatsapp/Whatsapp";
import Footers from "../footer/Footer";

const modelos = [
    {
        id: 1,
        nombre: "Camiseta",
        nombreCompleto: "Camiseta / Remera",
        descripcion: "Forma de camiseta de fútbol. Ideal para personalizar con colores de equipo.",
        dimensiones: "5.7 cm alto x 5.0 cm ancho, espesor 4 mm",
        color: "Blanco sublimable",
        area: "COMPLETO",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_812894-MLA79793399170_102024-F.webp",
        especificaciones: "Camiseta de fútbol, 5.7cm alto x 5.0cm ancho, espesor 4mm, blanco sublimable",
    },
    {
        id: 2,
        nombre: "Circular",
        nombreCompleto: "Circular",
        descripcion: "Diseño clásico circular, perfecto para logos o iniciales.",
        dimensiones: "4 cm diámetro, espesor 4 mm",
        color: "Blanco",
        area: "COMPLETO",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_646156-MLA82474583363_022025-F.webp",
        especificaciones: "Circular, 4cm diámetro, espesor 4mm, blanco",
    },
    {
        id: 3,
        nombre: "Huesito",
        nombreCompleto: "Huesito de perro",
        descripcion: "Forma de hueso, la favorita de los perros.",
        dimensiones: "4 cm alto x 6 cm ancho, espesor 4 mm",
        color: "Blanco",
        area: "COMPLETO",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_776522-MLA80444222695_112024-F.webp",
        especificaciones: "Huesito, 4cm alto x 6cm ancho, espesor 4mm, blanco",
    },
    {
        id: 4,
        nombre: "Pez",
        nombreCompleto: "Pez",
        descripcion: "Llavero con forma de pez, sublimable por ambos lados.",
        dimensiones: "Ancho 4.2 cm, Alto 3.3 cm, espesor 3 mm",
        color: "Blanco mate",
        area: "AMBOS LADOS",
        imagen: "https://http2.mlstatic.com/D_NQ_NP_2X_753656-MLA45603466232_042021-F.webp",
        especificaciones: "Pez, 4.2cm ancho x 3.3cm alto, espesor 3mm, blanco mate, sublimable ambos lados",
    },
];

const WA_BASE = "https://wa.me/+5493412275598";

const Buy = React.memo(() => {
    const [expandedCard, setExpandedCard] = useState(null);

    useEffect(() => {
        document.title = "Comprar | SmartPet - Modelos de collares inteligentes";
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute(
                "content",
                "Elegí el modelo de collar inteligente SmartPet: camiseta, circular, huesito o pez. QR, NFC, personalizables y resistentes. Diseñá tu propio collar online."
            );
        }
    }, []);

    const handleBuyClick = useCallback((modelo) => {
        const mensaje = encodeURIComponent(
            `¡Hola! Estoy interesado en comprar el modelo ${modelo.nombreCompleto}. Ya tengo el diseño listo.`
        );
        window.open(`${WA_BASE}?text=${mensaje}`, "_blank", "noopener,noreferrer");
    }, []);

    const handleDesignClick = useCallback((modelo) => {
        const prompt = encodeURIComponent(
            `Necesito que diseñes una chapa identificadora para mascotas personalizada.\n\n` +
            `📐 INFORMACIÓN DEL MODELO BASE:\n` +
            `Forma: ${modelo.especificaciones}\n` +
            `Imagen de referencia (ESTA ES LA FORMA EXACTA que debes usar): ${modelo.imagen}\n` +
            `Dimensiones reales: ${modelo.dimensiones}\n\n` +

            `🎨 INSTRUCCIONES PARA VOS:\n` +
            `Ahora describime cómo querés tu diseño. Podés:\n` +
            `- Subir una imagen de inspiración y pedirme que la adapte\n` +
            `- Describir colores (ej: "azul y rosa pastel", "rojo con dorado")\n` +
            `- Indicar el nombre de tu mascota\n` +
            `- Agregar elementos (ej: "con huellas", "con corazones", "estilo minimalista")\n` +
            `- Especificar tipografía (ej: "letra cursiva", "mayúsculas bold")\n\n` +

            `✨ LO QUE VOY A GENERAR:\n` +
            `Una imagen PNG con fondo transparente que incluye:\n` +
            `- FRENTE: Tu diseño personalizado con nombre y decoración\n` +
            `- DORSO: Diseño coordinado con espacio central en blanco para el código QR\n` +
            `Ambas vistas en la MISMA imagen, lado a lado, respetando las dimensiones exactas del modelo.\n\n` +

            `🔧 ESPECIFICACIONES TÉCNICAS (las manejo yo):\n` +
            `- Fondo transparente\n` +
            `- Alta resolución (300 DPI mínimo)\n` +
            `- El dorso tendrá un área rectangular/cuadrada central en blanco puro (~60% del espacio) para el QR\n` +
            `- Bordes y colores del dorso coordinados con el frente\n` +
            `- Formato listo para impresión sublimada\n\n` +

            `💬 AHORA SÍ, CONTAME: ¿Cómo querés tu diseño?`
        );
        window.open(`https://chat.openai.com/?prompt=${prompt}`, "_blank", "noopener,noreferrer");
    }, []);

    const toggleCard = useCallback((id) => {
        setExpandedCard(prev => prev === id ? null : id);
    }, []);

    return (
        <>
            <SmartHeader />
            <WhatsAppButton mensaje="Hola, quiero información sobre los collares SmartPet" />
            <main className="buy-page">
                <section className="buy-hero">
                    <h1 className="buy-title">Diseñá y comprá tu collar inteligente</h1>
                    <p className="buy-subtitle">
                        Elegí el modelo, personalizalo con IA y recibilo en tu casa
                    </p>
                </section>

                <section className="how-it-works">
                    <div className="how-container">
                        <h2 className="how-title">¿Cómo funciona?</h2>
                        <div className="steps-grid">
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <div className="step-icon">🎨</div>
                                <h3 className="step-title">Elegí tu modelo</h3>
                                <p className="step-text">
                                    Seleccioná entre camiseta, circular, huesito o pez según el estilo de tu mascota
                                </p>
                            </div>
                            <div className="step-card">
                                <div className="step-number">2</div>
                                <div className="step-icon">✨</div>
                                <h3 className="step-title">Diseñá con IA</h3>
                                <p className="step-text">
                                    Nuestro asistente genera frente y dorso personalizados. Solo agregá el nombre y colores favoritos
                                </p>
                            </div>
                            <div className="step-card">
                                <div className="step-number">3</div>
                                <div className="step-icon">💬</div>
                                <h3 className="step-title">Enviá tu diseño</h3>
                                <p className="step-text">
                                    Descargá la imagen y enviala por WhatsApp. Nosotros imprimimos y agregamos el QR en el dorso
                                </p>
                            </div>
                        </div>
                        <div className="how-note">
                            <span className="note-icon">ℹ️</span>
                            <p>
                                <strong>Importante:</strong> El diseño incluye frente decorativo y dorso preparado para que agreguemos tu código QR único.
                                No necesitás preocuparte por el QR, solo personalizá los colores y el nombre.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="buy-grid-section">
                    <h2 className="section-title">Nuestros modelos</h2>
                    <div className="buy-grid">
                        {modelos.map((modelo) => (
                            <article
                                key={modelo.id}
                                className={`modelo-card ${expandedCard === modelo.id ? 'expanded' : ''}`}
                            >
                                <div className="modelo-img-wrapper">
                                    <img
                                        src={modelo.imagen}
                                        alt={`Modelo ${modelo.nombre}`}
                                        className="modelo-img"
                                        loading="lazy"
                                        onError={(e) => {
                                            e.target.src = "https://via.placeholder.com/300x300/ffffff/6C5C94?text=SmartPet";
                                        }}
                                    />
                                </div>
                                <div className="modelo-content">
                                    <div className="modelo-header">
                                        <h3 className="modelo-nombre">{modelo.nombre}</h3>
                                        <span className="modelo-badge">{modelo.area}</span>
                                    </div>
                                    <p className="modelo-descripcion">{modelo.descripcion}</p>

                                    <button
                                        className="specs-toggle"
                                        onClick={() => toggleCard(modelo.id)}
                                        aria-expanded={expandedCard === modelo.id}
                                        aria-label={`${expandedCard === modelo.id ? 'Ocultar' : 'Ver'} especificaciones de ${modelo.nombre}`}
                                    >
                                        <span>Especificaciones</span>
                                        <svg
                                            className={`toggle-icon ${expandedCard === modelo.id ? 'rotated' : ''}`}
                                            width="16"
                                            height="16"
                                            viewBox="0 0 16 16"
                                            fill="none"
                                        >
                                            <path
                                                d="M4 6L8 10L12 6"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                    <div className={`modelo-specs ${expandedCard === modelo.id ? 'visible' : ''}`}>
                                        <div className="spec-item">
                                            <span className="spec-label">Dimensiones</span>
                                            <span className="spec-value">{modelo.dimensiones}</span>
                                        </div>
                                        <div className="spec-item">
                                            <span className="spec-label">Color base</span>
                                            <span className="spec-value">{modelo.color}</span>
                                        </div>
                                        <div className="spec-item">
                                            <span className="spec-label">Tecnología</span>
                                            <span className="spec-value">QR + NFC</span>
                                        </div>
                                    </div>

                                    <div className="modelo-actions">
                                        <button
                                            className="btn-design"
                                            onClick={() => handleDesignClick(modelo)}
                                            aria-label={`Diseñar modelo ${modelo.nombre} con IA`}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                            </svg>
                                            Diseñar con IA
                                        </button>
                                        <button
                                            className="btn-buy"
                                            onClick={() => handleBuyClick(modelo)}
                                            aria-label={`Comprar modelo ${modelo.nombre}`}
                                        >
                                            Comprar
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="faq-section">
                    <div className="faq-container">
                        <h2 className="faq-title">¿Dudas sobre el diseño?</h2>
                        <div className="faq-grid">
                            <div className="faq-item">
                                <h3 className="faq-question">¿Qué genera la IA exactamente?</h3>
                                <p className="faq-answer">
                                    Una imagen PNG con dos vistas: el <strong>frente decorativo</strong> (con nombre y diseño personalizado)
                                    y el <strong>dorso preparado</strong> con espacio reservado para que agreguemos tu código QR.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3 className="faq-question">¿Puedo cambiar colores o agregar elementos?</h3>
                                <p className="faq-answer">
                                    ¡Sí! Una vez que se abre ChatGPT con el prompt, podés pedirle cambios:
                                    "hacelo en azul y rosa", "agregá huellas", "poné el nombre en mayúsculas", etc.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3 className="faq-question">¿Y si no me gusta el resultado?</h3>
                                <p className="faq-answer">
                                    Podés pedirle a la IA que lo regenere con ajustes.
                                    También podés enviarnos tu propia imagen si preferís diseñarlo vos mismo.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footers />
        </>
    );
});

Buy.displayName = "Buy";

export default Buy;