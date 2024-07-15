import React, { useState, useEffect } from "react";
import axios from "axios";
import "./agregar.css";

const Agregarcodigo = ({ id }) => {
    const [codigo, setCodigo] = useState(""); // Estado para almacenar el código a agregar
    const [mensaje, setMensaje] = useState(""); // Estado para mostrar mensajes de éxito o error
    const [cargando, setCargando] = useState(false); // Estado para controlar la carga
    const [codigos, setCodigos] = useState([]); // Estado para almacenar los códigos obtenidos

    const urlMascotas = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;

    // Función para obtener los códigos de activación desde la base de datos
    const fetchCodigos = async () => {
        try {
            const response = await axios.get(urlMascotas);
            const fetchedData = response.data;

            // Extrae y guarda los códigos de activación en un array
            const codigos = Object.keys(fetchedData).reduce((acc, key) => {
                if (fetchedData[key]?.codAct) {
                    acc.push(fetchedData[key].codAct);
                }
                return acc;
            }, []);

            setCodigos(codigos); // Almacena los códigos en el estado
        } catch (error) {
            console.error("Error al obtener datos:", error);
            setMensaje("Error al obtener datos de la base de datos.");
        }
    };

    // Efecto para cargar los códigos al montar el componente
    useEffect(() => {
        fetchCodigos();
    }, []);

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evita el comportamiento predeterminado del formulario

        // Validación del formato del código
        const codigoValido = /^[a-zA-Z]{4}[0-9]{4}$/.test(codigo);
        if (!codigoValido) {
            setMensaje("El código debe tener 4 letras seguidas de 4 números.");
            return;
        }

        setCargando(true); // Establece el estado de carga a verdadero

        try {
            // Validación de coincidencia del código
            const codigoExiste = codigos.includes(codigo);
            if (codigoExiste) {
                setMensaje("El código ingresado ya existe.");
                setCargando(false); // Establece el estado de carga a falso
                return;
            }

            const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;
            try {
                // Realiza una solicitud POST para agregar el código en la ruta específica según el 'id'
                const instance = axios.create({
                    baseURL: "https://smartpet-1d59e-default-rtdb.firebaseio.com", // URL base de la base de datos
                    timeout: 5000, // Tiempo máximo de espera para la solicitud en milisegundos
                    headers: {
                        "Content-Type": "application/json", // Tipo de contenido de la solicitud
                    },
                });

                const response = await instance.post(urlUsuario, {
                    codAct: codigo, // Datos a enviar en el cuerpo de la solicitud
                });

                console.log("Respuesta del servidor:", response.data);
                setMensaje("Código agregado correctamente."); // Actualiza el estado del mensaje
            } catch (error) {
                console.error("Error al agregar código:", error);
                setMensaje("Error al agregar código. Por favor, intenta nuevamente."); // Actualiza el estado del mensaje de error
            }
        } catch (error) {
            console.error("Error al obtener datos:", error);
            setMensaje("Error al obtener datos de la base de datos."); // Muestra mensaje de error si falla la obtención de datos
        }

        setCargando(false); // Establece el estado de carga a falso
    };

    // Función para manejar cambios en el input de código
    const handleChange = (e) => {
        setCodigo(e.target.value); // Actualiza el estado del código con el valor del input
    };

    return (
        <section className="agregar-container section-validador">
            <div className="agregar-form-container">
                {cargando ? (
                    <div className="agregar-loading-container">
                        <p>Aguarde mientras se inicia la base de datos...</p>
                        <div className="agregar-loading-ring"></div>
                    </div>
                ) : (
                    <>
                        <h2 className="agregar-h2">Agregar Código</h2>
                        <form onSubmit={handleSubmit} className="agregar-codigo-form">
                            <input
                                type="text"
                                id="codigo"
                                value={codigo}
                                onChange={handleChange}
                                placeholder="Ej. ABCD1234"
                                required
                            />
                            <button type="submit">Agregar</button>
                        </form>
                        {mensaje && (
                            <p className={`agregar-mensaje ${mensaje.includes("correctamente") ? "mensaje-exito" : ""}`}>
                                {mensaje}
                            </p>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default Agregarcodigo;
