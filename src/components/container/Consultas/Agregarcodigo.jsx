import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Modal } from "react-bootstrap";
import { FaInfoCircle, FaSpinner } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';

const Agregarcodigo = ({ id }) => {
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [codigosUnicos, setCodigosUnicos] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);

  const urlMascotas = `https://smartpet-1d59e-default-rtdb.firebaseio.com/smartpet/mascotas.json`;
  const urlUsuario = `https://smartpet-1d59e-default-rtdb.firebaseio.com/usuario/${id}.json`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resM = await axios.get(urlMascotas);
        const dataM = resM.data || {};
        const codigosM = new Set();
        Object.values(dataM).forEach((m) => {
          if (m?.codAct) codigosM.add(m.codAct);
        });

        const resU = await axios.get(urlUsuario);
        const dataU = resU.data || {};
        const codigosU = new Set();
        Object.values(dataU).forEach((u) => {
          if (u?.codAct) codigosU.add(u.codAct);
        });

        const filtrados = Array.from(codigosM).filter((c) => !codigosU.has(c));
        setCodigosUnicos(new Set(filtrados));
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    // Forzar foco en el input al montar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const validarFormato = (valor) => /^[\w@#&]{4}[0-9]{4}$/.test(valor);

  const handleChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setCodigo(valor);
    if (mensaje) setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormato(codigo)) {
      setMensaje("Formato inválido: 4 letras + 4 números (ej: ABCD1234)");
      return;
    }
    if (!codigosUnicos.has(codigo)) {
      setMensaje("Código no válido o ya fue utilizado");
      return;
    }
    setCargando(true);
    try {
      const instance = axios.create({
        baseURL: "https://smartpet-1d59e-default-rtdb.firebaseio.com",
        timeout: 5000,
        headers: { "Content-Type": "application/json" },
      });
      await instance.post(urlUsuario, { codAct: codigo });
      setMensaje("✅ Código agregado correctamente");
      setCodigo("");
      if (inputRef.current) inputRef.current.focus();
    } catch (error) {
      setMensaje("❌ Error al agregar código. Intentá de nuevo");
    } finally {
      setCargando(false);
    }
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(145deg, #f8f9fc 0%, #eef2f7 100%)",
      padding: "2rem",
    },
    card: {
      maxWidth: 550,
      width: "100%",
      background: "rgba(255, 255, 255, 0.96)",
      borderRadius: "2rem",
      boxShadow: "0 20px 35px -12px rgba(0,0,0,0.2)",
      padding: "2rem 1.8rem",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: 700,
      background: "linear-gradient(135deg, #6C5C94, #9b89b5)",
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      marginBottom: "1.5rem",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
    },
    inputGroup: {
      display: "flex",
      alignItems: "center",
      gap: "0.8rem",
    },
    input: {
      flex: 1,
      padding: "0.9rem 1rem",
      fontSize: "1rem",
      border: "2px solid #e2e8f0",
      borderRadius: "1.2rem",
      background: "#fff",
      fontFamily: "monospace",
      letterSpacing: "1px",
      textTransform: "uppercase",
      outline: "none",
      transition: "all 0.2s",
    },
    infoButton: {
      background: "transparent",
      border: "none",
      color: "#6C5C94",
      fontSize: "1.4rem",
      cursor: "pointer",
      padding: "0.5rem",
      display: "flex",
      alignItems: "center",
    },
    messageBanner: {
      padding: "0.7rem",
      borderRadius: "1rem",
      textAlign: "center",
      fontWeight: 500,
    },
    submitButton: {
      background: "linear-gradient(105deg, #6C5C94, #574a83)",
      border: "none",
      padding: "0.9rem",
      fontSize: "1rem",
      fontWeight: 600,
      color: "white",
      borderRadius: "1.5rem",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    },
    hint: {
      fontSize: "0.75rem",
      textAlign: "center",
      color: "#718096",
      marginTop: "1rem",
    },
    loadingOverlay: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      padding: "2rem",
      color: "#6C5C94",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {cargando ? (
          <div style={styles.loadingOverlay}>
            <FaSpinner className="spinner-icon" style={{ fontSize: "2.5rem", animation: "spin 1s linear infinite" }} />
            <p>Verificando código...</p>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Agregar código de activación</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <input
                  ref={inputRef}
                  type="text"
                  value={codigo}
                  onChange={handleChange}
                  placeholder="Ej: ABCD1234"
                  style={styles.input}
                  aria-label="Código de activación"
                  autoComplete="off"
                />
                <button
                  type="button"
                  style={styles.infoButton}
                  onClick={() => setShowModal(true)}
                  aria-label="Información"
                >
                  <FaInfoCircle />
                </button>
              </div>
              {mensaje && (
                <div
                  style={{
                    ...styles.messageBanner,
                    background: mensaje.includes("✅") ? "#e6ffed" : "#fff5f5",
                    color: mensaje.includes("✅") ? "#2c7a3e" : "#c53030",
                    borderLeft: `5px solid ${mensaje.includes("✅") ? "#2c7a3e" : "#c53030"}`,
                  }}
                >
                  {mensaje}
                </div>
              )}
              <button
                type="submit"
                style={styles.submitButton}
                disabled={!codigo}
                onMouseEnter={(e) => {
                  if (!e.target.disabled) e.target.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  if (!e.target.disabled) e.target.style.transform = "translateY(0)";
                }}
              >
                Activar código
              </button>
            </form>
            <p style={styles.hint}>
              * El código tiene 4 letras seguidas de 4 números (mayúsculas)
            </p>
          </>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>¿Cómo funciona SmartPet?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Ingresá el <strong>código de activación</strong> que viene con el collar. Es único y vincula tu cuenta con tu mascota.</p>
          <p>Una vez validado, podrás cargar los datos de tu mascota: foto, nombre, edad, sexo, cuidados y contactos de emergencia.</p>
          <p>Al escanear el collar (QR/NFC) con un celular, si tiene permisos de ubicación, se actualizará automáticamente la última ubicación.</p>
          <p>Usá el botón <strong>"Mostrar mascota"</strong> para ver la vista previa del perfil público.</p>
        </Modal.Body>
      </Modal>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Agregarcodigo;