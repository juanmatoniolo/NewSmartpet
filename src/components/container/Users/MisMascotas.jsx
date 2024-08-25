import { useParams } from "react-router-dom";
import React from "react";
import Logout from "../../Logout/Logout";
import Getapi from "../Consultas/Getapi";
import Footers from "../../footer/Footer";
import EditarDatos from "../Consultas/EditarDatos";

function MisMascotas() {
	const { id } = useParams();

	return (
		<>
			<Logout />
		
			<Getapi id={id} />
			<EditarDatos/>


			<Footers/>
		</>
	);
}

export default MisMascotas;
