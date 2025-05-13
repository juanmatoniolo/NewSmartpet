import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footers from "../components/footer/Footer";
import Texto from "./Texto"
import "./home.css";


import WhatsAppButton from "../components/btnWhatsapp/Whatsapp";
import SmartHeader from "../components/nav/Nav";

function Homepage() {
	return (
		<div className="Homepage">
			<SmartHeader />
			{/* 			<WhatsAppButton			/> */}
			<Texto />
			<Footers />
		</div>
	);
}

export default Homepage;
