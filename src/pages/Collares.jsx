import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./collares.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";

function Collares() {
	return (
		<>
			<Header />
			<Barnav />

			<div className="collares-container container mt-5">
				{/* Galería de Imágenes */}
				<section className="collares-gallery">
					<h2 className="section-title">Galería de Collares</h2>
					<div className="row">
						<div className="col-md-4">
							<img
								src="https://via.placeholder.com/300x300"
								alt="Collar 1"
								className="img-fluid"
							/>
						</div>
						<div className="col-md-4">
							<img
								src="https://via.placeholder.com/300x300"
								alt="Collar 2"
								className="img-fluid"
							/>
						</div>
						<div className="col-md-4">
							<img
								src="https://via.placeholder.com/300x300"
								alt="Collar 3"
								className="img-fluid"
							/>
						</div>
					</div>
				</section>

				{/* Videos Promocionales */}
				<section className="collares-videos mt-5">
					<h2 className="section-title">Videos Promocionales</h2>
					<div className="row">
						<div className="col-md-6 m-auto">
							<video controls className="video-fluid">
								<source
									src="https://via.placeholder.com/720x480.mp4"
									type="video/mp4"
								/>
								Tu navegador no soporta la etiqueta de video.
							</video>
						</div>
					</div>
				</section>
			</div>

			<Footers />
		</>
	);
}

export default Collares;
