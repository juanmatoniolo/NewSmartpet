// src/components/Buy/components/BeneficiosCompra.jsx

import React from "react";

const beneficios = [
    {
        icon: "🐾",
        title: "Identificación inteligente",
        text: "Productos pensados para ayudar a que tu mascota vuelva a casa más rápido.",
    },
    {
        icon: "🎨",
        title: "Diseños personalizados",
        text: "Podés elegir estilo, colores y nombre para crear una pieza única.",
    },
    {
        icon: "📲",
        title: "Compra directa por WhatsApp",
        text: "Consultá disponibilidad, enviá tu diseño y coordiná la compra fácilmente.",
    },
];

function BeneficiosCompra() {
    return (
        <section className="buy-benefits-section">
            {beneficios.map((item) => (
                <article className="buy-benefit-card" key={item.title}>
                    <span className="buy-benefit-icon">{item.icon}</span>

                    <div>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </div>
                </article>
            ))}
        </section>
    );
}

export default BeneficiosCompra;