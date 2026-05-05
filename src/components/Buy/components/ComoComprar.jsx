// src/components/Buy/components/ComoComprar.jsx

import React from "react";
import { Sparkles } from "lucide-react";

const pasos = [
    {
        number: "1",
        icon: "🎨",
        title: "Elegí tu modelo",
        text: "Seleccioná entre camiseta, circular, huesito o pez según el estilo de tu mascota.",
    },
    {
        number: "2",
        icon: "✨",
        title: "Diseñá con IA",
        text: "Nuestro asistente genera frente y dorso personalizados. Solo agregá el nombre y colores favoritos.",
    },
    {
        number: "3",
        icon: "💬",
        title: "Enviá tu diseño",
        text: "Descargá la imagen y enviala por WhatsApp. Nosotros imprimimos y agregamos el QR en el dorso.",
    },
];

function ComoComprar() {
    return (
        <section className="buy-how-section">
            <div className="buy-section-heading">
                <span className="buy-section-kicker">
                    <Sparkles size={17} />
                    ¿Cómo funciona?
                </span>

                <h2>Diseñá tu chapita personalizada en 3 pasos</h2>

                <p>
                    Vos elegís el estilo visual. Nosotros nos encargamos de preparar la
                    pieza final con tu QR SmartPet.
                </p>
            </div>

            <div className="buy-steps-grid">
                {pasos.map((paso) => (
                    <article className="buy-step-card" key={paso.number}>
                        <div className="buy-step-number">{paso.number}</div>

                        <div className="buy-step-icon">{paso.icon}</div>

                        <h3>{paso.title}</h3>

                        <p>{paso.text}</p>
                    </article>
                ))}
            </div>

            <div className="buy-important-note">
                <div className="buy-important-icon">ℹ️</div>

                <div>
                    <strong>Importante</strong>

                    <p>
                        El diseño incluye frente decorativo y dorso preparado para que
                        agreguemos tu código QR único. No necesitás preocuparte por el QR,
                        solo personalizá los colores y el nombre.
                    </p>
                </div>
            </div>
        </section>
    );
}

export default ComoComprar;