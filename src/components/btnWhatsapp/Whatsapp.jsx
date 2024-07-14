import React from "react";
import "./whatsapp.css";

function WhatsAppButton( {mensaje}) {
	const handleWhatsAppClick = () => {
		const phoneNumber = "+5493412275598";
		const customMessage =mensaje;
		const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			customMessage
		)}`;
		window.open(url, "_blank");
		// Redirigir al usuario a la URL de WhatsApp
		window.open(url);
	};

	return (
		<div className="whatsapp-button" onClick={handleWhatsAppClick}>
			<img
				src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png"
				alt="WhatsApp"
				className="whatsapp-icon"
			/>
		</div>
	);
}

export default WhatsAppButton;
