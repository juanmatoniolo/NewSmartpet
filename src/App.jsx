import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Homepage from "./pages/home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Consultas from "./components/container/Users/Consultas";
import ProtectedRoute from "./components/Login/ProtectedRoute";
import ContactosMascota from "./components/container/Users/ContactosMascota";
import MascotaProtegida from "./components/Usuario/MascotaProtegida";
import Configuracion from "./pages/Configuracion";
import Buy from "./components/Buy/Buy";
import Dashboard from "./components/Root/Dashboard";
import HeaderLogout from "./components/Logout/Logout";
import MascotasAdm from "./components/Root/MascotasAdm";
import MisMascotas from "./components/Root/MisMascotas";
import MascotaAdminDetail from "./components/Root/MascotaAdminDetail";
import Productos from "./components/Root/Productos";
import About from "./pages/About";

function App() {
	const [authenticated, setAuthenticated] = React.useState(
		localStorage.getItem("authenticated") === "true" ||
		!!localStorage.getItem("userId")
	);

	const handleLogout = () => {
		localStorage.clear();
		setAuthenticated(false);
	};

	return (
		<BrowserRouter>
			<Routes>
				{/* Rutas públicas */}
				<Route path="/" element={<Homepage />} />
				<Route path="/Comprar" element={<Buy />} />
				<Route path="/comprar" element={<Buy />} />
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/newsmartpet" element={<Homepage />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/login" element={<Login />} />
				<Route path="/Register" element={<Register />} />
				<Route path="/register" element={<Register />} />
				<Route path="/about" element={<About />} />
				<Route path="/About" element={<About />} />

				{/* Ruta pública para QR / NFC */}
				<Route path="/MascotaProtegida/:id" element={<MascotaProtegida />} />
				<Route path="/mascotaProtegida/:id" element={<MascotaProtegida />} />
				<Route path="/mascotaprotegida/:id" element={<MascotaProtegida />} />

				{/* Rutas protegidas usuario */}
				<Route
					path="/Consultas/:id"
					element={
						<ProtectedRoute>
							<Consultas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/consultas/:id"
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
							<Consultas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/agenda/:userId"
					element={
						<ProtectedRoute>
							<ContactosMascota />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/configuracion"
					element={
						<ProtectedRoute>
							<Configuracion />
						</ProtectedRoute>
					}
				/>

				{/* Rutas protegidas admin */}
				<Route
					path="/admin"
					element={
						<ProtectedRoute adminOnly={true}>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/mis-mascotas"
					element={
						<ProtectedRoute adminOnly={true}>
							<MisMascotas />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/mis-mascotas/:id"
					element={
						<ProtectedRoute adminOnly={true}>
							<MascotaAdminDetail />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/mascotas"
					element={
						<ProtectedRoute adminOnly={true}>
							<MascotasAdm />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/mascotas/:id"
					element={
						<ProtectedRoute adminOnly={true}>
							<MascotaAdminDetail />
						</ProtectedRoute>
					}
				/>

				{/* Dashboard legacy */}
				<Route
					path="/dashboard"
					element={
						authenticated ? (
							<>
								<HeaderLogout onLogout={handleLogout} />
								<Dashboard />
							</>
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>

				<Route
					path="/admin/productos"
					element={
						<ProtectedRoute adminOnly={true}>
							<Productos />
						</ProtectedRoute>
					}
				/>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;