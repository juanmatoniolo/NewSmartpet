import React, { useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Users, Dog, Tag, Phone, Calendar, Stethoscope, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost/api-smartpet/index.php';

const DashboardStats = () => {
    const [stats, setStats] = useState({
        usuarios: 0, mascotas: 0, codigos: 0, contactos: 0, historial: 0, veterinarios: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const promises = [
                axios.post(API_URL, { action: 'getusuarios' }),
                axios.post(API_URL, { action: 'getmascotas' }),
                axios.post(API_URL, { action: 'getcodigos' }),
                axios.post(API_URL, { action: 'getcontactos' }),
                axios.post(API_URL, { action: 'gethistorial' }),
                axios.post(API_URL, { action: 'getveterinarios' }).catch(() => ({ data: [] })),
            ];
            const [usuarios, mascotas, codigos, contactos, historial, veterinarios] = await Promise.all(promises);
            setStats({
                usuarios: Array.isArray(usuarios.data) ? usuarios.data.length : 0,
                mascotas: Array.isArray(mascotas.data) ? mascotas.data.length : 0,
                codigos: Array.isArray(codigos.data) ? codigos.data.length : 0,
                contactos: Array.isArray(contactos.data) ? contactos.data.length : 0,
                historial: Array.isArray(historial.data) ? historial.data.length : 0,
                veterinarios: Array.isArray(veterinarios.data) ? veterinarios.data.length : 0,
            });
        } catch (err) {
            console.error('Error cargando estadísticas:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { title: 'Usuarios', value: stats.usuarios, icon: Users, color: '#4E3F7F', bgColor: 'rgba(78,63,127,0.1)' },
        { title: 'Mascotas', value: stats.mascotas, icon: Dog, color: '#F7C3DC', bgColor: 'rgba(247,195,220,0.3)' },
        { title: 'Códigos QR/NFC', value: stats.codigos, icon: Tag, color: '#6C5C94', bgColor: 'rgba(108,92,148,0.1)' },
        { title: 'Contactos', value: stats.contactos, icon: Phone, color: '#17a2b8', bgColor: 'rgba(23,162,184,0.1)' },
        { title: 'Eventos', value: stats.historial, icon: Calendar, color: '#28a745', bgColor: 'rgba(40,167,69,0.1)' },
        { title: 'Veterinarios', value: stats.veterinarios, icon: Stethoscope, color: '#dc3545', bgColor: 'rgba(220,53,69,0.1)' },
    ];

    return (
        <Row className="g-3 mb-4">
            {statCards.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                    <Col xs={6} sm={4} md={2} key={idx}>
                        <Card className="h-100 shadow-sm border-0 text-center">
                            <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div className="rounded-circle p-2" style={{ backgroundColor: stat.bgColor }}>
                                        <Icon size={20} style={{ color: stat.color }} />
                                    </div>
                                    <TrendingUp size={16} className="text-success" />
                                </div>
                                <h6 className="text-muted small mb-1">{stat.title}</h6>
                                <h3 className="fw-bold mb-0">{loading ? '...' : stat.value}</h3>
                            </Card.Body>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};

export default DashboardStats;