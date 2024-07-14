import { useParams } from "react-router-dom";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import SubscriptionForm from "../BodyConsultas";

import Getapi from "../Consultas/Getapi";

function Consultas() {
	const { id } = useParams();

	return (
		<>
			<Logout />
			<Getapi id={id} />
			<SubscriptionForm />
			<Footers />
		</>
	);
}

export default Consultas;
