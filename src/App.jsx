// App.jsx (corregido)
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Homepage from "./pages/home";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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

function App() {
	const [authenticated, setAuthenticated] = React.useState(
		localStorage.getItem('authenticated') === 'true'
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
				<Route path="/NewSmartpet" element={<Homepage />} />
				<Route path="/Login" element={<Login />} />
				<Route path="/Register" element={<Register />} />
				<Route path="/MascotaProtegida/:id" element={<MascotaProtegida />} />

				{/* Rutas protegidas (requieren autenticación) */}
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
							<Consultas />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/agenda/:mascotaId"
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
				<Route
					path="/admin"
					element={
						<ProtectedRoute adminOnly={true}>
							<Dashboard />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/mis-mascotas/id"
					element={
						<ProtectedRoute adminOnly={true}>
							<MascotasAdm />
						</ProtectedRoute>
					}
				/>

				<Route path="/admin/mis-mascotas" element={<ProtectedRoute adminOnly={true}>
					<MisMascotas />
				</ProtectedRoute>}
				/>


				<Route path="/admin/mis-mascotas/:id" element={<ProtectedRoute adminOnly={true}>
					<MascotaAdminDetail />
				</ProtectedRoute>} />


				{/* Ruta dashboard protegida manualmente */}
				<Route
					path="/dashboard"
					element={
						authenticated ? (
							<>
								<HeaderLogout onLogout={handleLogout} />
								<Dashboard />
							</>
						) : (
							<Navigate to="/Login" replace />
						)
					}
				/>

				{/* Opcional: redirigir cualquier ruta no encontrada */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;