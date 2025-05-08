import React from "react";
import Img from "../../assets/Imagenes";
import { Link, useParams } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa"; // Importamos el icono de logout
import "../container/body.css";

function Logout() {
	const { id } = useParams();

	// Función para cerrar sesión (aquí puedes agregar la lógica de deslogueo si usas algo como Firebase o Context)
	const handleLogout = () => {
		console.log("Sesión cerrada");
		window.location.href = "/";
	};

	return (
		<>
			<header className="smart-header pb-2">
				<div className="contenedor-img-header">
					<Link to={`/Consultas/${id}`}>
						<img
							src={Img.img1}
							className="logo-img"
							alt="Logo smartpet"
						/>
					</Link>
					<button className="btn btn-logout" onClick={handleLogout}>
						<FaSignOutAlt className="logout-icon" /> Cerrar sesión
					</button>
				</div>
			</header>
		</>
	);
}

export default Logout;
