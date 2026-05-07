// src/components/Root/imageUtils.js
import { resolveUploadUrl } from "../../config/adminApi.js";

export const getImageSrc = (section, item) => {
	if (section === "usuarios") {
		return item.foto_perfil ? resolveUploadUrl(item.foto_perfil) : "/a.jpg";
	}
	if (section === "mascotas") {
		return item.urlImg ? resolveUploadUrl(item.urlImg) : "/a.jpg";
	}
	if (section === "socios") {
		return item.logo_url ? resolveUploadUrl(item.logo_url) : "/icono.png";
	}
	if (section === "productos") {
		return item.imagen1 ? resolveUploadUrl(item.imagen1) : "/icono.png";
	}
	return "/icono.png";
};

export const getImageAlt = (section, item) => {
	if (section === "usuarios") return `Foto de ${item.nombre || "usuario"}`;
	if (section === "mascotas") return `Foto de ${item.nombre || "mascota"}`;
	if (section === "socios")
		return `Logo de ${item.nombre_local || item.nombre || "socio"}`;
	if (section === "productos")
		return `Imagen de ${item.titulo || "producto"}`;
	return "Imagen";
};
