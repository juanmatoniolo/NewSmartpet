import React from "react";
import "./Comparativa.css";

const filas = [
    {
        feature: "Precio total",
        chapa: "text",
        chapaLabel: "Bajo",
        gps: "text",
        gpsLabel: "Muy alto + cuotas",
        sp: "text",
        spLabel: "$8.500 a $15.000 — pago único",
    },
    {
        feature: "Aviso cuando la escanean",
        chapa: "no",
        gps: "no",
        sp: "yes",
        spLabel: "Mail automático al instante",
    },
    {
        feature: "Sin pilas ni recarga",
        chapa: "yes",
        gps: "no",
        sp: "yes",
    },
    {
        feature: "Cuota mensual",
        chapa: "yes",
        chapaLabel: "Sin cuota",
        gps: "no",
        gpsLabel: "Siempre",
        sp: "yes",
        spLabel: "Sin cuota nunca",
    },
    {
        feature: "Personalización",
        chapa: "text",
        chapaLabel: "Muy limitada",
        gps: "text",
        gpsLabel: "Nula",
        sp: "text",
        spLabel: "Total — colores, nombre, estilo",
    },
];

const Val = ({ type, label }) => {
    if (type === "yes") return <><span className="sp-yes">✓</span>{label ? ` ${label}` : ""}</>;
    if (type === "no") return <><span className="sp-no">✗</span>{label ? ` ${label}` : ""}</>;
    return label || null;
};

const Comparativa = () => (
    <section className="sp-section sp-comparativa" aria-labelledby="comp-title">
        <span className="sp-label">¿Por qué SmartPet?</span>
        <h2 id="comp-title" className="sp-section-title">
            Comparativa de opciones
        </h2>
        <p className="sp-section-sub">
            Sin engaños: así se compara SmartPet con las alternativas
        </p>

        <div className="sp-comp-wrap" role="table" aria-label="Comparativa de productos">

            {/* Cabecera */}
            <div className="sp-comp-header" role="row">
                <div className="sp-comp-feature-col" role="columnheader" />
                <div className="sp-comp-col-head" role="columnheader">Chapa grabada</div>
                <div className="sp-comp-col-head" role="columnheader">GPS con cuota</div>
                <div className="sp-comp-col-head sp-comp-col-head--sp" role="columnheader">
                    SmartPet
                </div>
            </div>

            {/* Filas */}
            <div className="sp-comp-rows">
                {filas.map((f, i) => (
                    <div key={i} className="sp-comp-row" role="row">
                        <div className="sp-comp-feature" role="rowheader">{f.feature}</div>
                        <div className="sp-comp-val" role="cell">
                            <Val type={f.chapa} label={f.chapaLabel} />
                        </div>
                        <div className="sp-comp-val" role="cell">
                            <Val type={f.gps} label={f.gpsLabel} />
                        </div>
                        <div className="sp-comp-val sp-comp-val--sp" role="cell">
                            <Val type={f.sp} label={f.spLabel} />
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <p className="sp-comp-disclaimer">
            * SmartPet no es un rastreador GPS continuo. Recibís la ubicación del celular de quien escanea el collar, solo en el momento del escaneo.
        </p>
    </section>
);

export default Comparativa;