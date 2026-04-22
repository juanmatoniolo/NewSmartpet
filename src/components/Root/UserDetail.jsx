import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Row, Col, Card, Nav, Table, Button, Modal, Form,
  Badge, Alert, Navbar, NavDropdown, Image
} from 'react-bootstrap';
import {
  Users, Dog, Tag, Phone, Calendar, MapPin, Stethoscope,
  FileText, Plus, Edit2, Trash2, Save, X, LogOut, Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardStats from './Dashboardstats';

const API_URL = 'http://localhost/api-smartpet/index.php';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentItem, setCurrentItem] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userName, setUserName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');

  // Obtener datos del usuario logueado
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(`${user.nombre} ${user.apellido || ''}`.trim());
        setUserPhoto(user.foto_perfil || '');
      } catch (e) { }
    }
  }, []);

  // Configuración de cada sección (igual que antes)
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
      columns: ['id', 'nombre', 'apellido', 'email', 'fecha_nacimiento']
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
        { name: 'mensajeRescate', label: 'Mensaje Rescate', type: 'textarea' }
      ],
      columns: ['id', 'nombre', 'fecha_nacimiento', 'sexo', 'id_usuario']
    },
    codigos: {
      title: 'Códigos QR/NFC',
      icon: Tag,
      endpoint: 'codigos',
      fields: [
        { name: 'codigo_unico', label: 'Código Único', type: 'text', required: true, pattern: '[A-Z]{4}[0-9]{4}' }
      ],
      columns: ['id', 'codigo_unico']
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
        { name: 'direccion', label: 'Dirección', type: 'text' },
        { name: 'notas', label: 'Notas', type: 'textarea' },
        { name: 'favorito', label: 'Favorito', type: 'checkbox' }
      ],
      columns: ['id', 'nombre', 'tipo', 'celular', 'favorito']
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
      columns: ['id', 'titulo', 'tipo_evento', 'fecha_evento', 'completada']
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
      columns: ['id', 'nombre', 'clinica', 'telefono', 'email']
    },
    ubicaciones: {
      title: 'Ubicaciones',
      icon: MapPin,
      endpoint: 'ubicaciones',
      fields: [
        { name: 'id_mascota', label: 'ID Mascota', type: 'number', required: true },
        { name: 'ubicacion', label: 'Coordenadas', type: 'text', required: true }
      ],
      columns: ['id', 'id_mascota', 'ubicacion', 'fecha_hora']
    }
  };

  const currentSection = sections[activeTab];

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(API_URL, { action: `get${currentSection.endpoint}` });
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError('Error al cargar datos: ' + err.message);
    }
    setLoading(false);
  };

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

      if (modalMode === 'edit') {
        data.id = currentItem.id;
      }

      await axios.post(API_URL, { action, ...data });
      setSuccess(`Registro ${modalMode === 'create' ? 'creado' : 'actualizado'} correctamente`);
      setShowModal(false);
      loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/Login');
  };

  const renderField = (field) => {
    if (modalMode === 'edit' && field.hideOnEdit) return null;
    const value = currentItem[field.name] || '';
    switch (field.type) {
      case 'textarea':
        return <Form.Control as="textarea" rows={3} name={field.name} defaultValue={value} required={field.required} />;
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
        return <Form.Control type={field.type} name={field.name} defaultValue={value} required={field.required} pattern={field.pattern} />;
    }
  };

  return (
    <>
      {/* Navbar superior con logout */}
      <Navbar bg="white" expand="lg" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', padding: '0.75rem 1rem' }}>
        <Container fluid>
          <Navbar.Brand style={{ color: '#4E3F7F', fontWeight: 'bold', fontSize: '1.5rem' }}>
            <FileText size={28} className="me-2" style={{ color: '#4E3F7F' }} />
            SmartPet Admin
          </Navbar.Brand>
          <Navbar.Toggle aria-label="Menú">
            <Menu size={24} />
          </Navbar.Toggle>
          <Navbar.Collapse className="justify-content-end">
            <Nav className="align-items-center">
              <NavDropdown
                title={
                  <span className="d-inline-flex align-items-center">
                    {userPhoto ? (
                      <Image src={userPhoto} roundedCircle width="32" height="32" className="me-2" />
                    ) : (
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        backgroundColor: '#F7C3DC', display: 'inline-flex',
                        alignItems: 'center', justifyContent: 'center', marginRight: '8px'
                      }}>
                        <span style={{ color: '#4E3F7F', fontWeight: 'bold' }}>
                          {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </span>
                      </div>
                    )}
                    <span style={{ color: '#4E3F7F', fontWeight: '500' }}>{userName || 'Usuario'}</span>
                  </span>
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item onClick={handleLogout}>
                  <LogOut size={16} className="me-2" /> Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* DashboardStats (estadísticas) */}
      <DashboardStats />

      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '20px' }}>
        <Container fluid>
          {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}
          {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}

          <Row>
            {/* Menú lateral - en móviles se colapsa debajo de la navbar gracias a las clases de Bootstrap */}
            <Col md={3} lg={2} className="mb-3">
              <Nav className="flex-column" style={{ position: 'sticky', top: '20px' }}>
                {Object.entries(sections).map(([key, section]) => {
                  const Icon = section.icon;
                  return (
                    <Nav.Link
                      key={key}
                      active={activeTab === key}
                      onClick={() => setActiveTab(key)}
                      style={{
                        backgroundColor: activeTab === key ? '#4E3F7F' : 'white',
                        color: activeTab === key ? 'white' : '#4E3F7F',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontWeight: '600',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      <Icon size={18} className="me-2" />
                      {section.title}
                    </Nav.Link>
                  );
                })}
              </Nav>
            </Col>

            {/* Contenido principal - ocupa todo el ancho en móviles */}
            <Col md={9} lg={10}>
              <Card style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <Card.Header style={{
                  background: 'linear-gradient(135deg, #4E3F7F 0%, #6C5C94 100%)',
                  color: 'white',
                  borderRadius: '12px 12px 0 0',
                  padding: '20px'
                }}>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <h4 className="mb-0">
                      {React.createElement(currentSection.icon, { size: 24, className: 'me-2' })}
                      {currentSection.title}
                    </h4>
                    <Button
                      onClick={handleCreate}
                      style={{
                        backgroundColor: '#F7C3DC',
                        border: 'none',
                        color: '#4E3F7F',
                        fontWeight: 'bold',
                        borderRadius: '20px',
                        padding: '8px 20px'
                      }}
                    >
                      <Plus size={18} className="me-1" />
                      Crear Nuevo
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body>
                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
                    </div>
                  ) : data.length === 0 ? (
                    <div className="text-center py-5 text-muted">No hay registros disponibles</div>
                  ) : (
                    <div className="table-responsive">
                      <Table responsive hover>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                          <tr>
                            {currentSection.columns.map(col => <th key={col} style={{ textTransform: 'capitalize' }}>{col}</th>)}
                            <th className="text-end">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map(item => (
                            <tr key={item.id}>
                              {currentSection.columns.map(col => (
                                <td key={col}>
                                  {col === 'sexo' ? (item[col] == 0 ? 'Macho' : 'Hembra') :
                                    (col === 'favorito' || col === 'completada' || col === 'recordatorio') ? (
                                      <Badge bg={item[col] == 1 ? 'success' : 'secondary'}>{item[col] == 1 ? 'Sí' : 'No'}</Badge>
                                    ) : item[col]}
                                </td>
                              ))}
                              <td className="text-end">
                                <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleEdit(item)}>
                                  <Edit2 size={14} />
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(item.id)}>
                                  <Trash2 size={14} />
                                </Button>
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

          {/* Modal CRUD (sin cambios) */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton style={{ background: 'linear-gradient(135deg, #4E3F7F 0%, #6C5C94 100%)', color: 'white' }}>
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
                <Button variant="secondary" onClick={() => setShowModal(false)}><X size={16} className="me-1" /> Cancelar</Button>
                <Button type="submit" style={{ backgroundColor: '#4E3F7F', border: 'none' }}><Save size={16} className="me-1" /> Guardar</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </Container>
      </div>
    </>
  );
};

export default Dashboard;