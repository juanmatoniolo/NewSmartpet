import React, { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import { Image } from "react-bootstrap";
import "./carrusel.css";

const ControlledCarousel = ({ a, b, c, d }) => {
    const [index, setIndex] = useState(0);

    const handleSelect = (selectedIndex, e) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % 4); // Ciclo entre 0 y 3
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <Carousel
            activeIndex={index}
            onSelect={handleSelect}
            className="DivCarrusel"
        >
            {[a, b, c, d].map((src, idx) => (
                <Carousel.Item key={idx}>
                    <Image
                        src={src}
                        className="IMGCarrusel img-fluid"
                        alt={`Slide ${idx + 1}`}
                    />
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

export default ControlledCarousel;
