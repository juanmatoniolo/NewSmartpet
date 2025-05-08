import { useState, useEffect } from "react";
import axios from "axios"; // Usamos axios para hacer las solicitudes HTTP

/**
 * Hook para obtener las mascotas asociadas a un listado de códigos
 * @param {Array} codigos - Listado de códigos de las mascotas.
 * @returns {Object} - Contiene las mascotas, el estado de carga y posibles errores.
 */
const useObtenerMascotasPorCodigos = (codigos) => {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarMascotas = async () => {
            if (codigos.length === 0) return; // Si no hay códigos, no hacer nada.

            setLoading(true);
            setError(null);

            try {
                // Realizamos las solicitudes para cada código
                const mascotasData = await Promise.all(
                    codigos.map(async (cod) => {
                        const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json?orderBy=codAct&equalTo=${cod}`;
                        const response = await axios.get(url);
                        return Object.values(response.data || []); // Devolver las mascotas si existen
                    })
                );

                // Aplanamos el array de mascotas
                setMascotas(mascotasData.flat());
            } catch (error) {
                setError("Error al obtener las mascotas.");
            } finally {
                setLoading(false);
            }
        };

        cargarMascotas();
    }, [codigos]); // El useEffect depende de los códigos

    return { mascotas, loading, error };
};

export default useObtenerMascotasPorCodigos;
