import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader"; // ✅ Correcto (mismo directorio)
import MascotaDetailView from "./MascotaDetailView"; // ✅ Mismo directorio
import { useMascota } from "./useMascota"; // ✅ Ruta correcta (si existe)

const API_URL = "http://localhost/api-smartpet/index.php"; // ✅ Definir API_URL

const MascotaAdminDetail = () => {
    const { id } = useParams();
    const { mascota, loading, error, sexoInfo, edadTexto, imagenSrc, getWhatsappLink, getPhoneLink, getInstagramLink, recargar } = useMascota(id);

    const handleRefresh = async () => {
        await recargar(); // Recarga los datos desde el backend
    };

    const handleDelete = async () => {
        if (window.confirm("¿Eliminar esta mascota?")) {
            try {
                await axios.post(API_URL, { action: "deletemascota", id });
                alert("Mascota eliminada");
                window.location.href = "/admin/mis-mascotas";
            } catch (err) {
                alert("Error al eliminar: " + (err.response?.data?.error || err.message));
            }
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

export default MascotaAdminDetail; // ✅ Exportación por defecto