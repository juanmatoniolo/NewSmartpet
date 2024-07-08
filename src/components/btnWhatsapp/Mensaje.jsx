import React from "react";

const CallToActionButton = ({ phoneNumber, text }) => {
	const handleCallClick = () => {
		const customMessage =
			"¡Hola! Estoy interesado en comprar un collar SmarPet!";
		const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
			customMessage
		)}`;
		// Redirigir al usuario a la URL de WhatsApp
		window.open(url, "_blank");
	};

	return (
		<div className="action-buttons">
			<button className="join-btn" onClick={handleCallClick}>
				{text}
			</button>
		</div>
	);
};

export default CallToActionButton;
