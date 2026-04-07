import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./MascotaProtegida.css";
import SmartHeader from "../nav/SmartHeader";

const API_BASE = "http://localhost/api-smartpet/index.php";

function MascotaProtegida() {
	const { id } = useParams();

	const [mascota, setMascota] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const calcularEdad = (fechaNac) => {
		if (!fechaNac) return "Desconocida";
		const fechaNacimiento = new Date(fechaNac);
		if (isNaN(fechaNacimiento.getTime())) return "Desconocida";
		const hoy = new Date();
		let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
		const mesDiferencia = hoy.getMonth() - fechaNacimiento.getMonth();
		if (mesDiferencia < 0 || (mesDiferencia === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
			edad--;
		}
		if (edad < 1) {
			let meses = mesDiferencia;
			if (meses < 0) meses += 12;
			if (meses === 0) return "Menos de 1 mes";
			return `${meses} mes(es)`;
		}
		return `${edad} año(s)`;
	};

	const obtenerSexo = (sexo) => {
		if (sexo === 1 || sexo === "1") return { texto: "Hembra", icono: "♀️" };
		if (sexo === 0 || sexo === "0") return { texto: "Macho", icono: "♂️" };
		return { texto: sexo || "Sexo", icono: "⚥" };
	};

	const limpiarTelefono = (telefono) => {
		if (!telefono) return "";
		return String(telefono).replace(/[^\d]/g, "");
	};

	const getWhatsappLink = (telefono, mensaje) => {
		const tel = limpiarTelefono(telefono);
		if (!tel) return "#";
		return `https://wa.me/549${tel}?text=${encodeURIComponent(mensaje || "Hola, encontré esta mascota.")}`;
	};

	const getPhoneLink = (telefono) => {
		const tel = limpiarTelefono(telefono);
		return tel ? `tel:${tel}` : "#";
	};

	const getInstagramLink = (ig) => {
		if (!ig) return "#";
		return `https://instagram.com/${String(ig).replace("@", "").trim()}`;
	};

	const cargarDatosMascota = async () => {
		try {
			const resMascota = await axios.get(`${API_BASE}/mascotas/${id}`);
			const data = resMascota.data;
			if (!data || !data.id) {
				setError("Mascota no encontrada");
				setMascota(null);
			} else {
				setMascota(data);
			}
		} catch (err) {
			console.error("Error al cargar mascota:", err);
			setError("Error de conexión. Intente nuevamente.");
			setMascota(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		cargarDatosMascota();
	}, [id]);

	if (loading) {
		return (
			<>
				<SmartHeader />
				<main className="container-main">
					<div className="skeleton-card">
						<div className="skeleton-img"></div>
						<div className="skeleton-text"></div>
						<div className="skeleton-text"></div>
						<div className="skeleton-text short"></div>
					</div>
				</main>
				<footer className="sp-footer">
					<div className="sp-footer-container">
						<div className="sp-footer-intro">
							<h3 className="sp-footer-title">¿Necesitas ayuda?</h3>
							<p className="sp-footer-subtitle">Contáctanos directamente:</p>
						</div>
					</div>
				</footer>
			</>
		);
	}

	if (error || !mascota) {
		return (
			<>
				<SmartHeader />
				<main className="container-main">
					<div className="error-message">
						<p>{error || "No se encontró la mascota."}</p>
						<Link to="/" className="btn-volver">Volver al inicio</Link>
					</div>
				</main>
				<footer className="sp-footer">...</footer>
			</>
		);
	}

	const sexoInfo = obtenerSexo(mascota.sexo);
	const edadTexto = mascota.fecha_nacimiento ? calcularEdad(mascota.fecha_nacimiento) : "Desconocida";
	const imagenSrc = mascota.urlImg && mascota.urlImg.trim() !== "" ? mascota.urlImg : "/assets/smartpet-default.jpg";

	return (
		<>
			<SmartHeader />

			<main className="container-main">
				{/* Tarjeta principal */}
				<section className="datos-principales">
					<div className="imagenen-mascota">
						<img
							src={imagenSrc}
							alt={`Foto de ${mascota.nombre || "la mascota"}`}
							className="img-mostrar-mascota"
							onError={(e) => { e.target.src = "/assets/smartpet-default.jpg"; }}
						/>
					</div>
					<div className="datos-mascota">
						<h4 className="nombre-mascota"> {mascota.nombre || "Sin nombre"}</h4>
						<div className="contenedor-datos-mascota">
							<span className="icono-texto">{sexoInfo.icono}</span>
							<p className="sexo-mascota">{sexoInfo.texto}</p>
						</div>
						<div className="contenedor-datos-mascota">
							<span className="icono-texto">🎂</span>
							<p className="edad-mascota">{edadTexto}</p>
						</div>
						<div className="contenedor-datos-mascota">
							<span className="icono-texto">📍</span>
							<p className="ubicacion-mascota">
								{mascota.direccion || "Dirección no registrada"}
								{mascota.direccion}
							</p>
						</div>
					</div>
				</section>

				{/* Descripción */}
				<section className="descripcion">
					<p className="descripcion-mascota"> {mascota.descripcion || "Sin descripción disponible."}</p>
				</section>

				{/* Contactos */}
				<section className="contactos-mascota">
					<h2 className="contacto text-center">Contactos</h2>

					{mascota.persona1 && (
						<div className="contenedor-contacto">
							<p className="nombre-contacto">👤 {mascota.persona1}</p>
							<div className="redes-sociales">
								{mascota.persona1tel && (
									<>
										<a
											href={getWhatsappLink(mascota.persona1tel, mascota.mensajeRescate)}
											className="btn whatsapp-redes"
											target="_blank"
											rel="noopener noreferrer"
										>
											<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
											</svg>
											WhatsApp
										</a>
										<a href={getPhoneLink(mascota.persona1tel)} className="btn llamar-redes">
											<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5z" />
											</svg>
											Llamar
										</a>
									</>
								)}
								{mascota.persona1ig && (
									<a href={getInstagramLink(mascota.persona1ig)} className="btn ig" target="_blank" rel="noopener noreferrer">
										<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
											<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
										</svg>
										Instagram
									</a>
								)}
							</div>
						</div>
					)}

					{mascota.persona2 && (
						<div className="contenedor-contacto">
							<p className="nombre-contacto">👤 {mascota.persona2}</p>
							<div className="redes-sociales">
								{mascota.persona2tel && (
									<>
										<a href={getWhatsappLink(mascota.persona2tel, mascota.mensajeRescate)} className="btn whatsapp-redes" target="_blank" rel="noopener noreferrer">
											<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
											</svg>
											WhatsApp
										</a>
										<a href={getPhoneLink(mascota.persona2tel)} className="btn llamar-redes">
											<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
												<path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511zM11 .5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V1.707l-4.146 4.147a.5.5 0 0 1-.708-.708L14.293 1H11.5a.5.5 0 0 1-.5-.5z" />
											</svg>
											Llamar
										</a>
									</>
								)}
								{mascota.persona2ig && (
									<a href={getInstagramLink(mascota.persona2ig)} className="btn ig" target="_blank" rel="noopener noreferrer">
										<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
											<path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
										</svg>
										Instagram
									</a>
								)}
							</div>
						</div>
					)}
				</section>
			</main>

			<footer className="sp-footer">
				<div className="sp-footer-container">
					<div className="sp-footer-intro">
						<h3 className="sp-footer-title">¿Necesitas ayuda?</h3>
						<p className="sp-footer-subtitle">Contáctanos directamente:</p>
					</div>
					<div className="sp-footer-buttons">
						<div className="sp-social-group">
							<a href="https://www.facebook.com/tagsmartpet/" className="sp-social-btn sp-fb-btn" target="_blank" rel="noopener noreferrer">
								<i className="bi bi-facebook"></i>
								<span className="sp-tooltip">Visítanos en Facebook</span>
							</a>
							<a href="https://www.instagram.com/tagsmartpet/" className="sp-social-btn sp-ig-btn" target="_blank" rel="noopener noreferrer">
								<i className="bi bi-instagram"></i>
								<span className="sp-tooltip">Síguenos en Instagram</span>
							</a>
							<a href="https://wa.me/5493412275598?text=Hola%20queria%20comprar%20un%20SmartPet" className="sp-social-btn sp-wa-btn" target="_blank" rel="noopener noreferrer">
								<i className="bi bi-whatsapp"></i>
								<span className="sp-tooltip">Pedir otro collar</span>
							</a>
						</div>
					</div>
					<div className="sp-legal-text">
						<p>© 2022 SmartPet<br />Cuidando a tus mascotas con amor 🐾</p>
					</div>
				</div>
			</footer>
		</>
	);
}

export default MascotaProtegida;