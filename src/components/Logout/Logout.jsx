import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Img from "../../assets/Imagenes";
import "./HeaderLogout.css"; // Renombrado para consistencia

const HeaderLogout = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const handleLogout = () => {
		const confirmLogout = window.confirm("¿Estás seguro de que deseas cerrar sesión?");
		if (confirmLogout) {
			// Aquí puedes limpiar tokens, localStorage, contexto, etc.
			localStorage.removeItem("userToken"); // Ejemplo
			sessionStorage.clear();
			console.log("Sesión cerrada correctamente");
			navigate("/");
		}
	};

	return (
		<header className="smart-header">
			<div className="header-left">
				<Link to={`/Consultas/${id}`} className="logo-link">
					<img src={Img.img1} className="logo-img" alt="SmartPet logo" />
				</Link>
			</div>
			<div className="header-right">
				<button className="btn-logout" onClick={handleLogout} aria-label="Cerrar sesión">
					<FaSignOutAlt className="logout-icon" />
					<span>Cerrar sesión</span>
				</button>
			</div>
		</header>
	);
};

export default HeaderLogout;