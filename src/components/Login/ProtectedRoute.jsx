import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
	// Verifica si el usuario está autenticado
	const isAuthenticated = localStorage.getItem("authenticated") === "true";

	// Obtiene el rol del usuario desde localStorage
	const userRole = localStorage.getItem("rol");

	// Si no está autenticado o el rol no es el requerido, redirige a Login
	if (!isAuthenticated || (requiredRole && userRole !== requiredRole)) {
		return <Navigate to="/Login" />;
	}

	return children;
};

export default ProtectedRoute;
