import React from "react";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import NavRoot from "./NavRoot";

function MasterCrud() {
	return (
		<>
			<Logout />
			<NavRoot />
			<Footers />
		</>
	);
}

export default MasterCrud;
