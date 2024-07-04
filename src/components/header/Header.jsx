import React from "react";
import "./header.css";
import Img from "../../assets/Imagenes";
import "./header.css";

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
					<button
						className="btn btn1"
						onClick={() => {
							window.open(
								"https://www.facebook.com/JuanmaToniolo",
								"_blank"
							);
						}}
					>
						Entrar
					</button>
				</div>
				<div className="registrar">
				<button
						className="btn btn2"
						onClick={() => {
							window.open(
								"https://www.facebook.com/JuanmaToniolo",
								"_blank"
							);
						}}
					>
						Registrarse
					</button>
				</div>
			</div>
		</header>
	);
}

export default Header;
