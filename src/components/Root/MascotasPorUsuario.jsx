import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import AdminHeader from "./AdminHeader";
import { Dog } from "lucide-react";
import { API_URL, getAdminHeaders, normalizeItem, normalizeList, resolveUploadUrl } from "../../config/adminApi";

const MascotasPorUsuario = () => {
    const { userId } = useParams();
    const [mascotas, setMascotas] = useState([]);
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) return;

            setLoading(true);
            setError(null);

            try {
                const userRes = await axios.get(`${API_URL}/usuarios/${userId}`, {
                    headers: getAdminHeaders(),
                });

                const user = normalizeItem(userRes.data, "user");

                if (!user?.id) throw new Error("Usuario no encontrado");

                setUsuario(user);

                const mascotasRes = await axios.get(`${API_URL}/mascotas?usuario_id=${userId}`, {
                    headers: getAdminHeaders(),
                });

                setMascotas(normalizeList(mascotasRes.data, "mascotas"));
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || err.message || "Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    if (loading) {
        return (
            <>
                <AdminHeader />
                <div className="container mt-4 text-center">Cargando...</div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <AdminHeader />
                <div className="container mt-4 alert alert-danger">{error}</div>
            </>
        );
    }

    if (!usuario) {
        return (
            <>
                <AdminHeader />
                <div className="container mt-4 alert alert-warning">Usuario no encontrado</div>
            </>
        );
    }

    return (
        <>
            <AdminHeader />

            <div className="container mt-4">
                <h2>
                    <Dog size={28} className="me-2" />
                    Mascotas de {usuario.nombre} {usuario.apellido}
                </h2>

                {mascotas.length === 0 ? (
                    <div className="alert alert-secondary">
                        Este usuario no tiene mascotas registradas.
                    </div>
                ) : (
                    <div className="row">
                        {mascotas.map((m) => (
                            <div key={m.id} className="col-md-4 mb-3">
                                <div className="card h-100 shadow-sm">
                                    <img
                                        src={m.urlImg ? resolveUploadUrl(m.urlImg) : "/a.jpg"}
                                        alt={m.nombre}
                                        className="card-img-top"
                                        style={{ height: 180, objectFit: "cover" }}
                                        onError={(e) => {
                                            e.currentTarget.src = "/a.jpg";
                                        }}
                                    />

                                    <div className="card-body">
                                        <h5 className="card-title">{m.nombre}</h5>

                                        <p className="card-text">
                                            <strong>Sexo:</strong> {m.sexo == 0 ? "Macho" : "Hembra"}
                                            <br />
                                            <strong>Fecha nac.:</strong> {m.fecha_nacimiento || "—"}
                                        </p>

                                        <Link to={`/admin/mascotas/${m.id}`} className="btn btn-sm btn-primary">
                                            Ver detalle
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default MascotasPorUsuario;