import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./pages/home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Collares from "./pages/Collares";
import Cod from "./pages/Cod";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Consultas from "./components/container/Users/Consultas";
import MasterCrud from "./components/container/Master/MasterCrud";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import BodyConsultas from "./components/container/BodyConsultas";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/About" element={<About />} />
				<Route path="/Collares" element={<Collares />} />
				<Route path="/Cod" element={<Cod />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Register" element={<Register />} />

				<Route
					path="/Consultas"
					element={
						<ProtectedRoute>
							{" "}
							<Consultas />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/MasterCrud"
					element={
						<ProtectedRoute>
							<MasterCrud />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
