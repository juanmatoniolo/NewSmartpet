import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import ListarUsuarios from "./Nueva carpeta/ListarUsuarios";
import ListarMascotas from "./Nueva carpeta/ListarMascotas";

function MasterCrud() {
	return (
		<>
			<Logout />
			<h1 className="text-center">Master</h1>
			<h1 className="text-center">Usuarios de SmartPet</h1>
			<div className="container text-center">
				<ListarUsuarios />
				<br />
				<ListarMascotas />
			</div>

			<Footers />
		</>
	);
}

export default MasterCrud;
