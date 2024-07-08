import React from "react";
import "./header.css";
import Img from "../../assets/Imagenes";
import { Link } from "react-router-dom";

function Header() {
	return (
		<header className="headersmart">
			<div className="imglogo">
				<img
					src={Img.img1}
					className="imglogopng"
					alt="Logo smartpet"
				/>
			</div>
			<div className="login">
				<div className="entrar">
					<Link to="/login">
						<button className="btn btn1">Entrar</button>
					</Link>
				</div>
				<div className="registrar">
					<Link to="/login">
						<button className="btn btn2">Registro</button>
					</Link>
				</div>
			</div>
		</header>
	);
}

export default Header;
