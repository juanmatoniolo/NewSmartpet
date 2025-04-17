import React from "react";
import "./whatsapp.css";

const WhatsAppButton = () => {
	const texto = 'Hola Juanmna! Vengo de tu pagina web y queria saber sobre los collares'
	const tel = `+5493412275598`
	return (
		<div
			className="ht-ctc ht-ctc-chat ctc-analytics ctc_wp_desktop style-4 ht_ctc_animation no-animations"
			id="ht-ctc-chat"
			onClick={() =>
				window.open(
					`https://wa.me/${tel}?text=${texto}`,
					"_blank"
				)
			}
		>
			<div className="ht_ctc_style ht_ctc_chat_style">
				<div className="ctc_chip ctc-analytics ctc_s_4 ctc_nb">
					<span
						className="s4_img"
						style={{ margin: "0 8px 0 -12px", order: 0 }}
					>
						<img
							src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
							alt="WhatsApp"
							style={{ height: "32px", width: "32px" }}
						/>
					</span>

					<span className="ctc_cta">Atención via WhatsApp</span>
				</div>
			</div>
		</div>
	);
};

export default WhatsAppButton;
