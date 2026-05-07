import React from "react";
import "./ProblemSection.css";

const ProblemSection = () => (
    <section className="sp-section sp-problem" aria-labelledby="problem-title">
        <h2 id="problem-title" className="sp-section-title">
            El momento que todo dueño teme... y la solución definitiva
        </h2>
        <div className="sp-problem-grid">
            <div className="sp-problem-card">
                <div className="sp-problem-icon sp-icon-fear"></div>
                <p>Tu mascota se asusta, tira de la correa y desaparece en segundos.</p>
            </div>
            <div className="sp-problem-card">
                <div className="sp-problem-icon sp-icon-phone"></div>
                <p>Quien la encuentra intenta llamar, pero anota mal el número o no tiene crédito.</p>
            </div>
            <div className="sp-problem-card">
                <div className="sp-problem-icon sp-icon-clock"></div>
                <p>Pasan horas sin que te enteres. La angustia crece minuto a minuto.</p>
            </div>
        </div>
        <p className="sp-problem-conclusion">
            Con SmartPet, <strong>recibís un aviso automático en el instante</strong> en que alguien escanea su collar.
        </p>
    </section>
);

export default ProblemSection;