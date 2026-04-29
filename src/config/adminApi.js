import API_BASE from "./api.js";

export const API_URL = `${API_BASE}/index.php`;

export const getAdminUserId = () => {
	const userId = localStorage.getItem("userId");

	if (userId) return userId;

	try {
		const user = JSON.parse(localStorage.getItem("user") || "{}");
		return user?.id || "";
	} catch {
		return "";
	}
};

export const getAdminHeaders = () => ({
	"X-User-Id": getAdminUserId(),
});

export const getMultipartAdminHeaders = () => ({
	...getAdminHeaders(),
	"Content-Type": "multipart/form-data",
});

export const normalizeList = (payload, key = "") => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.data)) return payload.data;
	if (Array.isArray(payload?.items)) return payload.items;
	if (Array.isArray(payload?.users)) return payload.users;
	if (Array.isArray(payload?.usuarios)) return payload.usuarios;
	if (Array.isArray(payload?.mascotas)) return payload.mascotas;
	if (Array.isArray(payload?.socios)) return payload.socios;
	if (key && Array.isArray(payload?.[key])) return payload[key];

	return [];
};

export const normalizeItem = (payload, key = "") => {
	if (!payload) return null;
	if (payload?.id) return payload;
	if (key && payload?.[key]) return payload[key];
	if (payload?.data) return payload.data;
	if (payload?.user) return payload.user;
	if (payload?.mascota) return payload.mascota;
	if (payload?.socio) return payload.socio;

	return null;
};

export const resolveUploadUrl = (path) => {
	if (!path) return "";

	if (String(path).startsWith("http")) return path;

	return `${API_BASE}/${String(path).replace(/^\/+/, "")}`;
};
