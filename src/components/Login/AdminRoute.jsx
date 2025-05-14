// components/Login/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
	const user = localStorage.getItem("user");
	const rol = localStorage.getItem("rol");

	if (!user || rol !== "master") {
		// Redirige si no está logueado o no es admin
		return <Navigate to="/Login" replace />;
	}

	return children;
};

export default AdminRoute;
