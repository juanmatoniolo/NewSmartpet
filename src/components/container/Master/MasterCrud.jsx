import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import ListarUsuarios from "./obtener/ListarUsuarios";
import ListarMascotas from "./obtener/ListarMascotas";

function MasterCrud() {
	return (
		<>
			<Logout />

			<div className="container text-center">
				<ListarUsuarios />
				
				<ListarMascotas />
			</div>

			<Footers />
		</>
	);
}

export default MasterCrud;
