import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { API_URL, normalizeItem, resolveUploadUrl } from "../../config/adminApi";

export function useMascota(mascotaId) {
    const [mascota, setMascota] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const calcularEdad = (fechaNac) => {
        if (!fechaNac) return "Desconocida";

        const fechaNacimiento = new Date(fechaNac);

        if (Number.isNaN(fechaNacimiento.getTime())) return "Desconocida";

        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesDiferencia = hoy.getMonth() - fechaNacimiento.getMonth();

        if (
            mesDiferencia < 0 ||
            (mesDiferencia === 0 && hoy.getDate() < fechaNacimiento.getDate())
        ) {
            edad--;
        }

        if (edad < 1) {
            let meses = mesDiferencia;

            if (meses < 0) meses += 12;
            if (meses <= 0) return "Menos de 1 mes";

            return `${meses} mes(es)`;
        }

        return `${edad} año(s)`;
    };

    const obtenerSexo = (sexo) => {
        if (sexo === 1 || sexo === "1") return { texto: "Hembra", icono: "♀" };
        if (sexo === 0 || sexo === "0") return { texto: "Macho", icono: "♂" };

        return { texto: "No definido", icono: "⚥" };
    };

    const limpiarTelefono = (telefono) => {
        if (!telefono) return "";
        return String(telefono).replace(/[^\d]/g, "");
    };

    const getWhatsappLink = (telefono, mensaje) => {
        const tel = limpiarTelefono(telefono);

        if (!tel) return "#";

        const finalTel = tel.startsWith("54") ? tel : `549${tel}`;

        return `https://wa.me/${finalTel}?text=${encodeURIComponent(
            mensaje || "Hola, encontré esta mascota."
        )}`;
    };

    const getPhoneLink = (telefono) => {
        const tel = limpiarTelefono(telefono);
        return tel ? `tel:${tel}` : "#";
    };

    const getInstagramLink = (ig) => {
        if (!ig) return "#";
        return `https://instagram.com/${String(ig).replace("@", "").trim()}`;
    };

    const cargarMascota = useCallback(async () => {
        if (!mascotaId) {
            setMascota(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(`${API_URL}/mascotas/${mascotaId}`);
            const item = normalizeItem(response.data, "mascota");

            if (!item?.id) {
                setError("Mascota no encontrada");
                setMascota(null);
                return;
            }

            setMascota(item);
        } catch (err) {
            console.error("Error al cargar mascota:", err);
            setError(err.response?.data?.error || "Error de conexión. Intente nuevamente.");
            setMascota(null);
        } finally {
            setLoading(false);
        }
    }, [mascotaId]);

    useEffect(() => {
        cargarMascota();
    }, [cargarMascota]);

    const sexoInfo = useMemo(() => obtenerSexo(mascota?.sexo), [mascota?.sexo]);

    const edadTexto = useMemo(() => {
        return mascota?.fecha_nacimiento
            ? calcularEdad(mascota.fecha_nacimiento)
            : "Desconocida";
    }, [mascota?.fecha_nacimiento]);

    const imagenSrc = useMemo(() => {
        return mascota?.urlImg && mascota.urlImg.trim() !== ""
            ? resolveUploadUrl(mascota.urlImg)
            : "/assets/smartpet-default.jpg";
    }, [mascota?.urlImg]);

    return {
        mascota,
        loading,
        error,
        sexoInfo,
        edadTexto,
        imagenSrc,
        getWhatsappLink,
        getPhoneLink,
        getInstagramLink,
        recargar: cargarMascota,
    };
}