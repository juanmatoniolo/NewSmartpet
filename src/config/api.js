// src/config/api.js
const envUrl = process.env.REACT_APP_API_URL;

const fallbackUrl =
	process.env.NODE_ENV === "production"
		? "https://tagsmartpet.com/api-smartpet"
		: "http://localhost/api-smartpet";

const API_BASE = (envUrl || fallbackUrl).replace(/\/$/, "");

export const API_URL = `${API_BASE}/index.php`;

export const getImageUrl = (path, fallback = "/a.jpg") => {
	if (!path || String(path).trim() === "") return fallback;

	let value = String(path).trim();

	value = value.replace(
		"https://tagsmartpet.com/API-SMARTPET",
		"https://tagsmartpet.com/api-smartpet",
	);

	value = value.replace(
		"http://tagsmartpet.com/API-SMARTPET",
		"https://tagsmartpet.com/api-smartpet",
	);

	value = value.replace(
		"http://localhost/API-SMARTPET",
		"http://localhost/api-smartpet",
	);

	value = value.replace(
		"http://localhost/api-smartpet",
		"http://localhost/api-smartpet",
	);

	if (
		value.startsWith("http://") ||
		value.startsWith("https://") ||
		value.startsWith("blob:") ||
		value.startsWith("data:")
	) {
		return value;
	}

	if (
		value.startsWith("/assets/") ||
		value.startsWith("/static/") ||
		value === "/a.jpg" ||
		value === "/default.jpg" ||
		value === "/icono.png"
	) {
		return value;
	}

	return `${API_BASE}/${value.replace(/^\/+/, "")}`;
};

export const withCacheBust = (url, version = Date.now()) => {
	if (!url) return url;
	return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

export default API_BASE;
