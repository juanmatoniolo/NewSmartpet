// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
	const userStr = localStorage.getItem("user");
	if (!userStr) {
		return <Navigate to="/login" replace />;
	}

	try {
		const user = JSON.parse(userStr);
		if (adminOnly && !user.root) {
			return <Navigate to="/" replace />;
		}
		return children;
	} catch {
		return <Navigate to="/login" replace />;
	}
};

export default ProtectedRoute;