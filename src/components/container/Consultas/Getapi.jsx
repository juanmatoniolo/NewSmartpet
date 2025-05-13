import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "react-bootstrap/Card";
import { Button, Modal } from "react-bootstrap"; // Importamos Modal
import img from "../../../assets/img5.jpg";
import "./get.css";
import GetMascota from "./getmascotas";
import Agregarcodigo from "./Agregarcodigo";

function GetData({ id }) {
  const [data, setData] = useState(null);
  const [mascotas, setMascotas] = useState({});
  const [codigosUnicos, setCodigosUnicos] = useState(new Set());
  const [showModal, setShowModal] = useState(false); // Estado para controlar el modal

  const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;
  const urlMascotasBase = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas`;

  const fetchMascotasData = async (codigos, cachedMascotas) => {
    const mascotasData = { ...cachedMascotas };

    for (const codAct of codigos) {
      if (!cachedMascotas[codAct]) {
        const url = `${urlMascotasBase}.json?orderBy="codAct"&equalTo="${codAct}"`;
        const responseMascota = await axios.get(url);
        const mascota = Object.values(responseMascota.data)[0];
        if (mascota) mascotasData[codAct] = mascota;
      }
    }
    return mascotasData;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseUsuario = await axios.get(urlUsuario);
        const usuarioData = responseUsuario.data;
        setData(usuarioData);

        const codigos = new Set();
        Object.keys(usuarioData).forEach((key) => {
          if (usuarioData[key]?.codAct) {
            codigos.add(usuarioData[key].codAct);
          }
        });
        setCodigosUnicos(codigos);

        const cachedMascotas = JSON.parse(localStorage.getItem("mascotasData")) || {};
        const mascotasData = await fetchMascotasData(codigos, cachedMascotas);

        setMascotas(mascotasData);
        localStorage.setItem("mascotasData", JSON.stringify(mascotasData));
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, []);


  // Componente de Carga Esqueleto
  const SkeletonLoader = () => (
    <Card className="card-pet h-100">
      <div className="skeleton-img" aria-hidden="true" />
      <Card.Body>
        <Card.Title className="skeleton-text" style={{ width: "60%" }} />
        <div className="skeleton-text" style={{ width: "80%" }} />
        <div className="skeleton-text" style={{ width: "70%" }} />
        <Button variant="primary" disabled className="btn-loading mt-3">
          <span className="visually-hidden">Cargando...</span>
        </Button>
      </Card.Body>
    </Card>
  );

  return (
    <main className="user-pets-container">
      <header className="text-center">
        <h1 className="nombre-editable">
          {data ? `Hola ${data.nombre},` : "Hola,"} aquí están tus mascotas
        </h1>
      </header>

      <div className="container-lg">
        <Agregarcodigo id={id} />
        <section className="pets-grid">
          <div className="row g-4 justify-content-center">
            {data ? (
              Array.from(codigosUnicos).map((codAct) => (
                <div key={codAct} className="col-12 col-md-6 col-lg-4">
                  <GetMascota id={codAct} />
                </div>
              ))
            ) : (
              [...Array(3)].map((_, index) => (
                <div key={index} className="col-12 col-md-6 col-lg-4">
                  <SkeletonLoader />
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default GetData;