import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import MascotaDetailView from "./MascotaDetailView";
import { useMascota } from "./useMascota";
import { API_URL, getAdminHeaders } from "../../config/adminApi";

const MascotaAdminDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        mascota,
        loading,
        error,
        sexoInfo,
        edadTexto,
        imagenSrc,
        getWhatsappLink,
        getPhoneLink,
        getInstagramLink,
        recargar,
    } = useMascota(id);

    const handleRefresh = async () => {
        await recargar();
    };

    const handleDelete = async () => {
        if (!window.confirm("¿Eliminar esta mascota?")) return;

        try {
            await axios.post(
                API_URL,
                {
                    action: "deletemascota",
                    id,
                },
                {
                    headers: getAdminHeaders(),
                }
            );

            alert("Mascota eliminada");
            navigate("/admin/mis-mascotas");
        } catch (err) {
            alert("Error al eliminar: " + (err.response?.data?.error || err.message));
        }
    };

    if (loading) return <div className="text-center p-5">Cargando mascota...</div>;
    if (error) return <div className="alert alert-danger">Error: {error}</div>;

    return (
        <>
            <AdminHeader />

            <MascotaDetailView
                mascota={mascota}
                sexoInfo={sexoInfo}
                edadTexto={edadTexto}
                imagenSrc={imagenSrc}
                getWhatsappLink={getWhatsappLink}
                getPhoneLink={getPhoneLink}
                getInstagramLink={getInstagramLink}
                showActions={true}
                onDelete={handleDelete}
                onSave={handleRefresh}
            />
        </>
    );
};

export default MascotaAdminDetail;