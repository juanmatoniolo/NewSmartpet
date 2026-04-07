import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import Img from "../../assets/Imagenes";
import "./HeaderLogout.css";

const HeaderLogout = () => {
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem("authenticated");
		localStorage.removeItem("userId");
		localStorage.removeItem("userEmail");
		localStorage.removeItem("rol");
		navigate("/login");
	};

	return (
		<header className="smart-header">
			<div className="sp-inner">

				{/* Logo */}
				<Link to="/" className="sp-logo" aria-label="SmartPet - Inicio">
					{/* <img src={Img.img1} alt="SmartPet" className="sp-logo-img" /> */}
					<span className="sp-brand">Smart<span>Pet</span></span>
				</Link>



				<div className="header-right">
					<button className="btn-logout" onClick={handleLogout} aria-label="Cerrar sesión">
						<FaSignOutAlt className="logout-icon" />
						<span>Cerrar sesión</span>
					</button>
				</div>
			</div>
		</header>
	);
};

export default HeaderLogout;