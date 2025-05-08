import { useState, useEffect } from "react";
import axios from "axios"; // Usamos axios para hacer las solicitudes HTTP

/**
 * Hook para obtener todas las mascotas de la base de datos.
 * @returns {Object} - Contiene todas las mascotas, el estado de carga y posibles errores.
 */
const useObtenerTodasLasMascotas = () => {
    const [mascotas, setMascotas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const cargarMascotas = async () => {
            setLoading(true);
            setError(null);

            try {
                const url = "https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json";
                const response = await axios.get(url);

                // Si hay datos, los asignamos al estado
                if (response.data) {
                    setMascotas(Object.values(response.data)); // Aplanamos los objetos de las mascotas
                } else {
                    setMascotas([]); // Si no hay datos, aseguramos que la lista esté vacía
                }
            } catch (error) {
                setError("Error al obtener las mascotas.");
            } finally {
                setLoading(false);
            }
        };

        cargarMascotas();
    }, []); // Este useEffect solo se ejecutará una vez cuando el componente se monte.

    return { mascotas, loading, error };
};

export default useObtenerTodasLasMascotas;
