import { Link, useParams } from "react-router-dom";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import Agregarcodigo from "../Consultas/Agregarcodigo";
import "./consultas.css"; // Asegúrate de crear y usar un archivo CSS para estos estilos
import EditarDatos from "../Consultas/EditarDatos";
import GetData from "../Consultas/Getapi";

function Consultas() {
    const { id } = useParams();

    return (
        <>
            <Logout />
            <GetData id={id} />
            <EditarDatos />
            <Footers />
        </>
    );
}

export default Consultas;
