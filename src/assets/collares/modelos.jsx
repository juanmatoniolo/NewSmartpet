import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./modelos.css";
import img1 from "../collares/a (1).jpg";
import img11 from "../collares/a (11).jpg";
import img2 from "../collares/a (2).jpg";
import img3 from "../collares/a (3).jpg";
import img4 from "../collares/a (4).jpg";
import img5 from "../collares/a (5).jpg";
import img6 from "../collares/a (6).jpg";
import img8 from "../collares/a (8).jpg";
import img9 from "../collares/a (9).jpg";
import img10 from "../collares/a (10).jpg";

const Carousel3D = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [modalImage, setModalImage] = useState(null);

	const openModal = (image) => {
		setModalImage(image);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
		setModalImage(null);
	};

	const settings = {
		infinite: true,
		speed: 500,
		slidesToShow: 3, // Mostrar 3 imágenes en pantallas grandes
		centerMode: true,
		centerPadding: "0",
		nextArrow: <CustomNextArrow />,
		prevArrow: <CustomPrevArrow />,
		responsive: [
			{
				breakpoint: 768, // Pantallas de menos de 768px (tablets y móviles)
				settings: {
					slidesToShow: 2, // Mostrar 2 imágenes en pantallas pequeñas
				},
			},
		],
	};

	return (
		<>
			<Slider {...settings} className="carousel-container">
				<div className="carousel-slide" onClick={() => openModal(img1)}>
					<img src={img1} alt="Imagen 1" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img2)}>
					<img src={img2} alt="Imagen 2" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img3)}>
					<img src={img3} alt="Imagen 3" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img4)}>
					<img src={img4} alt="Imagen 4" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img5)}>
					<img src={img5} alt="Imagen 5" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img6)}>
					<img src={img6} alt="Imagen 6" className="carousel-image" />
				</div>
			
				<div className="carousel-slide" onClick={() => openModal(img8)}>
					<img src={img8} alt="Imagen 8" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img9)}>
					<img src={img9} alt="Imagen 9" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img10)}>
					<img src={img10} alt="Imagen 10" className="carousel-image" />
				</div>
				<div className="carousel-slide" onClick={() => openModal(img11)}>
					<img src={img11} alt="Imagen 11" className="carousel-image" />
				</div>
			</Slider>

			{/* Modal para ver la imagen ampliada */}
			{modalOpen && (
				<div className="image-modal open" onClick={closeModal}>
					<span className="image-modal-close" onClick={closeModal}>
						&times;
					</span>
					<div className="image-modal-content">
						<img src={modalImage} alt="Imagen ampliada" />
					</div>
				</div>
			)}
		</>
	);
};

const CustomNextArrow = (props) => {
	const { onClick } = props;
	return <div className="custom-arrow custom-arrow-next" onClick={onClick} />;
};

const CustomPrevArrow = (props) => {
	const { onClick } = props;
	return <div className="custom-arrow custom-arrow-prev" onClick={onClick} />;
};

export default Carousel3D;
