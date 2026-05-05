// src/components/Buy/helpers/buyHelpers.js

export const FALLBACK_IMG = "/a.jpg";

export const WHATSAPP_NUMBER = "5493412275598";

export const formatPrice = (value) => {
	const number = Number(value || 0);

	return new Intl.NumberFormat("es-AR", {
		style: "currency",
		currency: "ARS",
		maximumFractionDigits: 0,
	}).format(number);
};

export const getWhatsappCompraUrl = (producto) => {
	const mensaje = `Hola SmartPet! Quiero comprar este producto:

Producto: ${producto.titulo}
Precio: ${formatPrice(producto.precio)}
Descripción: ${producto.descripcion || "Sin descripción"}

También quiero saber cómo avanzar con el diseño personalizado y el QR.`;

	return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
};

export const buildIAPrompt = (producto) => {
	return `Necesito crear imágenes profesionales para vender este producto en una tienda online.

Producto:
${producto.titulo}

Descripción:
${producto.descripcion || "Sin descripción adicional cargada."}

Precio de referencia:
${formatPrice(producto.precio)}

Objetivo:
Crear exactamente 2 imágenes del mismo producto, manteniendo coherencia visual entre ambas.

Imagen 1 - Frente:
- Vista frontal del producto.
- Producto completo, centrado y bien iluminado.
- Fondo blanco, claro o neutro.
- Estilo catálogo profesional / e-commerce premium.
- Alta nitidez.
- Sin textos grandes, logos inventados ni elementos que no correspondan.
- Respetar materiales, colores, forma y detalles según la descripción.

Imagen 2 - Dorso:
- Vista trasera del mismo producto.
- Mantener el mismo estilo visual, iluminación, escala y fondo de la imagen frontal.
- Mostrar claramente la parte posterior y detalles del producto.
- Alta nitidez.
- Sin textos grandes, logos inventados ni elementos que no correspondan.

Requisitos generales:
- El producto debe verse realista, vendible y profesional.
- No cambiar el diseño entre frente y dorso.
- No agregar accesorios, packaging o decoraciones salvo que la descripción lo indique.
- Entregar solo 2 imágenes: frente y dorso.`;
};

export const getChatGPTPromptUrl = (prompt) => {
	return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
};
