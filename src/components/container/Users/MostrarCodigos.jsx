import React, { useState, useEffect } from 'react';

// Función para simular la obtención de datos desde Firebase
const fetchDataFromFirebase = async () => {
    // Aquí simulas la obtención de datos de Firebase
}

const MisCodigos = () => {
    const [mascotas, setMascotas] = useState(null); // Inicializamos mascotas como null

    // Cargar los datos de Firebase
    useEffect(() => {
        const loadMascotas = async () => {
            const data = await fetchDataFromFirebase();
            setMascotas(data); // Almacenar los datos en el estado
        };

        loadMascotas(); // Llamada para obtener los datos
    }, []);

    // Si mascotas es null (cargando), mostramos un mensaje
    if (!mascotas) {
        return <p>Cargando mascotas...</p>;
    }

    return (
        <div>
            <h1>Mis Mascotas</h1>
            {/* Verificar que mascotas y sus propiedades existan antes de mapear */}
            {mascotas && mascotas.length > 0 ? (
                mascotas.map((mascota) => {
                    if (mascota && mascota.datosMascotas) {
                        return (
                            <div key={mascota.codAct}>
                                <h2>{mascota.datosMascotas.nombre}</h2>
                                <p>{mascota.datosMascotas.descripcion}</p>
                                <img
                                    src={mascota.datosMascotas.img || 'https://via.placeholder.com/150'}
                                    alt={mascota.datosMascotas.nombre}
                                    width="150"
                                />
                                <p>Ubicación: {mascota.datosMascotas.ubicacion}</p>
                                <p>Edad: {mascota.datosMascotas.edad} años</p>
                                <p>Sexo: {mascota.datosMascotas.sexo}</p>
                                <p>Contacto 1: {mascota.contactos.persona1.nombre} - {mascota.contactos.persona1.telefono}</p>
                                <p>Contacto 2: {mascota.contactos.persona2.nombre} - {mascota.contactos.persona2.telefono}</p>
                            </div>
                        );
                    }
                    return null;
                })
            ) : (
                <p>No hay mascotas disponibles.</p>
            )}
        </div>
    );
};

export default MisCodigos;
