import React from "react";
import { FaWhatsapp, FaInstagram, FaEnvelope } from "react-icons/fa";
import "./footer.css";

export default function Footers() {
	return (
		<footer className="sp-footer">
			<div className="sp-footer-inner">

				<div className="sp-footer-brand">
					<span className="sp-footer-logo">🐾 SmartPet</span>
					<p className="sp-footer-tagline">Tecnología con corazón — Rosario, Argentina</p>
				</div>

				<div className="sp-footer-social">
					<a href="https://wa.me/+5493412275598" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="sp-footer-icon">
						<FaWhatsapp />
					</a>
					<a href="https://www.instagram.com/tagsmartpet/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="sp-footer-icon">
						<FaInstagram />
					</a>
					<a href="mailto:juanmatoniolo2@gmail.com" aria-label="Email" className="sp-footer-icon">
						<FaEnvelope />
					</a>
				</div>

			</div>

			<div className="sp-footer-bottom">
				© 2025 SmartPet — Diseñado y desarrollado por{" "}
				<a href="https://www.instagram.com/juanmatoniolo/" target="_blank" rel="noopener noreferrer">
					Juanma Toniolo
				</a>
			</div>
		</footer>
	);
}