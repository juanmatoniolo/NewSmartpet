// Features.jsx
import React, { useEffect, useRef, memo } from "react";
import "./features.css";

const featuresData = [
    {
        icon: "🏷️",
        step: "01 — Qué es",
        title: <>Más que una chapita, <em>tecnología real</em></>,
        color: "c1",
        items: [
            "Un collar con QR y/o chip NFC que almacena toda la info vital de tu mascota.",
            "Al escanearlo, cualquier persona puede ver los datos y contactarte al instante.",
            "Muestra la última ubicación donde fue escaneado — sin apps ni complicaciones.",
        ],
    },
    {
        icon: "⚡",
        step: "02 — Cómo funciona",
        title: <>Activarlo es <em>muy fácil</em></>,
        color: "c2",
        items: [
            "Recibís un código único con tu compra.",
            "Lo activás en nuestra web en menos de 5 minutos.",
            "Cargás los datos: foto, nombre, edad, tratamientos y contactos.",
            "¡Listo! Tu mascota está conectada a vos 24/7.",
        ],
    },
    {
        icon: "✅",
        step: "03 — Por qué elegirnos",
        title: <>Diseñado para <em>durar y simplificar</em></>,
        color: "c3",
        items: [
            "Material resistente: resina epoxi y plástico sublimable.",
            "Compatible con cualquier smartphone, sin necesidad de app.",
            "Contacto directo vía WhatsApp, llamada o Instagram.",
            "Editá los datos cuando quieras, sin cambiar el collar.",
        ],
    },
    {
        icon: "🎨",
        step: "04 — Personalización",
        title: <>Tu mascota es única, <em>su collar también</em></>,
        color: "c4",
        items: [
            "Elegí color, tamaño, chip NFC o solo QR.",
            "Añadí nombre, fondo personalizado y detalles únicos.",
            "Producción en 3 a 5 días (1 a 2 si es sublimado).",
            "Envianos tu diseño y nosotros lo hacemos realidad.",
        ],
    },
];

const FeatureRow = memo(({ data, index }) => {
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    const isReverse = index % 2 !== 0;

    return (
        <div
            ref={ref}
            className={`sp-feature ${isReverse ? "reverse" : ""}`}
            aria-label={data.step}
        >
            <div className="sp-feature-visual">
                <div className={`sp-feature-bubble ${data.color}`} aria-hidden="true">
                    {data.icon}
                </div>
            </div>
            <div className="sp-feature-content">
                <span className="sp-step-badge">{data.step}</span>
                <div className="sp-divider" />
                <h3>{data.title}</h3>
                <ul className="sp-feature-list">
                    {data.items.map((item, i) => (
                        <li key={i}>{item}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
});

FeatureRow.displayName = "FeatureRow";

const Features = memo(() => (
    <section className="sp-features" aria-labelledby="features-title">
        <div className="sp-features-header">
            <h2 id="features-title" className="sp-section-title">
                Todo lo que tu mascota necesita
            </h2>
            <p className="sp-section-sub">Más que una chapita — tecnología con corazón</p>
        </div>
        {featuresData.map((f, i) => (
            <FeatureRow key={i} data={f} index={i} />
        ))}
    </section>
));

Features.displayName = "Features";

export default Features;