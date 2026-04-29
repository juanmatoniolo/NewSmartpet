import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Dog, Tag, Phone, Calendar, Stethoscope } from "lucide-react";
import { API_URL, getAdminHeaders, normalizeList } from "../../config/adminApi";

const STAT_CARDS = [
    { key: "usuarios", action: "getusuarios", label: "Usuarios", icon: Users, color: "#4e3f7f", bg: "rgba(78,63,127,.12)" },
    { key: "mascotas", action: "getmascotas", label: "Mascotas", icon: Dog, color: "#cd7fa7", bg: "rgba(205,127,167,.18)" },
    { key: "codigos", action: "getcodigos", label: "Códigos", icon: Tag, color: "#6c5c94", bg: "rgba(108,92,148,.12)" },
    { key: "contactos", action: "getcontactos", label: "Contactos", icon: Phone, color: "#0ea5e9", bg: "rgba(14,165,233,.12)" },
    { key: "historial", action: "gethistorial", label: "Eventos", icon: Calendar, color: "#22c55e", bg: "rgba(34,197,94,.12)" },
    { key: "socios", action: "getsocios", label: "Socios", icon: Stethoscope, color: "#f43f5e", bg: "rgba(244,63,94,.12)" },
];

const DashboardStats = () => {
    const [stats, setStats] = useState({
        usuarios: 0,
        mascotas: 0,
        codigos: 0,
        contactos: 0,
        historial: 0,
        socios: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);

            try {
                const results = await Promise.all(
                    STAT_CARDS.map((card) =>
                        axios
                            .post(
                                API_URL,
                                { action: card.action },
                                { headers: getAdminHeaders() }
                            )
                            .catch(() => ({ data: [] }))
                    )
                );

                const next = {};

                STAT_CARDS.forEach((card, index) => {
                    next[card.key] = normalizeList(results[index].data).length;
                });

                setStats(next);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <div className="ds-grid">
            {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
                <div className="ds-card" key={key}>
                    <div className="ds-icon" style={{ background: bg }}>
                        <Icon size={20} color={color} />
                    </div>

                    <div className="ds-info">
                        <span className="ds-label">{label}</span>

                        <span className="ds-value" style={{ color }}>
                            {loading ? <span className="ds-skeleton" /> : stats[key]}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;