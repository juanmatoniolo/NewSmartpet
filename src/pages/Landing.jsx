import React from "react";
import {
    FaInstagram,
    FaFacebook,
    FaTiktok,
    FaTwitter,
    FaLinkedin,
    FaWhatsapp,
    FaEnvelope
} from "react-icons/fa";
import "./Landing.css"

const Contacto = () => {
    return (
        <div className="contacto-container text-center py-4" id="Contact">
            <h3 className="mb-4">¡Conectá con nosotros!</h3>
            <div className="d-flex justify-content-center flex-wrap gap-4 fs-2">
                <a
                    href="https://wa.me/5493412275598"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="WhatsApp"
                >
                    <FaWhatsapp className="text-success" />
                </a>

                <a
                    href="https://www.instagram.com/smartpet"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram"
                >
                    <FaInstagram className="text-danger" />
                </a>

                <a
                    href="https://www.facebook.com/juanmatoniolo"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook"
                >
                    <FaFacebook className="text-primary" />
                </a>

                <a
                    href="https://www.tiktok.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="TikTok"
                >
                    <FaTiktok className="text-dark" />
                </a>

                <a
                    href="https://twitter.com/jmtoniolo"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Twitter / X"
                >
                    <FaTwitter className="text-info" />
                </a>

                <a
                    href="https://www.linkedin.com/in/juanmatoniolo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="LinkedIn"
                >
                    <FaLinkedin className="text-primary" />
                </a>



                <a
                    href="mailto:juanmatoniolo2@gmail.com"
                    title="Email"
                >
                    <FaEnvelope className="text-secondary" />
                </a>
            </div>
        </div>
    );
};

export default Contacto;
