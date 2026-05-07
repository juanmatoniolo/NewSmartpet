// src/components/Root/helpers.js
export const withCacheBust = (url, key) => {
	if (!url) return url;
	const sep = url.includes("?") ? "&" : "?";
	return `${url}${sep}_=${key || Date.now()}`;
};

export const formatPrice = (value) =>
	new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	}).format(Number(value || 0));

export const getFallbackImage = (section) => {
	if (section === "usuarios") return "/default.jpg";
	if (section === "mascotas") return "/a.jpg";
	return "/icono.png";
};

export const BOOL_COLS = new Set([
	"favorito",
	"completada",
	"recordatorio",
	"recibir_emails",
	"servicio_24h",
	"emergencias",
	"root",
	"oferta",
	"activo",
]);
