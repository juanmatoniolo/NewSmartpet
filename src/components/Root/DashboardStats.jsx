import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Dog, Tag, Phone, Calendar, Stethoscope } from 'lucide-react';

const API_URL = 'http://localhost/api-smartpet/index.php';

const STAT_CARDS = [
    { key: 'usuarios', label: 'Usuarios', icon: Users, color: '#4e3f7f', bg: 'rgba(78,63,127,.12)' },
    { key: 'mascotas', label: 'Mascotas', icon: Dog, color: '#cd7fa7', bg: 'rgba(205,127,167,.18)' },
    { key: 'codigos', label: 'Códigos', icon: Tag, color: '#6c5c94', bg: 'rgba(108,92,148,.12)' },
    { key: 'contactos', label: 'Contactos', icon: Phone, color: '#0ea5e9', bg: 'rgba(14,165,233,.12)' },
    { key: 'historial', label: 'Eventos', icon: Calendar, color: '#22c55e', bg: 'rgba(34,197,94,.12)' },
    { key: 'veterinarios', label: 'Veterinarios', icon: Stethoscope, color: '#f43f5e', bg: 'rgba(244,63,94,.12)' },
];

const DashboardStats = () => {
    const [stats, setStats] = useState({ usuarios: 0, mascotas: 0, codigos: 0, contactos: 0, historial: 0, veterinarios: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const results = await Promise.all(
                    STAT_CARDS.map(c =>
                        axios.post(API_URL, { action: `get${c.key}` }).catch(() => ({ data: [] }))
                    )
                );
                const next = {};
                STAT_CARDS.forEach((c, i) => {
                    next[c.key] = Array.isArray(results[i].data) ? results[i].data.length : 0;
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

