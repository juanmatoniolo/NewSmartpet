import { useParams } from "react-router-dom";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import SubscriptionForm from "../BodyConsultas";

import Getapi from "../Consultas/Getapi";
import Agregarcodigo from "../Consultas/Agregarcodigo";

function Consultas() {
	const { id } = useParams();

	return (
		<>
			<Logout />
			<Agregarcodigo id={id} />
			<Getapi id={id} />
			<SubscriptionForm />
			<Footers />
		</>
	);
}

export default Consultas;
