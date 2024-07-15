import React, { useState } from "react";
import "./register.css";
import Header from "../header/Header";
import Barnav from "../nav/Nav";
import Footers from "../footer/Footer";

function Register() {
	return (
		<>
			<Header />
			<Barnav />
			<h1>Formulario de registro</h1>
			<Footers />
		</>
	);
}

export default Register;
