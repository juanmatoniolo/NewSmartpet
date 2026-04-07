import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./pages/home";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Consultas from "./components/container/Users/Consultas";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import ContactosMascota from "./components/container/Users/ContactosMascota";
import MascotaProtegida from "./components/Usuario/MascotaProtegida";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Register" element={<Register />} />

				<Route
					path="/Consultas/:id"
					element={
						<ProtectedRoute>
							<Consultas />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/MascotaProtegida/:id"
					element={

						<MascotaProtegida />

					}
				/>

				<Route
					path="/MisMascotas/:id"
					element={
						<ProtectedRoute>
							<Consultas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/ContactosMascota/:mascotaId"
					element={
						<ProtectedRoute>
							<ContactosMascota />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;