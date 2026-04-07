import React from "react";
import { useParams } from "react-router-dom";
import HeaderLogout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import PanelUsuario from "../Consultas/PanelUsuario"


function Consultas() {
    const { id } = useParams();
    return (
        <>
            <HeaderLogout />
            <PanelUsuario usuarioId={id} />
            <Footers />
        </>
    );
}

export default Consultas;