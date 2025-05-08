import { useEffect, useState } from "react";
import axios from "axios";

// Caché simple por sesión
const cacheCodigosPorUsuario = {};

/**
 * Hook que obtiene los códigos únicos `codAct` para un usuario.
 * @param {string} idUsuario - ID del usuario (por ejemplo, DNI).
 * @returns {{ codigos: string[], loading: boolean, error: string | null }}
 */
const useCodigosUsuario = (idUsuario) => {
	const [codigos, setCodigos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCodigos = async () => {
			if (!idUsuario) return;

			// Si están en caché, usamos eso
			if (cacheCodigosPorUsuario[idUsuario]) {
				setCodigos(cacheCodigosPorUsuario[idUsuario]);
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const url = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${idUsuario}.json`;
				const response = await axios.get(url);
				const data = response.data;

				if (!data) {
					setCodigos([]);
					setLoading(false);
					return;
				}

				const codigosSet = new Set();

				Object.values(data).forEach((entry) => {
					if (entry?.codAct?.trim()) {
						codigosSet.add(entry.codAct.trim());
					}
				});

				const codigosUnicos = Array.from(codigosSet);

				// Guardar en caché y estado
				cacheCodigosPorUsuario[idUsuario] = codigosUnicos;
				setCodigos(codigosUnicos);
			} catch (err) {
				setError("Error al obtener los códigos.");
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchCodigos();
	}, [idUsuario]);

	return { codigos, loading, error };
};

export default useCodigosUsuario;
