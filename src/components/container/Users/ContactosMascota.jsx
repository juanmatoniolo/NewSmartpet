import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Tabs, Tab, Spinner, Alert, Card, Badge, ProgressBar } from "react-bootstrap";
import { FileText, Calendar, Syringe, Users, Clock, Plus, Search, Filter, Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import axios from "axios";
import SeccionResumen from "./ContactosMascota/SeccionResumen";
import TarjetaContacto from "./ContactosMascota/TarjetaContacto";
import ModalContacto from "./ContactosMascota/ModalContacto";
import ModalCita from "./ContactosMascota/ModalCita";
import ModalVacuna from "./ContactosMascota/ModalVacuna";
import ModalHistorial from "./ContactosMascota/ModalHistorial";
import "./ContactosMascota.css";

const API_BASE = "http://localhost/api-smartpet/index.php";

function ContactosMascota() {
    const { mascotaId } = useParams();
    const navigate = useNavigate();

    // Estados principales
    const [mascota, setMascota] = useState(null);
    const [contactos, setContactos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [vacunas, setVacunas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("todos");
    const [tabActivo, setTabActivo] = useState("resumen");

    // Modales y edición
    const [showModalContacto, setShowModalContacto] = useState(false);
    const [showModalCita, setShowModalCita] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);
    const [showModalVacuna, setShowModalVacuna] = useState(false);
    const [editandoContactoId, setEditandoContactoId] = useState(null);
    const [editandoCitaId, setEditandoCitaId] = useState(null);
    const [editandoHistorialId, setEditandoHistorialId] = useState(null);
    const [editandoVacunaId, setEditandoVacunaId] = useState(null);
    const [contactoEdit, setContactoEdit] = useState(null);
    const [citaEdit, setCitaEdit] = useState(null);
    const [historialEdit, setHistorialEdit] = useState(null);
    const [vacunaEdit, setVacunaEdit] = useState(null);

    useEffect(() => {
        if (!mascotaId) return;
        cargarTodo();
    }, [mascotaId]);

    const cargarTodo = async () => {
        setLoading(true);
        setError("");
        try {
            const [resMascota, resContactos, resHistorial] = await Promise.all([
                axios.get(`${API_BASE}/mascotas/${mascotaId}`),
                axios.get(`${API_BASE}/contactos-mascota?mascota_id=${mascotaId}`),
                axios.get(`${API_BASE}/historial-mascota?mascota_id=${mascotaId}`)
            ]);
            setMascota(resMascota.data || null);
            setContactos(Array.isArray(resContactos.data) ? resContactos.data : []);
            const historialData = Array.isArray(resHistorial.data) ? resHistorial.data : [];
            setHistorial(historialData.filter(item => item.tipo_evento !== "vacuna"));
            setVacunas(historialData.filter(item => item.tipo_evento === "vacuna"));
        } catch (err) {
            console.error(err);
            setError("No se pudo cargar la información.");
        } finally {
            setLoading(false);
        }
    };

    // Computados
    const citas = useMemo(() => historial.filter(item => item.tipo_evento === "cita" || item.tipo_evento === "turno"), [historial]);
    const bitacora = useMemo(() => historial.filter(item => item.tipo_evento === "historial"), [historial]);
    const citasProximas = useMemo(() => {
        const hoy = new Date();
        return citas.filter(c => c.fecha_evento && new Date(c.fecha_evento) >= hoy)
            .sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
    }, [citas]);
    const vacunasPendientes = useMemo(() => vacunas.filter(v => !v.completada), [vacunas]);

    // Contactos con última y próxima cita
    const contactosConCitas = useMemo(() => {
        const citasPorContacto = {};
        citas.forEach(cita => {
            if (cita.id_contacto) {
                if (!citasPorContacto[cita.id_contacto]) citasPorContacto[cita.id_contacto] = [];
                citasPorContacto[cita.id_contacto].push(cita);
            }
        });
        const hoy = new Date();
        return contactos.map(contacto => {
            const lista = citasPorContacto[contacto.id] || [];
            const ordenadas = [...lista].sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
            const ultimaCita = ordenadas.filter(c => new Date(c.fecha_evento) <= hoy).pop();
            const proximaCita = ordenadas.find(c => new Date(c.fecha_evento) > hoy);
            return { ...contacto, ultimaCita, proximaCita };
        });
    }, [contactos, citas]);

    const contactosFiltrados = useMemo(() => {
        let resultado = contactosConCitas;
        if (filtroTipo !== "todos") resultado = resultado.filter(c => c.tipo === filtroTipo);
        if (searchTerm) resultado = resultado.filter(c =>
            c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.apellido || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
        return resultado.sort((a, b) => {
            if (a.favorito && !b.favorito) return -1;
            if (!a.favorito && b.favorito) return 1;
            return a.nombre.localeCompare(b.nombre);
        });
    }, [contactosConCitas, filtroTipo, searchTerm]);

    const calcularSaludVacunas = () => {
        if (vacunas.length === 0) return 0;
        return Math.round((vacunas.filter(v => v.completada).length / vacunas.length) * 100);
    };

    const renderTipo = (contacto) => {
        if (contacto.tipo === "otro") return contacto.categoria_personalizada || "Otro";
        const tipos = { veterinario: "Veterinario", peluqueria: "Peluquería", paseador: "Paseador", petshop: "Pet Shop", guarderia: "Guardería" };
        return tipos[contacto.tipo] || "Sin tipo";
    };

    const getIconoTipo = (tipo) => {
        const mapa = { veterinario: "🏥", peluqueria: "✂️", paseador: "🦮", petshop: "🏪", guarderia: "🏠" };
        return mapa[tipo] || "📋";
    };

    const enviarWhatsApp = (celular, nombre) => {
        if (!celular) return;
        let numero = celular.replace(/\D/g, "");
        if (numero.length === 10) numero = "54" + numero;
        window.open(`https://wa.me/${numero}?text=Hola%20${encodeURIComponent(nombre)}`, "_blank");
    };

    // CRUD Contactos
    const handleGuardarContacto = async (formData) => {
        try {
            const payload = { id_mascota: mascotaId, ...formData };
            if (editandoContactoId) {
                await axios.put(`${API_BASE}/contactos-mascota/${editandoContactoId}`, payload);
            } else {
                await axios.post(`${API_BASE}/contactos-mascota`, payload);
            }
            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar contacto.");
            return false;
        }
    };

    const eliminarContacto = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/contactos-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    const toggleFavorito = async (contacto) => {
        try {
            await axios.put(`${API_BASE}/contactos-mascota/${contacto.id}`, { favorito: !contacto.favorito });
            await cargarTodo();
        } catch (err) {
            setError("Error al actualizar favorito.");
        }
    };

    // CRUD Citas
    const handleGuardarCita = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "cita" };
            if (editandoCitaId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoCitaId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }
            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar cita.");
            return false;
        }
    };

    const eliminarCita = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    // CRUD Vacunas
    const handleGuardarVacuna = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "vacuna" };
            if (editandoVacunaId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoVacunaId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }
            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar vacuna.");
            return false;
        }
    };

    const eliminarVacuna = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar vacuna "${nombre}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    // CRUD Historial
    const handleGuardarHistorial = async (data) => {
        try {
            const payload = { id_mascota: mascotaId, ...data, tipo_evento: "historial" };
            if (editandoHistorialId) {
                await axios.put(`${API_BASE}/historial-mascota/${editandoHistorialId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }
            await cargarTodo();
            return true;
        } catch (err) {
            setError("Error al guardar registro.");
            return false;
        }
    };

    const eliminarHistorial = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar "${titulo}"?`)) return;
        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            setError("Error al eliminar.");
        }
    };

    if (loading) return (
        <Container className="py-5 text-center">
            <Spinner animation="border" variant="primary" />
            <div className="mt-3">Cargando información...</div>
        </Container>
    );

    return (
        <Container fluid className="py-3 px-2 px-md-4">
            <Row className="mb-3">
                <Col>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <div>
                            <h2 className="mb-0"><FileText size={28} className="me-2" />{mascota?.nombre || "Mascota"}</h2>
                            <small className="text-muted">Gestión integral de salud y cuidados</small>
                        </div>
                        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>← Volver</Button>
                    </div>
                </Col>
            </Row>
            {error && <Alert variant="danger" dismissible onClose={() => setError("")}>{error}</Alert>}

            <Tabs activeKey={tabActivo} onSelect={setTabActivo} className="mb-3">
                {/* Resumen */}
                <Tab eventKey="resumen" title={<><FileText size={16} className="me-1" /> Resumen</>}>
                    <SeccionResumen
                        citasProximas={citasProximas}
                        vacunasPendientes={vacunasPendientes}
                        contactos={contactos}
                        bitacora={bitacora}
                        vacunas={vacunas}
                        calcularSaludVacunas={calcularSaludVacunas}
                        onNuevoContacto={() => { setEditandoContactoId(null); setContactoEdit(null); setShowModalContacto(true); }}
                        onNuevaCita={() => { setEditandoCitaId(null); setCitaEdit(null); setShowModalCita(true); }}
                        onNuevaVacuna={() => { setEditandoVacunaId(null); setVacunaEdit(null); setShowModalVacuna(true); }}
                        onNuevoHistorial={() => { setEditandoHistorialId(null); setHistorialEdit(null); setShowModalHistorial(true); }}
                    />
                </Tab>

                {/* Contactos */}
                <Tab eventKey="contactos" title={<><Users size={16} className="me-1" /> Contactos ({contactos.length})</>}>
                    <Row className="mb-3">
                        <Col xs={12} md={6}>
                            <div className="input-group">
                                <span className="input-group-text"><Search size={18} /></span>
                                <input type="text" className="form-control" placeholder="Buscar contactos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                        </Col>
                        <Col xs={12} md={4}>
                            <div className="input-group">
                                <span className="input-group-text"><Filter size={18} /></span>
                                <select className="form-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                    <option value="todos">Todos</option>
                                    <option value="veterinario">Veterinarios</option>
                                    <option value="peluqueria">Peluquerías</option>
                                    <option value="paseador">Paseadores</option>
                                    <option value="petshop">Pet Shops</option>
                                    <option value="guarderia">Guarderías</option>
                                    <option value="otro">Otros</option>
                                </select>
                            </div>
                        </Col>
                        <Col xs={12} md={2}>
                            <Button variant="success" className="w-100" onClick={() => { setEditandoContactoId(null); setContactoEdit(null); setShowModalContacto(true); }}>
                                <Plus size={18} /> Nuevo
                            </Button>
                        </Col>
                    </Row>
                    <Row className="g-3">
                        {contactosFiltrados.map(contacto => (
                            <TarjetaContacto
                                key={contacto.id}
                                contacto={contacto}
                                onToggleFavorito={toggleFavorito}
                                onEditar={() => { setEditandoContactoId(contacto.id); setContactoEdit(contacto); setShowModalContacto(true); }}
                                onEliminar={eliminarContacto}
                                onWhatsApp={enviarWhatsApp}
                                renderTipo={renderTipo}
                                getIconoTipo={getIconoTipo}
                            />
                        ))}
                    </Row>
                </Tab>

                {/* Citas */}
                <Tab eventKey="citas" title={<><Calendar size={16} className="me-1" /> Citas ({citas.length})</>}>
                    <div className="mb-3">
                        <Button variant="primary" onClick={() => { setEditandoCitaId(null); setCitaEdit(null); setShowModalCita(true); }}><Plus size={18} /> Nueva Cita</Button>
                    </div>
                    {citasProximas.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3"><AlertCircle size={20} className="text-warning me-2" />Próximas Citas</h5>
                            <Row className="g-3">
                                {citasProximas.map(item => (
                                    <Col xs={12} key={item.id}>
                                        <Card className="border-warning border-2 shadow-sm">
                                            <Card.Body>
                                                <div className="d-flex justify-content-between flex-wrap gap-2">
                                                    <div><h6 className="mb-1">{item.titulo}</h6><div className="small text-muted"><Calendar size={14} className="me-1" />{new Date(item.fecha_evento).toLocaleDateString('es-AR')}</div></div>
                                                    <div className="d-flex gap-2">
                                                        <Button variant="outline-primary" size="sm" onClick={() => { setEditandoCitaId(item.id); setCitaEdit(item); setShowModalCita(true); }}><Edit2 size={16} /></Button>
                                                        <Button variant="outline-danger" size="sm" onClick={() => eliminarCita(item.id, item.titulo)}><Trash2 size={16} /></Button>
                                                    </div>
                                                </div>
                                                <div className="mt-2">{item.nota}</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    )}
                    <h5 className="mb-3">Todas las Citas</h5>
                    <Row className="g-3">
                        {citas.length === 0 ? (
                            <Col xs={12}><Alert variant="light" className="text-center">No hay citas registradas.</Alert></Col>
                        ) : (
                            citas.map(item => (
                                <Col xs={12} md={6} key={item.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <div><h6 className="mb-1">{item.titulo}</h6><Badge bg="primary">Cita</Badge></div>
                                                <small className="text-muted">{item.fecha_evento && new Date(item.fecha_evento).toLocaleDateString('es-AR')}</small>
                                            </div>
                                            <p className="mb-2 small">{item.nota}</p>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-primary" size="sm" onClick={() => { setEditandoCitaId(item.id); setCitaEdit(item); setShowModalCita(true); }}><Edit2 size={16} /></Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => eliminarCita(item.id, item.titulo)}><Trash2 size={16} /></Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>

                {/* Vacunas */}
                <Tab eventKey="vacunas" title={<><Syringe size={16} className="me-1" /> Vacunas ({vacunas.length})</>}>
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div><h5 className="mb-1">Plan de Vacunación</h5><ProgressBar now={calcularSaludVacunas()} label={`${calcularSaludVacunas()}% completado`} variant="success" style={{ width: "200px" }} /></div>
                        <Button variant="warning" onClick={() => { setEditandoVacunaId(null); setVacunaEdit(null); setShowModalVacuna(true); }}><Plus size={18} /> Nueva Vacuna</Button>
                    </div>
                    {vacunasPendientes.length > 0 && <Alert variant="warning"><strong>⚠️ {vacunasPendientes.length} vacuna(s) pendiente(s)</strong></Alert>}
                    <Row className="g-3">
                        {vacunas.length === 0 ? (
                            <Col xs={12}><Alert variant="light" className="text-center">No hay vacunas registradas.</Alert></Col>
                        ) : (
                            vacunas.map(vacuna => (
                                <Col xs={12} md={6} lg={4} key={vacuna.id}>
                                    <Card className={`h-100 ${vacuna.completada ? 'border-success' : 'border-warning'}`}>
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <div><h6 className="mb-1">{vacuna.titulo}</h6>{vacuna.completada ? <Badge bg="success"><CheckCircle size={14} className="me-1" /> Aplicada</Badge> : <Badge bg="warning" text="dark"><AlertCircle size={14} className="me-1" /> Pendiente</Badge>}</div>
                                            </div>
                                            {vacuna.fecha_evento && <div className="small mb-1"><strong>Aplicada:</strong> {new Date(vacuna.fecha_evento).toLocaleDateString('es-AR')}</div>}
                                            {vacuna.proxima_fecha && <div className="small mb-1"><strong>Próxima dosis:</strong> {new Date(vacuna.proxima_fecha).toLocaleDateString('es-AR')}</div>}
                                            {vacuna.laboratorio && <div className="small mb-1"><strong>Laboratorio:</strong> {vacuna.laboratorio}</div>}
                                            {vacuna.lote && <div className="small mb-1"><strong>Lote:</strong> {vacuna.lote}</div>}
                                            {vacuna.nota && <div className="mt-2 p-2 bg-light rounded small">{vacuna.nota}</div>}
                                            <div className="d-flex gap-2 mt-3">
                                                <Button variant="outline-primary" size="sm" onClick={() => { setEditandoVacunaId(vacuna.id); setVacunaEdit(vacuna); setShowModalVacuna(true); }}><Edit2 size={16} /></Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => eliminarVacuna(vacuna.id, vacuna.titulo)}><Trash2 size={16} /></Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>

                {/* Bitácora */}
                <Tab eventKey="bitacora" title={<><FileText size={16} className="me-1" /> Bitácora ({bitacora.length})</>}>
                    <div className="mb-3"><Button variant="dark" onClick={() => { setEditandoHistorialId(null); setHistorialEdit(null); setShowModalHistorial(true); }}><Plus size={18} /> Nuevo Registro</Button></div>
                    <Row className="g-3">
                        {bitacora.length === 0 ? (
                            <Col xs={12}><Alert variant="light" className="text-center">No hay registros en la bitácora.</Alert></Col>
                        ) : (
                            bitacora.map(item => (
                                <Col xs={12} key={item.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <div><h6 className="mb-1">{item.titulo}</h6>{item.fecha_evento && <small className="text-muted">{new Date(item.fecha_evento).toLocaleDateString('es-AR')}</small>}</div>
                                                <div className="d-flex gap-2">
                                                    <Button variant="outline-primary" size="sm" onClick={() => { setEditandoHistorialId(item.id); setHistorialEdit(item); setShowModalHistorial(true); }}><Edit2 size={16} /></Button>
                                                    <Button variant="outline-danger" size="sm" onClick={() => eliminarHistorial(item.id, item.titulo)}><Trash2 size={16} /></Button>
                                                </div>
                                            </div>
                                            <p className="mb-0">{item.nota}</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>
            </Tabs>

            {/* Modales */}
            <ModalContacto show={showModalContacto} onHide={() => setShowModalContacto(false)} contactoEdit={contactoEdit} onSave={handleGuardarContacto} />
            <ModalCita show={showModalCita} onHide={() => setShowModalCita(false)} citaEdit={citaEdit} contactos={contactos} mascotaId={mascotaId} onSave={handleGuardarCita} />
            <ModalVacuna show={showModalVacuna} onHide={() => setShowModalVacuna(false)} vacunaEdit={vacunaEdit} mascotaId={mascotaId} onSave={handleGuardarVacuna} />
            <ModalHistorial show={showModalHistorial} onHide={() => setShowModalHistorial(false)} historialEdit={historialEdit} contactos={contactos} mascotaId={mascotaId} onSave={handleGuardarHistorial} />
        </Container>
    );
}

export default ContactosMascota;