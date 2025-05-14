import React from "react";
import { Link } from "react-router-dom";
import './navroot.css'; // Asegúrate de crear este archivo CSS

const NavRoot = () => {
    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li>
                    <Link to="/ListarUsuarios" className="navbar-link">
                        Lista de Usuarios
                    </Link>
                </li>
                <li>
                    <Link to="/ListarMascotas" className="navbar-link">
                        Lista de Mascotas
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default NavRoot;
