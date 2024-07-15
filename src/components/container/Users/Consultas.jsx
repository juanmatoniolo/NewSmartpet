import { Link, useParams } from "react-router-dom";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import Agregarcodigo from "../Consultas/Agregarcodigo";
import "./consultas.css"; // Asegúrate de crear y usar un archivo CSS para estos estilos

function Consultas() {
    const { id } = useParams();

    return (
        <>
            <Logout />
            <div className="consultas-container">
                <h1 className="consultas-title">Bienvenidos a Smartpet</h1>
                <Agregarcodigo id={id} />
                <div className="instructions">
                    <h2 className="instructions-title">Instrucciones:</h2>
                    <ol className="instructions-list">
                        <li>Agregue el código de su collar.</li>
                        <li>
                            Una vez agregado el código, diríjase a{" "}
                            <Link to={`/MisMascotas/${id}`} className="instructions-link">Mis Mascotas</Link>
                        </li>
                        <li>Toque el botón 'Editar' y configure los datos de su mascota.</li>
                        <li>Para modificar datos de su mascota, repita el paso 3.</li>
                    </ol>
                </div>
            </div>
            <Footers />
        </>
    );
}

export default Consultas;
