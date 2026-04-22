import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Nav, Table, Button, Modal, Form,
  Badge, Alert, Tabs, Tab
} from 'react-bootstrap';
import {
  Users, Dog, Tag, Phone, Calendar, MapPin, Stethoscope,
  FileText, Plus, Edit2, Trash2, Save, X, Eye, Search, Download, RefreshCw
} from 'lucide-react';
import DashboardStats from './DashboardStats'; // Ajusta el nombre según tu archivo
import './dashboard.css';

const API_URL = 'http://localhost/api-smartpet/index.php';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentItem, setCurrentItem] = useState({});
  const [detailItem, setDetailItem] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [relatedData, setRelatedData] = useState({});

  // ==================== CONFIGURACIÓN DE SECCIONES ====================
  const sections = {
    usuarios: {
      title: 'Usuarios',
      icon: Users,
      endpoint: 'usuarios',
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true, hideOnEdit: true },
        { name: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date', required: true },
        { name: 'recibir_emails', label: 'Recibir Emails', type: 'checkbox' }
      ],
      columns: ['id', 'nombre', 'apellido', 'email', 'fecha_nacimiento'],
      detailTabs: ['info', 'mascotas', 'codigos']
    },
    mascotas: {
      title: 'Mascotas',
      icon: Dog,
      endpoint: 'mascotas',
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date', required: true },
        { name: 'sexo', label: 'Sexo', type: 'select', options: [{ value: 0, label: 'Macho' }, { value: 1, label: 'Hembra' }], required: true },
        { name: 'direccion', label: 'Dirección', type: 'textarea' },
        { name: 'descripcion', label: 'Descripción', type: 'textarea' },
        { name: 'id_usuario', label: 'ID Usuario', type: 'number', required: true },
        { name: 'codigo_id', label: 'ID Código', type: 'number', required: true },
        { name: 'mensajeRescate', label: 'Mensaje Rescate', type: 'textarea' },
        { name: 'persona1', label: 'Persona 1', type: 'text' },
        { name: 'persona1tel', label: 'Tel Persona 1', type: 'tel' },
        { name: 'persona2', label: 'Persona 2', type: 'text' },
        { name: 'persona2tel', label: 'Tel Persona 2', type: 'tel' }
      ],
      columns: ['id', 'nombre', 'fecha_nacimiento', 'sexo', 'id_usuario'],
      detailTabs: ['info', 'contactos', 'historial', 'ubicaciones']
    },
    codigos: {
      title: 'Códigos QR/NFC',
      icon: Tag,
      endpoint: 'codigos',
      fields: [
        { name: 'codigo_unico', label: 'Código Único', type: 'text', required: true, pattern: '[A-Z]{4}[0-9]{4}', placeholder: 'ABCD1234' }
      ],
      columns: ['id', 'codigo_unico'],
      detailTabs: ['info', 'mascota']
    },
    contactos: {
      title: 'Contactos',
      icon: Phone,
      endpoint: 'contactos',
      fields: [
        { name: 'id_mascota', label: 'ID Mascota', type: 'number', required: true },
        {
          name: 'tipo', label: 'Tipo', type: 'select', options: [
            { value: 'veterinario', label: 'Veterinario' },
            { value: 'paseador', label: 'Paseador' },
            { value: 'peluquero', label: 'Peluquero' },
            { value: 'guarderia', label: 'Guardería' },
            { value: 'otro', label: 'Otro' }
          ], required: true
        },
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'apellido', label: 'Apellido', type: 'text' },
        { name: 'celular', label: 'Celular', type: 'tel' },
        { name: 'telefono_fijo', label: 'Teléfono Fijo', type: 'tel' },
        { name: 'direccion', label: 'Dirección', type: 'text' },
        { name: 'horarios', label: 'Horarios', type: 'text' },
        { name: 'dias_atencion', label: 'Días de Atención', type: 'text' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
        { name: 'favorito', label: 'Favorito', type: 'checkbox' }
      ],
      columns: ['id', 'nombre', 'tipo', 'celular', 'favorito'],
      detailTabs: ['info', 'mascota']
    },
    historial: {
      title: 'Historial',
      icon: Calendar,
      endpoint: 'historial',
      fields: [
        { name: 'id_mascota', label: 'ID Mascota', type: 'number', required: true },
        {
          name: 'tipo_evento', label: 'Tipo', type: 'select', options: [
            { value: 'cita', label: 'Cita' },
            { value: 'vacuna', label: 'Vacuna' },
            { value: 'bitacora', label: 'Bitácora' }
          ], required: true
        },
        { name: 'titulo', label: 'Título', type: 'text', required: true },
        { name: 'fecha_evento', label: 'Fecha Evento', type: 'date', required: true },
        { name: 'proxima_fecha', label: 'Próxima Fecha', type: 'date' },
        { name: 'nota', label: 'Nota', type: 'textarea', required: true },
        { name: 'laboratorio', label: 'Laboratorio', type: 'text' },
        { name: 'lote', label: 'Lote', type: 'text' },
        { name: 'completada', label: 'Completada', type: 'checkbox' },
        { name: 'recordatorio', label: 'Recordatorio', type: 'checkbox' }
      ],
      columns: ['id', 'titulo', 'tipo_evento', 'fecha_evento', 'completada'],
      detailTabs: ['info', 'mascota']
    },
    veterinarios: {
      title: 'Veterinarios',
      icon: Stethoscope,
      endpoint: 'veterinarios',
      fields: [
        { name: 'nombre', label: 'Nombre', type: 'text', required: true },
        { name: 'clinica', label: 'Clínica', type: 'text' },
        { name: 'telefono', label: 'Teléfono', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'direccion', label: 'Dirección', type: 'text' },
        { name: 'observaciones', label: 'Observaciones', type: 'textarea' }
      ],
      columns: ['id', 'nombre', 'clinica', 'telefono', 'email'],
      detailTabs: ['info']
    },
    ubicaciones: {
      title: 'Ubicaciones',
      icon: MapPin,
      endpoint: 'ubicaciones',
      fields: [
        { name: 'id_mascota', label: 'ID Mascota', type: 'number', required: true },
        { name: 'ubicacion', label: 'Coordenadas (lat,lng)', type: 'text', required: true, placeholder: '-30.766238,-57.984069' }
      ],
      columns: ['id', 'id_mascota', 'ubicacion', 'fecha_hora'],
      detailTabs: ['info', 'mascota', 'mapa']
    }
  };

  const currentSection = sections[activeTab];

  // ==================== CARGAR DATOS ====================
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, { action: `get${currentSection.endpoint}` });
      const fetchedData = response.data;
      if (Array.isArray(fetchedData)) {
        setData(fetchedData);
      } else if (fetchedData && fetchedData.error) {
        setError(fetchedData.error);
        setData([]);
      } else {
        setData([]);
      }
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // ==================== DATOS RELACIONADOS (para detalle) ====================
  const loadRelatedData = async (item) => {
    const related = {};
    try {
      if (activeTab === 'usuarios') {
        const mascotasRes = await axios.get(`${API_URL}?usuario_id=${item.id}`, { params: { r: 'mascotas' } });
        related.mascotas = Array.isArray(mascotasRes.data) ? mascotasRes.data : [];
        const codigosRes = await axios.get(`${API_URL}?usuario_id=${item.id}`, { params: { r: 'user-codes' } });
        related.codigos = codigosRes.data || [];
      }
      if (activeTab === 'mascotas') {
        const contactosRes = await axios.get(`${API_URL}?mascota_id=${item.id}`, { params: { r: 'contactos-mascota' } });
        related.contactos = contactosRes.data || [];
        const historialRes = await axios.get(`${API_URL}?mascota_id=${item.id}`, { params: { r: 'historial-mascota' } });
        related.historial = historialRes.data || [];
        const ubicacionesRes = await axios.get(`${API_URL}?mascota_id=${item.id}`, { params: { r: 'ubicaciones-todas' } });
        related.ubicaciones = ubicacionesRes.data || [];
      }
      if (activeTab === 'codigos') {
        const mascotaRes = await axios.post(API_URL, { action: 'getmascotas' });
        const mascotas = mascotaRes.data || [];
        related.mascota = mascotas.find(m => m.codigo_id == item.id);
      }
      if (activeTab === 'contactos' || activeTab === 'historial') {
        const mascotaRes = await axios.get(`${API_URL}/${item.id_mascota}`, { params: { r: 'mascotas' } });
        related.mascota = mascotaRes.data;
      }
      if (activeTab === 'ubicaciones') {
        const mascotaRes = await axios.get(`${API_URL}/${item.id_mascota}`, { params: { r: 'mascotas' } });
        related.mascota = mascotaRes.data;
      }
      setRelatedData(related);
    } catch (err) {
      console.error('Error cargando datos relacionados:', err);
    }
  };

  // ==================== CRUD ====================
  const handleCreate = () => {
    setModalMode('create');
    setCurrentItem({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setCurrentItem(item);
    setShowModal(true);
  };

  const handleViewDetail = async (item) => {
    setDetailItem(item);
    setRelatedData({});
    setShowDetailModal(true);
    await loadRelatedData(item);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await axios.post(API_URL, {
        action: `delete${currentSection.endpoint.slice(0, -1)}`,
        id
      });
      setSuccess('Registro eliminado correctamente');
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al eliminar: ' + err.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    currentSection.fields.forEach(field => {
      if (field.type === 'checkbox') {
        data[field.name] = formData.get(field.name) ? 1 : 0;
      }
    });
    try {
      const action = modalMode === 'create'
        ? `create${currentSection.endpoint.slice(0, -1)}`
        : `update${currentSection.endpoint.slice(0, -1)}`;
      if (modalMode === 'edit') data.id = currentItem.id;
      await axios.post(API_URL, { action, ...data });
      setSuccess(`Registro ${modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`);
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    }
  };

  const handleExport = () => {
    const filtered = data.filter(item =>
      !searchTerm || currentSection.columns.some(col =>
        String(item[col]).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    const csv = [
      currentSection.columns.join(','),
      ...filtered.map(row => currentSection.columns.map(col => row[col]).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSection.title}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // ==================== RENDER FORMULARIO ====================
  const renderField = (field) => {
    if (modalMode === 'edit' && field.hideOnEdit) return null;
    const value = currentItem[field.name] || '';
    switch (field.type) {
      case 'textarea':
        return <Form.Control as="textarea" rows={3} name={field.name} defaultValue={value} required={field.required} placeholder={field.placeholder} />;
      case 'select':
        return (
          <Form.Select name={field.name} defaultValue={value} required={field.required}>
            <option value="">Seleccionar...</option>
            {field.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Form.Select>
        );
      case 'checkbox':
        return <Form.Check type="checkbox" name={field.name} defaultChecked={value == 1} />;
      default:
        return <Form.Control type={field.type} name={field.name} defaultValue={value} required={field.required} pattern={field.pattern} placeholder={field.placeholder} />;
    }
  };

  // ==================== RENDER DETALLE (simplificado) ====================
  const renderDetailContent = () => {
    if (!detailItem) return null;
    return (
      <Tabs defaultActiveKey="info" className="mb-3">
        <Tab eventKey="info" title="Información General">
          <Table bordered>
            <tbody>
              {currentSection.fields.map(field => (
                <tr key={field.name}>
                  <td style={{ width: '30%', fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>{field.label}</td>
                  <td>
                    {field.type === 'checkbox'
                      ? <Badge bg={detailItem[field.name] == 1 ? 'success' : 'secondary'}>{detailItem[field.name] == 1 ? 'Sí' : 'No'}</Badge>
                      : field.name === 'sexo' ? (detailItem[field.name] == 0 ? 'Macho' : 'Hembra') : detailItem[field.name] || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        {/* Puedes agregar más tabs según necesites */}
      </Tabs>
    );
  };

  const filteredData = data.filter(item =>
    !searchTerm || currentSection.columns.some(col =>
      String(item[col]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="dashboard-container">
      <DashboardStats />
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h1 className="dashboard-title"><FileText size={40} /> Dashboard SmartPet</h1>
          </Col>
        </Row>
        {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess(null)}>{success}</Alert>}
        <Row>
          <Col md={3} lg={2} className="mb-4">
            <Nav className="flex-column nav-sidebar">
              {Object.entries(sections).map(([key, section]) => {
                const Icon = section.icon;
                return (
                  <Nav.Link key={key} active={activeTab === key} onClick={() => setActiveTab(key)}>
                    <Icon size={18} /> {section.title}
                  </Nav.Link>
                );
              })}
            </Nav>
          </Col>
          <Col md={9} lg={10}>
            <Card className="dashboard-card">
              <Card.Header className="card-header-gradient d-flex flex-wrap justify-content-between align-items-center gap-2">
                <h4 className="mb-0">{React.createElement(currentSection.icon, { size: 24 })} {currentSection.title}</h4>
                <div className="d-flex gap-2">
                  <Button variant="outline-light" onClick={loadData}><RefreshCw size={18} /> Refrescar</Button>
                  <Button variant="outline-light" onClick={handleExport}><Download size={18} /> Exportar</Button>
                  <Button className="btn-create" onClick={handleCreate}><Plus size={18} /> Crear</Button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="search-bar mb-3">
                  <Search className="search-icon" size={18} />
                  <Form.Control type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <Badge className="record-badge">{filteredData.length} registros</Badge>
                </div>
                {loading ? (
                  <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-5 text-muted">No hay registros disponibles</div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="dashboard-table">
                      <thead>
                        <tr>
                          {currentSection.columns.map(col => <th key={col}>{col}</th>)}
                          <th className="text-end">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map(item => (
                          <tr key={item.id}>
                            {currentSection.columns.map(col => (
                              <td key={col}>
                                {col === 'sexo' ? (item[col] == 0 ? 'Macho' : 'Hembra') :
                                  (col === 'favorito' || col === 'completada' || col === 'recordatorio' || col === 'recibir_emails') ?
                                    <Badge bg={item[col] == 1 ? 'success' : 'secondary'}>{item[col] == 1 ? 'Sí' : 'No'}</Badge> :
                                    item[col]}
                              </td>
                            ))}
                            <td className="text-end">
                              <Button size="sm" variant="outline-info" className="me-2" onClick={() => handleViewDetail(item)}><Eye size={14} /></Button>
                              <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEdit(item)}><Edit2 size={14} /></Button>
                              <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Modal CRUD */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton className="card-header-gradient">
            <Modal.Title>{modalMode === 'create' ? 'Crear' : 'Editar'} {currentSection.title}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSave}>
            <Modal.Body>
              <Row>
                {currentSection.fields.map(field => (
                  <Col md={field.type === 'textarea' ? 12 : 6} key={field.name} className="mb-3">
                    <Form.Group>
                      <Form.Label>{field.label} {field.required && <span className="text-danger">*</span>}</Form.Label>
                      {renderField(field)}
                    </Form.Group>
                  </Col>
                ))}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}><X size={16} /> Cancelar</Button>
              <Button type="submit" style={{ backgroundColor: '#4E3F7F', border: 'none' }}><Save size={16} /> Guardar</Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Modal Detalle */}
        <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
          <Modal.Header closeButton className="card-header-gradient">
            <Modal.Title>Detalle de {currentSection.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {renderDetailContent()}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Cerrar</Button>
            {detailItem && (
              <Button variant="primary" onClick={() => { setShowDetailModal(false); handleEdit(detailItem); }} style={{ backgroundColor: '#4E3F7F', border: 'none' }}>
                <Edit2 size={16} /> Editar
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Dashboard;