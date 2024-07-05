import React, { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./carruselCards.css";

const MyCarousel = () => {
	const benefits = [
		{
			id: 1,
			title: "Actualización de Precios en Tiempo Real",
			text: "Los precios se actualizan al instante, eliminando la necesidad de reimprimir menús y ahorrando recursos.",
		},
		{
			id: 2,
			title: "Reducción de Costos",
			text: "Reduce los costos operativos significativamente al evitar la impresión frecuente de menús.",
		},
		{
			id: 3,
			title: "Eco-Amigable",
			text: "Contribuye a un modelo de negocio más sostenible y amigable con el medio ambiente.",
		},
		{
			id: 4,
			title: "Facilidad de Acceso",
			text: "Los clientes pueden acceder fácilmente a los menús digitales escaneando un código QR.",
		},
		{
			id: 5,
			title: "Mejora la Experiencia del Cliente",
			text: "Permite explorar el menú de manera interactiva y dinámica, mejorando la experiencia de selección.",
		},
		{
			id: 6,
			title: "Adaptabilidad a las Restricciones Sanitarias",
			text: "Reduce el contacto físico necesario al manipular menús compartidos.",
		},
		{
			id: 7,
			title: "Personalización de la Marca",
			text: "Permite reflejar la identidad de marca en los menús digitales con opciones de personalización extensas.",
		},
		{
			id: 8,
			title: "Análisis de Datos y Retroalimentación",
			text: "Recopila datos sobre las preferencias de los clientes para ajustar la oferta y mejorar el servicio.",
		},
		{
			id: 9,
			title: "Fidelización de Clientes",
			text: "Facilita la implementación de promociones y menús especiales para fomentar visitas repetidas.",
		},
		{
			id: 10,
			title: "Optimización del Tiempo",
			text: "Agiliza la gestión de menús, permitiendo al personal concentrarse más en el servicio al cliente.",
		},
	];
	const [centerSlidePercentage, setCenterSlidePercentage] = useState(70); // Valor predeterminado para móviles

	useEffect(() => {
		const updateCenterSlidePercentage = () => {
			const screenWidth = window.innerWidth;
			if (screenWidth >= 768) {
				// Suponiendo que 768px es el breakpoint para tabletas
				setCenterSlidePercentage(33);
			} else {
				setCenterSlidePercentage(60);
			}
		};

		updateCenterSlidePercentage(); // Llama a la función al montar el componente
		window.addEventListener("resize", updateCenterSlidePercentage); // Ajusta al cambiar el tamaño de la ventana

		return () => {
			window.removeEventListener("resize", updateCenterSlidePercentage); // Limpia el event listener al desmontar el componente
		};
	}, []);

	return (
		<Carousel
			autoPlay
			interval={5000}
			showThumbs={false}
			infiniteLoop
			useKeyboardArrows
			showStatus={false}
			dynamicHeight={false}
			centerMode
			centerSlidePercentage={centerSlidePercentage}
			swipeable
			emulateTouch
		>
			{benefits.map((benefit) => (
				<div className="cardd" key={benefit.id}>
					<div className="cardd-body" id={`benefit-${benefit.id}`}>
						<h5 className="cardd-title">{benefit.title}</h5>
						<p className="cardd-text">{benefit.text}</p>
					</div>
				</div>
			))}
		</Carousel>
	);
};

export default MyCarousel;
