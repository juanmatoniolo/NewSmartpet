// Landing.jsx
import React, { memo } from "react";
import { FaWhatsapp, FaInstagram, FaFacebook, FaTiktok, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./Landing.css";

const redes = [
    {
        icon: FaWhatsapp,
        label: "WhatsApp",
        sub: "Escribinos ahora",
        href: "https://wa.me/5493412275598",
        color: "#25D366",
    },
    {
        icon: FaInstagram,
        label: "Instagram",
        sub: "@smartpet",
        href: "https://www.instagram.com/smartpet",
        color: "#E1306C",
    },
    {
        icon: FaFacebook,
        label: "Facebook",
        sub: "Seguinos",
        href: "https://www.facebook.com/juanmatoniolo",
        color: "#1877F2",
    },
    {
        icon: FaTiktok,
        label: "TikTok",
        sub: "Mirá nuestros videos",
        href: "https://www.tiktok.com/",
        color: "#010101",
    },
    {
        icon: FaTwitter,
        label: "Twitter / X",
        sub: "@jmtoniolo",
        href: "https://twitter.com/jmtoniolo",
        color: "#1DA1F2",
    },
    {
        icon: FaLinkedin,
        label: "LinkedIn",
        sub: "Conectá con nosotros",
        href: "https://www.linkedin.com/in/juanmatoniolo/",
        color: "#0A66C2",
    },
];

const Contacto = memo(() => (
    <section className="contacto-wrap" id="Contact" aria-labelledby="contacto-title">

        <h2 id="contacto-title" className="contacto-title">¿Hablamos?</h2>
        <p className="contacto-sub">Estamos en todos lados — elegí cómo contactarnos</p>
        <div className="contacto-grid">
            {redes.map(({ icon: Icon, label, sub, href, color }) => (
                <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contacto-btn"
                    style={{ "--accent": color }}
                    aria-label={`Contactar por ${label}`}
                >
                    <span className="contacto-btn-icon">
                        <Icon />
                    </span>
                    <span className="contacto-btn-text">
                        <span className="contacto-btn-label">{label}</span>
                        <span className="contacto-btn-sub">{sub}</span>
                    </span>
                </a>
            ))}
        </div>
    </section>
));

Contacto.displayName = "Contacto";

export default Contacto;