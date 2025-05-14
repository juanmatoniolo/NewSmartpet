import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./pages/home";
import { HashRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Collares from "./pages/Collares";
import Cod from "./pages/Cod";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Consultas from "./components/container/Users/Consultas";
import MisMascotas from "./components/container/Users/MisMascotas";
import MasterCrud from "./components/container/Master/MasterCrud";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import ListarMascotas from "./components/container/Master/obtener/ListarMascotas";
import ListarUsuarios from "./components/container/Master/obtener/ListarUsuarios";

function App() {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Homepage />} />
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Register" element={<Register />} />

				{/* Rutas protegidas por autenticación */}
				<Route
					path="/Consultas/:id"
					element={
						<ProtectedRoute>
							<Consultas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/MisMascotas/:id"
					element={
						<ProtectedRoute>
							<MisMascotas />
						</ProtectedRoute>
					}
				/>

				{/* Ruta de MasterCrud solo accesible para admins */}
				<Route
					path="/MasterCrud"
					element={
						<ProtectedRoute requiredRole="admin">
							<MasterCrud />
						</ProtectedRoute>
					}
				/>

				{/* Rutas de ListarMascotas y ListarUsuarios solo accesibles para admins */}
				<Route
					path="/ListarMascotas"
					element={
						<ProtectedRoute requiredRole="admin">
							<ListarMascotas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/ListarUsuarios"
					element={
						<ProtectedRoute requiredRole="admin">
							<ListarUsuarios />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</HashRouter>
	);
}

export default App;
