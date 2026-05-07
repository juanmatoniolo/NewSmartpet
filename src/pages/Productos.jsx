import React from "react";
import "./Productos.css";

const productos = [
    {
        nombre: "Collar Sublimado + QR",
        precio: "$8.500",
        desc: "Opción ligera y colorida. Incluye todos los datos esenciales de tu mascota.",
        extra: "Código QR · Sin baterías · Personalizable",
        color: "#CD7FA7"
    },
    {
        nombre: "Collar Resina Epoxi + QR",
        precio: "$13.500",
        desc: "Material premium resistente al agua. Estética profesional y duradera.",
        extra: "Resina epoxi · Mayor resistencia · Acabado brillante",
        color: "#6C5C94"
    },
    {
        nombre: "Collar Resina + QR + NFC",
        precio: "$15.000",
        desc: "La máxima tecnología. Contacto sin contacto: solo acercar el teléfono.",
        extra: "NFC integrado · Aviso de ubicación en tiempo real",
        color: "#F7C3DC"
    }
];

const Productos = () => {
    const handleClick = () =>
        window.open(
            "https://wa.me/+5493412275598?text=Quiero%20info%20de%20los%20collares%20SmartPet",
            "_blank",
            "noopener,noreferrer"
        );

    return (
        <section className="sp-section sp-products" aria-labelledby="products-title">
            <h2 id="products-title" className="sp-section-title">
                Elegí la protección que mejor se adapta a tu compañero
            </h2>
            <p className="sp-section-sub">Pago único · Registro de por vida · Sin costos ocultos</p>
            <div className="sp-products-grid">
                {productos.map((p, i) => (
                    <div key={i} className="sp-product-card" style={{ borderTopColor: p.color }}>
                        <h3>{p.nombre}</h3>
                        <p className="sp-product-precio">{p.precio}</p>
                        <p className="sp-product-desc">{p.desc}</p>
                        <span className="sp-product-extra">{p.extra}</span>
                        <button className="sp-cta sp-cta-green" onClick={handleClick}>
                            Seleccionar
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Productos;