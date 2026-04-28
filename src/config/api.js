// src/config/api.js
const envUrl = process.env.REACT_APP_API_URL;

// Si la variable de entorno no está definida, usamos una URL fija según el entorno
const fallbackUrl =
	process.env.NODE_ENV === "production"
		? "https://tagsmartpet.com/API-SMARTPET"
		: "http://localhost/API-SMARTPET";

const API_BASE = (envUrl || fallbackUrl).replace(/\/$/, "");

export default API_BASE;
