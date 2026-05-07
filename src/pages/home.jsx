// Home.jsx
import React, { useCallback } from "react";
import "./home.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import videoSmartPet from "../assets/video/funcionamiento.mp4";
import FAQComponent from "./FAQ";
import Contacto from "./Landing";
import Features from "./Features";
import ProblemSection from "./ProblemSection";
import Productos from "./Productos";
import Garantia from "./Garantia";
import Comparativa from "./Comparativa"; // opcional, si lo creas
import SmartHeader from "../components/nav/SmartHeader";

const imagenes = [
	require("../assets/clientes/clientes (3).webp"),
	require("../assets/clientes/clientes (4).webp"),
	require("../assets/clientes/clientes (1).webp"),
	require("../assets/clientes/clientes (5).webp"),
	require("../assets/clientes/clientes (2).webp"),
];

// Idealmente reemplazar con array de objetos { src, nombre, frase } cuando tengas testimonios reales
const imagenesConTestimonio = [
	{ src: imagenes[0] },
	{ src: imagenes[1] },
	{ src: imagenes[2] },
	{ src: imagenes[3] },
	{ src: imagenes[4] },
];

const WA_LINK =
	"https://wa.me/+5493412275598?text=¡Hola! Estoy interesado en comprar un collar SmartPet!";

const Home = React.memo(() => {
	const handleBuyClick = useCallback(() => {
		window.open(WA_LINK, "_blank", "noopener,noreferrer");
	}, []);

	return (
		<>
			<SmartHeader />
			<main className="sp-main">
				{/* HERO con textos mejorados */}
				<section className="sp-hero" aria-labelledby="hero-title">
					<h1 id="hero-title" class="sp-hero-title">Protegé a quien más querés con <span class="sp-highlight">SmartPet</span></h1>
					<p className="sp-hero-sub">
						Sin pilas, sin apps complicadas, sin errores. Personalizalo con su nombre y
						dormí tranquilo: un simple escaneo y te llega un mail con la ubicación.
					</p>
					<button
						className="sp-cta"
						onClick={handleBuyClick}
						aria-label="Comprar collar SmartPet por WhatsApp"
						type="button"
					>
						¡Quiero el mío! 🐾
					</button>
				</section>

				{/* Sección del problema */}
				<ProblemSection />

				{/* Features (con el ajuste en el primer bloque) */}
				<Features />

				{/* Tabla comparativa (opcional pero recomendada) */}
				<Comparativa />

				{/* Fotos de clientes con overlay de testimonios */}
				<section
					className="sp-section sp-carousel-section"
					aria-labelledby="clients-title"
				>
					<h2 id="clients-title" className="sp-section-title">
						Mascotas SmartPet
					</h2>
					<p className="sp-section-sub">Familias que ya duermen más tranquilas</p>
					<div className="sp-carousel-wrapper">
						<Swiper
							modules={[Navigation, Autoplay]}
							spaceBetween={24}
							slidesPerView={1.2}
							centeredSlides={true}
							navigation
							autoplay={{ delay: 3500, disableOnInteraction: false }}
							breakpoints={{
								480: { slidesPerView: 1.5, spaceBetween: 20 },
								640: { slidesPerView: 2, spaceBetween: 24 },
								900: { slidesPerView: 2.5, spaceBetween: 28 },
								1200: { slidesPerView: 3.2, spaceBetween: 32 },
								1400: { slidesPerView: 4, spaceBetween: 36, centeredSlides: false },
							}}
						>
							{imagenesConTestimonio.map((item, i) => (
								<SwiperSlide key={i}>
									<div className="sp-photo-card">
										<img
											src={item.src}
											alt={`${item.nombre} usando collar inteligente SmartPet`}
											className="sp-photo"
											loading="lazy"
											decoding="async"
											width="400"
											height="500"
										/>

									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
					<div className="sp-cta-center" id="Buy">
						<button
							className="sp-cta sp-cta-green"
							onClick={handleBuyClick}
							aria-label="Comprar collar SmartPet ahora"
							type="button"
						>
							Comprar Ahora 🛒
						</button>
					</div>
				</section>

				{/* Productos y precios */}
				<Productos />

				{/* Video */}
				{/* Video */}
				<section className="sp-section" aria-labelledby="video-title">
					<div className="sp-video-wrap">
						<h3 id="video-title" className="sp-section-title">
							Así funciona SmartPet
						</h3>

						{/* Teléfono con video dentro */}
						<div className="phone-mockup">
							<div className="phone-buttons">
								<div className="phone-btn phone-btn-top" />
								<div className="phone-btn phone-btn-bottom" />
							</div>
							<div className="phone-screen">
								<video
									src={videoSmartPet}
									controls
									className="phone-video"
									preload="metadata"
									aria-label="Video explicativo de cómo funciona SmartPet"
								>
									Tu navegador no soporta el video.
								</video>
							</div>
							<div className="phone-notch">
								<div className="phone-camera" />
								<div className="phone-speaker" />
							</div>
						</div>

						<p className="sp-video-caption">
							<span className="sp-video-tag">📷 Escaneá el QR</span>
							<span className="sp-video-tag">📬 Recibís un mail</span>
							<span className="sp-video-tag">⚡ Sin apps</span>
						</p>
					</div>
				</section>

				{/* Garantía */}
				<Garantia />

				{/* SEO oculto */}
				<div className="sp-seo" aria-hidden="true">
					Collares inteligentes para mascotas, chapitas con QR para perros y
					gatos, identificador digital para mascotas, etiquetas NFC para perros,
					SmartPet collar, collar con chip NFC, collar QR gato, collar QR perro,
					SmartPet Argentina, tags inteligentes para animales domésticos.
				</div>

				{/* FAQ */}
				<section className="sp-section" aria-labelledby="faq-title">
					<FAQComponent />
				</section>

				{/* Contacto */}
				<section
					className="sp-section contacto-section"
					aria-labelledby="contact-title"
				>
					<Contacto />
				</section>
			</main>
		</>

	);
});

Home.displayName = "Home";

export default Home;