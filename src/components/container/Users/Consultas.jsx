import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Logout from "../../Logout/Logout";
import Footers from "../../footer/Footer";
import SubscriptionForm from "../BodyConsultas";

function Consultas() {
    const { id } = useParams(); // Obtener el id de los parámetros de la URL
    const [usuario, setUsuario] = useState(null); // Estado para almacenar los datos del usuario

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await axios.get(
                    `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`
                );
                setUsuario(response.data); // Almacenar los datos del usuario en el estado
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUsuario(); // Llamar a la función para obtener los datos del usuario
    }, [id]); // Ejecutar useEffect cada vez que cambie el id

    return (
        <>
            <Logout />

            <div>
                {usuario ? (
                    <div>
                        <h2>Detalles del Usuario</h2>
                        <p>Nombre: {usuario.nombreyapellido}</p>
                        <p>Usuario: {usuario.dni}</p>
                        <p>Correo Electrónico: {usuario.mail}</p>
                        <h3>Códigos de Activación:</h3>
                        <ul>
                            {Object.keys(usuario).filter(key => key.startsWith('-')).map(key => (
                                <li key={key}>
                                    Código: {usuario[key].codAct}
                                </li>
                            ))}
                        </ul>
                        {/* Mostrar otros detalles del usuario según tu estructura de datos */}
                    </div>
                ) : (
                    <p>Cargando usuario...</p>
                )}
            </div>

            <SubscriptionForm />
            <Footers />
        </>
    );
}

export default Consultas;
