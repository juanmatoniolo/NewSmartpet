import React from "react";
import "./Garantia.css";

const Garantia = () => (
    <section className="sp-section sp-garantia" aria-labelledby="garantia-title">
        <h2 id="garantia-title" className="sp-section-title">
            Nuestro compromiso con vos
        </h2>
        <div className="sp-garantia-card">
            <div className="sp-garantia-icon" aria-hidden="true"></div>
            <div className="sp-garantia-body">
                <h3>Garantía 30 días — reemplazo sin costo</h3>
                <p>
                    Si tu collar presenta un defecto de fabricación dentro de los primeros 30 días,
                    te lo reemplazamos sin costo y sin preguntas. Y si tenés alguna duda sobre el
                    funcionamiento, te asisto personalmente por WhatsApp hasta que quede perfecto.
                </p>
                <span className="sp-garantia-firma">
                    Juan Manuel Toniolo · Fundador de SmartPet
                </span>
            </div>
        </div>
    </section>
);

export default Garantia;