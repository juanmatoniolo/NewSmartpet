import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./about.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";
import CollarImage1 from "../assets/collares/collar1.png";
import CollarImage2 from "../assets/collares/collar2.png";
import CollarImage3 from "../assets/collares/collar3.png";
import CollarImage4 from "../assets/collares/collar4.png";
import CollarImage5 from "../assets/collares/collar5.png";

function Collares() {
  const collares = [
    {
      id: 1,
      image: CollarImage1,
      name: "Collar Elegante",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium diam vitae risus venenatis tristique.",
    },
    {
      id: 2,
      image: CollarImage2,
      name: "Collar Deportivo",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium diam vitae risus venenatis tristique.",
    },
    {
      id: 3,
      image: CollarImage3,
      name: "Collar Reflectante",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium diam vitae risus venenatis tristique.",
    },
    {
      id: 4,
      image: CollarImage4,
      name: "Collar para Mascotas Pequeñas",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium diam vitae risus venenatis tristique.",
    },
    {
      id: 5,
      image: CollarImage5,
      name: "Collar Personalizado",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pretium diam vitae risus venenatis tristique.",
    },
  ];

  return (
    <>
      <Header />
      <Barnav />
      <div className="container mt-4">
        <h1>Collares Disponibles</h1>
        <div className="row mt-4">
          {collares.map((collar) => (
            <div key={collar.id} className="col-md-4 mb-4">
              <div className="card">
                <img
                  src={collar.image}
                  className="card-img-top"
                  alt={collar.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{collar.name}</h5>
                  <p className="card-text">{collar.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footers />
    </>
  );
}

export default Collares;
