import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./about.css";
import Header from "../components/header/Header";
import Barnav from "../components/nav/Nav";
import Footers from "../components/footer/Footer";

function Cod() {
	return (
		<>
			<Header />
			<Barnav />
			<h1>TEngo un codigo</h1>
			<Footers />
		</>
	);
}

export default Cod;
