import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Tabs,
    Tab,
    Spinner,
    Alert,
    Badge,
    Modal,
    Form
} from "react-bootstrap";

const API_BASE = "http://localhost/api-smartpet/index.php";

function ContactosMascota() {
    const { mascotaId } = useParams();
    const navigate = useNavigate();

    const [mascota, setMascota] = useState(null);
    const [contactos, setContactos] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");

    // Modales
    const [showModalContacto, setShowModalContacto] = useState(false);
    const [showModalCita, setShowModalCita] = useState(false);
    const [showModalHistorial, setShowModalHistorial] = useState(false);

    // Estados para edición (null = nuevo, id = editando)
    const [editandoContactoId, setEditandoContactoId] = useState(null);
    const [editandoCitaId, setEditandoCitaId] = useState(null);
    const [editandoHistorialId, setEditandoHistorialId] = useState(null);

    // Formularios
    const [contactoForm, setContactoForm] = useState({
        tipo: "veterinario",
        categoria_personalizada: "",
        nombre: "",
        apellido: "",
        celular: "",
        telefono_fijo: "",
        direccion: "",
        horarios: "",
        dias_atencion: "",
        notas: "",
    });

    const [citaForm, setCitaForm] = useState({
        id_contacto: "",
        fecha_evento: "",
        proxima_fecha: "",
        titulo: "",
        nota: "",
        tipo_evento: "cita",
    });

    const [historialForm, setHistorialForm] = useState({
        id_contacto: "",
        fecha_evento: "",
        proxima_fecha: "",
        titulo: "",
        nota: "",
        tipo_evento: "historial",
    });

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
                axios.get(`${API_BASE}/historial-mascota?mascota_id=${mascotaId}`),
            ]);

            setMascota(resMascota.data || null);
            setContactos(Array.isArray(resContactos.data) ? resContactos.data : []);
            setHistorial(Array.isArray(resHistorial.data) ? resHistorial.data : []);
        } catch (err) {
            console.error("Error al cargar agenda de la mascota", err);
            setError("No se pudo cargar la agenda de la mascota.");
        } finally {
            setLoading(false);
        }
    };

    const citas = useMemo(() => {
        return historial.filter(
            (item) => item.tipo_evento === "cita" || item.tipo_evento === "turno"
        );
    }, [historial]);

    const bitacora = useMemo(() => {
        return historial.filter(
            (item) => item.tipo_evento !== "cita" && item.tipo_evento !== "turno"
        );
    }, [historial]);

    const renderTipo = (contacto) => {
        if (contacto.tipo === "otro") {
            return contacto.categoria_personalizada || "Otro";
        }
        return contacto.tipo || "Sin tipo";
    };

    const nombreContactoHistorial = (item) => {
        if (!item.nombre) return null;
        const tipo = item.tipo === "otro"
            ? item.categoria_personalizada || "Otro"
            : item.tipo || "Contacto";
        return `${item.nombre} ${item.apellido || ""}`.trim() + ` (${tipo})`;
    };

    // ==================== CONTACTOS CRUD ====================
    const resetContactoForm = () => {
        setContactoForm({
            tipo: "veterinario",
            categoria_personalizada: "",
            nombre: "",
            apellido: "",
            celular: "",
            telefono_fijo: "",
            direccion: "",
            horarios: "",
            dias_atencion: "",
            notas: "",
        });
        setEditandoContactoId(null);
    };

    const abrirModalContacto = (contacto = null) => {
        if (contacto) {
            setEditandoContactoId(contacto.id);
            setContactoForm({
                tipo: contacto.tipo || "veterinario",
                categoria_personalizada: contacto.categoria_personalizada || "",
                nombre: contacto.nombre || "",
                apellido: contacto.apellido || "",
                celular: contacto.celular || "",
                telefono_fijo: contacto.telefono_fijo || "",
                direccion: contacto.direccion || "",
                horarios: contacto.horarios || "",
                dias_atencion: contacto.dias_atencion || "",
                notas: contacto.notas || "",
            });
        } else {
            resetContactoForm();
        }
        setShowModalContacto(true);
    };

    const handleGuardarContacto = async (e) => {
        e.preventDefault();
        if (!contactoForm.nombre.trim()) {
            setError("El nombre del contacto es obligatorio.");
            return;
        }
        if (contactoForm.tipo === "otro" && !contactoForm.categoria_personalizada.trim()) {
            setError("Debes indicar la categoría personalizada.");
            return;
        }

        setGuardando(true);
        setError("");

        try {
            const payload = {
                id_mascota: mascotaId,
                ...contactoForm,
            };
            if (editandoContactoId) {
                // Editar: usamos POST con ID en la URL (o PUT según tu backend)
                await axios.post(`${API_BASE}/contactos-mascota/${editandoContactoId}`, payload);
            } else {
                await axios.post(`${API_BASE}/contactos-mascota`, payload);
            }
            setShowModalContacto(false);
            resetContactoForm();
            await cargarTodo();
        } catch (err) {
            console.error("Error al guardar contacto", err);
            setError(err.response?.data?.error || "No se pudo guardar el contacto.");
        } finally {
            setGuardando(false);
        }
    };

    const eliminarContacto = async (id, nombre) => {
        if (!window.confirm(`¿Eliminar el contacto "${nombre}"?`)) return;
        setGuardando(true);
        try {
            await axios.delete(`${API_BASE}/contactos-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            console.error(err);
            setError("Error al eliminar el contacto.");
        } finally {
            setGuardando(false);
        }
    };

    const enviarWhatsApp = (celular, nombre) => {
        if (!celular) return;
        let numero = celular.replace(/\D/g, "");
        if (numero.length === 10) numero = "54" + numero; // Ajusta según tu país
        const url = `https://wa.me/${numero}?text=Hola%20${encodeURIComponent(nombre)}%2C%20te%20contacto%20por%20mi%20mascota%20${encodeURIComponent(mascota?.nombre || "")}`;
        window.open(url, "_blank");
    };

    // ==================== CITAS CRUD ====================
    const resetCitaForm = () => {
        setCitaForm({
            id_contacto: "",
            fecha_evento: "",
            proxima_fecha: "",
            titulo: "",
            nota: "",
            tipo_evento: "cita",
        });
        setEditandoCitaId(null);
    };

    const abrirModalCita = (cita = null) => {
        if (cita) {
            setEditandoCitaId(cita.id);
            setCitaForm({
                id_contacto: cita.id_contacto?.toString() || "",
                fecha_evento: cita.fecha_evento || "",
                proxima_fecha: cita.proxima_fecha || "",
                titulo: cita.titulo || "",
                nota: cita.nota || "",
                tipo_evento: "cita",
            });
        } else {
            resetCitaForm();
        }
        setShowModalCita(true);
    };

    const handleGuardarCita = async (e) => {
        e.preventDefault();
        if (!citaForm.titulo.trim()) {
            setError("El título de la cita es obligatorio.");
            return;
        }
        if (!citaForm.nota.trim()) {
            setError("La descripción de la cita es obligatoria.");
            return;
        }

        setGuardando(true);
        setError("");

        try {
            const payload = {
                id_mascota: mascotaId,
                id_contacto: citaForm.id_contacto || null,
                fecha_evento: citaForm.fecha_evento || null,
                proxima_fecha: citaForm.proxima_fecha || null,
                titulo: citaForm.titulo,
                nota: citaForm.nota,
                tipo_evento: "cita",
            };
            if (editandoCitaId) {
                await axios.post(`${API_BASE}/historial-mascota/${editandoCitaId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }
            setShowModalCita(false);
            resetCitaForm();
            await cargarTodo();
        } catch (err) {
            console.error("Error al guardar cita", err);
            setError(err.response?.data?.error || "No se pudo guardar la cita.");
        } finally {
            setGuardando(false);
        }
    };

    const eliminarCita = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar la cita "${titulo}"?`)) return;
        setGuardando(true);
        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            console.error(err);
            setError("Error al eliminar la cita.");
        } finally {
            setGuardando(false);
        }
    };

    // ==================== HISTORIAL/BITÁCORA CRUD ====================
    const resetHistorialForm = () => {
        setHistorialForm({
            id_contacto: "",
            fecha_evento: "",
            proxima_fecha: "",
            titulo: "",
            nota: "",
            tipo_evento: "historial",
        });
        setEditandoHistorialId(null);
    };

    const abrirModalHistorial = (item = null) => {
        if (item) {
            setEditandoHistorialId(item.id);
            setHistorialForm({
                id_contacto: item.id_contacto?.toString() || "",
                fecha_evento: item.fecha_evento || "",
                proxima_fecha: item.proxima_fecha || "",
                titulo: item.titulo || "",
                nota: item.nota || "",
                tipo_evento: "historial",
            });
        } else {
            resetHistorialForm();
        }
        setShowModalHistorial(true);
    };

    const handleGuardarHistorial = async (e) => {
        e.preventDefault();
        if (!historialForm.titulo.trim()) {
            setError("El título del historial es obligatorio.");
            return;
        }
        if (!historialForm.nota.trim()) {
            setError("La nota del historial es obligatoria.");
            return;
        }

        setGuardando(true);
        setError("");

        try {
            const payload = {
                id_mascota: mascotaId,
                id_contacto: historialForm.id_contacto || null,
                fecha_evento: historialForm.fecha_evento || null,
                proxima_fecha: historialForm.proxima_fecha || null,
                titulo: historialForm.titulo,
                nota: historialForm.nota,
                tipo_evento: "historial",
            };
            if (editandoHistorialId) {
                await axios.post(`${API_BASE}/historial-mascota/${editandoHistorialId}`, payload);
            } else {
                await axios.post(`${API_BASE}/historial-mascota`, payload);
            }
            setShowModalHistorial(false);
            resetHistorialForm();
            await cargarTodo();
        } catch (err) {
            console.error("Error al guardar historial", err);
            setError(err.response?.data?.error || "No se pudo guardar el historial.");
        } finally {
            setGuardando(false);
        }
    };

    const eliminarHistorial = async (id, titulo) => {
        if (!window.confirm(`¿Eliminar el registro "${titulo}" de la bitácora?`)) return;
        setGuardando(true);
        try {
            await axios.delete(`${API_BASE}/historial-mascota/${id}`);
            await cargarTodo();
        } catch (err) {
            console.error(err);
            setError("Error al eliminar el registro.");
        } finally {
            setGuardando(false);
        }
    };

    // ==================== RENDER ====================
    if (loading) {
        return (
            <Container className="py-4 text-center">
                <Spinner animation="border" />
                <div className="mt-2">Cargando agenda...</div>
            </Container>
        );
    }

    return (
        <Container className="py-3 py-md-4">
            <Row className="mb-3">
                <Col className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div>
                        <h2 className="mb-1">Agenda de {mascota?.nombre || "la mascota"}</h2>
                        <div className="text-muted small">
                            Contactos, citas y bitácora general
                        </div>
                    </div>

                    <div className="d-flex gap-2 flex-wrap">
                        <Button variant="success" size="sm" onClick={() => abrirModalContacto()}>
                            + Contacto
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => abrirModalCita()}>
                            + Cita
                        </Button>
                        <Button variant="dark" size="sm" onClick={() => abrirModalHistorial()}>
                            + Historial
                        </Button>
                        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
                            Volver
                        </Button>
                    </div>
                </Col>
            </Row>

            {error && <Alert variant="danger" className="mt-2">{error}</Alert>}

            <Tabs defaultActiveKey="contactos" className="mb-3">
                {/* ---------- TAB CONTACTOS ---------- */}
                <Tab eventKey="contactos" title={`Contactos (${contactos.length})`}>
                    <Row className="g-3">
                        {contactos.length === 0 ? (
                            <Col>
                                <Alert variant="light" className="border">
                                    No hay contactos cargados para esta mascota.
                                </Alert>
                            </Col>
                        ) : (
                            contactos.map((contacto) => (
                                <Col xs={12} md={6} lg={4} key={contacto.id}>
                                    <Card className="h-100 shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-1 mb-2">
                                                <Card.Title className="mb-0 fs-6">
                                                    {contacto.nombre} {contacto.apellido || ""}
                                                </Card.Title>
                                                <Badge bg="info" text="dark" className="small">
                                                    {renderTipo(contacto)}
                                                </Badge>
                                            </div>

                                            {contacto.celular && (
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span><strong>Celular:</strong> {contacto.celular}</span>
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => enviarWhatsApp(contacto.celular, contacto.nombre)}
                                                        className="px-2 py-0"
                                                    >
                                                        📲 WhatsApp
                                                    </Button>
                                                </div>
                                            )}
                                            {contacto.telefono_fijo && <div><strong>Tel. fijo:</strong> {contacto.telefono_fijo}</div>}
                                            {contacto.direccion && <div className="small"><strong>Dirección:</strong> {contacto.direccion}</div>}
                                            {contacto.dias_atencion && <div className="small"><strong>Días:</strong> {contacto.dias_atencion}</div>}
                                            {contacto.horarios && <div className="small"><strong>Horarios:</strong> {contacto.horarios}</div>}
                                            {contacto.notas && (
                                                <div className="mt-2 text-muted small">
                                                    <strong>Notas:</strong> {contacto.notas}
                                                </div>
                                            )}

                                            <div className="d-flex gap-2 mt-3">
                                                <Button variant="outline-primary" size="sm" onClick={() => abrirModalContacto(contacto)}>
                                                    Editar
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => eliminarContacto(contacto.id, contacto.nombre)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>

                {/* ---------- TAB CITAS ---------- */}
                <Tab eventKey="citas" title={`Citas (${citas.length})`}>
                    <Row className="g-3">
                        {citas.length === 0 ? (
                            <Col>
                                <Alert variant="light" className="border">
                                    No hay citas registradas para esta mascota.
                                </Alert>
                            </Col>
                        ) : (
                            citas.map((item) => (
                                <Col xs={12} key={item.id}>
                                    <Card className="shadow-sm border-primary">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                                                <div>
                                                    <Card.Title className="mb-1 fs-6">{item.titulo || "Cita"}</Card.Title>
                                                    <Badge bg="primary">Cita</Badge>
                                                </div>
                                                <div className="text-end small">
                                                    {item.fecha_evento && <div><strong>Fecha:</strong> {item.fecha_evento}</div>}
                                                    {item.proxima_fecha && <div><strong>Próxima:</strong> {item.proxima_fecha}</div>}
                                                </div>
                                            </div>
                                            {nombreContactoHistorial(item) && (
                                                <div className="mb-2 small"><strong>Contacto:</strong> {nombreContactoHistorial(item)}</div>
                                            )}
                                            <div className="mb-2">{item.nota}</div>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-primary" size="sm" onClick={() => abrirModalCita(item)}>
                                                    Editar
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => eliminarCita(item.id, item.titulo)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>

                {/* ---------- TAB HISTORIAL/BITÁCORA ---------- */}
                <Tab eventKey="historial" title={`Historial (${bitacora.length})`}>
                    <Row className="g-3">
                        {bitacora.length === 0 ? (
                            <Col>
                                <Alert variant="light" className="border">
                                    No hay registros en la bitácora de esta mascota.
                                </Alert>
                            </Col>
                        ) : (
                            bitacora.map((item) => (
                                <Col xs={12} key={item.id}>
                                    <Card className="shadow-sm">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between flex-wrap gap-2 mb-2">
                                                <div>
                                                    <Card.Title className="mb-1 fs-6">
                                                        {item.titulo || "Registro"}
                                                    </Card.Title>
                                                    <div className="text-muted small">
                                                        {item.tipo_evento || "Historial"}
                                                    </div>
                                                </div>
                                                <div className="text-end small">
                                                    {item.fecha_evento && <div><strong>Fecha:</strong> {item.fecha_evento}</div>}
                                                    {item.proxima_fecha && <div><strong>Próxima:</strong> {item.proxima_fecha}</div>}
                                                </div>
                                            </div>
                                            {nombreContactoHistorial(item) && (
                                                <div className="mb-2 small"><strong>Relacionado con:</strong> {nombreContactoHistorial(item)}</div>
                                            )}
                                            <div className="mb-2">{item.nota}</div>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-primary" size="sm" onClick={() => abrirModalHistorial(item)}>
                                                    Editar
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => eliminarHistorial(item.id, item.titulo)}>
                                                    Eliminar
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))
                        )}
                    </Row>
                </Tab>
            </Tabs>

            {/* ---------- MODAL CONTACTO ---------- */}
            <Modal show={showModalContacto} onHide={() => setShowModalContacto(false)} centered size="lg">
                <Form onSubmit={handleGuardarContacto}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editandoContactoId ? "Editar contacto" : "Agregar contacto"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col xs={12} md={6}>
                                <Form.Label>Tipo</Form.Label>
                                <Form.Select
                                    value={contactoForm.tipo}
                                    onChange={(e) => setContactoForm({ ...contactoForm, tipo: e.target.value })}
                                >
                                    <option value="veterinario">Veterinario</option>
                                    <option value="peluqueria">Peluquería</option>
                                    <option value="otro">Otro</option>
                                </Form.Select>
                            </Col>
                            {contactoForm.tipo === "otro" && (
                                <Col xs={12} md={6}>
                                    <Form.Label>Categoría personalizada</Form.Label>
                                    <Form.Control
                                        value={contactoForm.categoria_personalizada}
                                        onChange={(e) => setContactoForm({ ...contactoForm, categoria_personalizada: e.target.value })}
                                        placeholder="Ej: Adiestrador"
                                    />
                                </Col>
                            )}
                            <Col xs={12} md={6}>
                                <Form.Label>Nombre *</Form.Label>
                                <Form.Control
                                    value={contactoForm.nombre}
                                    onChange={(e) => setContactoForm({ ...contactoForm, nombre: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    value={contactoForm.apellido}
                                    onChange={(e) => setContactoForm({ ...contactoForm, apellido: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Celular</Form.Label>
                                <Form.Control
                                    value={contactoForm.celular}
                                    onChange={(e) => setContactoForm({ ...contactoForm, celular: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Teléfono fijo</Form.Label>
                                <Form.Control
                                    value={contactoForm.telefono_fijo}
                                    onChange={(e) => setContactoForm({ ...contactoForm, telefono_fijo: e.target.value })}
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Dirección</Form.Label>
                                <Form.Control
                                    value={contactoForm.direccion}
                                    onChange={(e) => setContactoForm({ ...contactoForm, direccion: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Días de atención</Form.Label>
                                <Form.Control
                                    value={contactoForm.dias_atencion}
                                    onChange={(e) => setContactoForm({ ...contactoForm, dias_atencion: e.target.value })}
                                    placeholder="Lunes a Viernes"
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Horarios</Form.Label>
                                <Form.Control
                                    value={contactoForm.horarios}
                                    onChange={(e) => setContactoForm({ ...contactoForm, horarios: e.target.value })}
                                    placeholder="9 a 18 hs"
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Notas</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={contactoForm.notas}
                                    onChange={(e) => setContactoForm({ ...contactoForm, notas: e.target.value })}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModalContacto(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="success" disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar contacto"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* ---------- MODAL CITA ---------- */}
            <Modal show={showModalCita} onHide={() => setShowModalCita(false)} centered size="lg">
                <Form onSubmit={handleGuardarCita}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editandoCitaId ? "Editar cita" : "Agregar cita"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col xs={12}>
                                <Form.Label>Contacto relacionado</Form.Label>
                                <Form.Select
                                    value={citaForm.id_contacto}
                                    onChange={(e) => setCitaForm({ ...citaForm, id_contacto: e.target.value })}
                                >
                                    <option value="">Sin contacto asociado</option>
                                    {contactos.map((contacto) => (
                                        <option key={contacto.id} value={contacto.id}>
                                            {contacto.nombre} {contacto.apellido || ""} - {renderTipo(contacto)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Fecha de la cita</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={citaForm.fecha_evento}
                                    onChange={(e) => setCitaForm({ ...citaForm, fecha_evento: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Próxima cita</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={citaForm.proxima_fecha}
                                    onChange={(e) => setCitaForm({ ...citaForm, proxima_fecha: e.target.value })}
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Título *</Form.Label>
                                <Form.Control
                                    value={citaForm.titulo}
                                    onChange={(e) => setCitaForm({ ...citaForm, titulo: e.target.value })}
                                    placeholder="Ej: Control veterinario"
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Detalle *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={citaForm.nota}
                                    onChange={(e) => setCitaForm({ ...citaForm, nota: e.target.value })}
                                    placeholder="Qué se hizo, qué se recomendó, qué hay que recordar..."
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModalCita(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="primary" disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar cita"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* ---------- MODAL HISTORIAL/BITÁCORA ---------- */}
            <Modal show={showModalHistorial} onHide={() => setShowModalHistorial(false)} centered size="lg">
                <Form onSubmit={handleGuardarHistorial}>
                    <Modal.Header closeButton>
                        <Modal.Title>{editandoHistorialId ? "Editar historial" : "Agregar historial / bitácora"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row className="g-3">
                            <Col xs={12}>
                                <Form.Label>Contacto relacionado</Form.Label>
                                <Form.Select
                                    value={historialForm.id_contacto}
                                    onChange={(e) => setHistorialForm({ ...historialForm, id_contacto: e.target.value })}
                                >
                                    <option value="">Sin contacto asociado</option>
                                    {contactos.map((contacto) => (
                                        <option key={contacto.id} value={contacto.id}>
                                            {contacto.nombre} {contacto.apellido || ""} - {renderTipo(contacto)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Fecha</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={historialForm.fecha_evento}
                                    onChange={(e) => setHistorialForm({ ...historialForm, fecha_evento: e.target.value })}
                                />
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Label>Próxima fecha</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={historialForm.proxima_fecha}
                                    onChange={(e) => setHistorialForm({ ...historialForm, proxima_fecha: e.target.value })}
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Título *</Form.Label>
                                <Form.Control
                                    value={historialForm.titulo}
                                    onChange={(e) => setHistorialForm({ ...historialForm, titulo: e.target.value })}
                                    placeholder="Ej: Baño, control, observación"
                                />
                            </Col>
                            <Col xs={12}>
                                <Form.Label>Bitácora / nota *</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={historialForm.nota}
                                    onChange={(e) => setHistorialForm({ ...historialForm, nota: e.target.value })}
                                    placeholder="Escribí acá todo lo que se fue haciendo con la mascota"
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModalHistorial(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant="dark" disabled={guardando}>
                            {guardando ? "Guardando..." : "Guardar historial"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
}

export default ContactosMascota;