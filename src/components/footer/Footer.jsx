import React from "react";
import "./footer.css";

export default function Footers() {
	return (
		<footer className="bg-dark text-light pt-4">
			<div className="container contenedorfooter text-center text-md-start">
				<div className="row justify-content-between align-items-center">
					
					{/* Información de la empresa */}
					<div className="col-12 col-md-6 mb-3 mb-md-0">
						<p className="mb-1 fw-bold">© 2025 SmartPet</p>
						<p className="mb-0">Rosario, Argentina</p>
					</div>

					{/* Contacto e iconos */}
					<div className="col-12 col-md-6 text-center text-md-end">
						<p className="mb-2 fw-semibold">Contactanos:</p>
						<div className="d-flex justify-content-center justify-content-md-end gap-3 mb-2">
							<a
								href="https://wa.me/+5493412275598"
								className="text-light footer-iconos"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="bi bi-whatsapp fs-4"></i>
							</a>
							<a
								href="https://www.instagram.com/tagsmartpet/"
								className="text-light footer-iconos"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="bi bi-instagram fs-4"></i>
							</a>
							<a
								href="mailto:juanmatoniolo2@gmail.com"
								className="text-light footer-iconos"
								target="_blank"
								rel="noopener noreferrer"
							>
								<i className="bi bi-envelope fs-4"></i>
							</a>
						</div>
					</div>
				</div>

				{/* Línea final */}
				<hr className="bg-light opacity-25 my-3" />
				<div className="text-center small">
					<p className="mb-0">
						Todos los derechos reservados. Diseñado y desarrollado por{" "}
						<a
							href="https://www.instagram.com/juanmatoniolo/"
							className="text-decoration-underline text-light"
							target="_blank"
							rel="noopener noreferrer"
						>
							Juanma Toniolo
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
