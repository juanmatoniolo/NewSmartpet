import axios from "axios";

/**
 * Obtiene todas las mascotas que tienen un codAct igual al parámetro proporcionado.
 * @param {string} codAct - Código de activación para filtrar las mascotas.
 * @returns {Promise<Object[]>} Lista de mascotas que coinciden con el codAct.
 */
const useObtenerMascotasPorCodAct = async (codAct) => {
    const localKey = `mascotas_${codAct}`;

    // Intentamos obtener las mascotas de localStorage primero
    const cachedMascotas = localStorage.getItem(localKey);
    if (cachedMascotas) {
        try {
            const parsed = JSON.parse(cachedMascotas);
            if (Array.isArray(parsed)) return parsed;
        } catch (error) {
            console.warn("Error al leer el cache de mascotas:", error);
        }
    }

    try {
        const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;
        const response = await axios.get(url);
        const data = response.data;

        if (!data) return [];

        // Filtramos las mascotas que tengan un codAct igual al proporcionado
        const mascotasFiltradas = Object.values(data).filter(
            (mascota) => mascota?.codAct === codAct
        );

        // Guardamos en localStorage para uso futuro
        localStorage.setItem(localKey, JSON.stringify(mascotasFiltradas));

        return mascotasFiltradas;
    } catch (error) {
        console.error("Error al obtener las mascotas:", error);
        return [];
    }
};

export default useObtenerMascotasPorCodAct;
