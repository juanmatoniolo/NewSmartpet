import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import "./MascotaProtegida.css";
import SmartHeader from "./SmartHeaderMascota";

const API_BASE = "http://localhost/api-smartpet/index.php";
const LOCATION_TTL_MS = 60 * 60 * 1000; // 1 hora

function MascotaProtegida() {
  const { id } = useParams();

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "Desconocida";

    const fechaNacimiento = new Date(fechaNac);
    if (Number.isNaN(fechaNacimiento.getTime())) return "Desconocida";

    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const mesDiferencia = hoy.getMonth() - fechaNacimiento.getMonth();

    if (
      mesDiferencia < 0 ||
      (mesDiferencia === 0 && hoy.getDate() < fechaNacimiento.getDate())
    ) {
      edad--;
    }

    if (edad < 1) {
      let meses = mesDiferencia;
      if (meses < 0) meses += 12;
      if (meses <= 0) return "Menos de 1 mes";
      return `${meses} mes(es)`;
    }

    return `${edad} año(s)`;
  };

  const obtenerSexo = (sexo) => {
    if (sexo === 1 || sexo === "1") return { texto: "Hembra", icono: "♀" };
    if (sexo === 0 || sexo === "0") return { texto: "Macho", icono: "♂" };
    return { texto: "No definido", icono: "⚥" };
  };

  const limpiarTelefono = (telefono) => {
    if (!telefono) return "";
    return String(telefono).replace(/[^\d]/g, "");
  };

  const getWhatsappLink = (telefono, mensaje) => {
    const tel = limpiarTelefono(telefono);
    if (!tel) return "#";
    return `https://wa.me/549${tel}?text=${encodeURIComponent(
      mensaje || "Hola, encontré esta mascota."
    )}`;
  };

  const getPhoneLink = (telefono) => {
    const tel = limpiarTelefono(telefono);
    return tel ? `tel:${tel}` : "#";
  };

  const getInstagramLink = (ig) => {
    if (!ig) return "#";
    return `https://instagram.com/${String(ig).replace("@", "").trim()}`;
  };

  const cargarDatosMascota = async () => {
    try {
      setLoading(true);
      setError(null);

      const resMascota = await axios.get(`${API_BASE}/mascotas/${id}`);
      const data = resMascota.data;

      if (!data || !data.id) {
        setError("Mascota no encontrada");
        setMascota(null);
        return;
      }

      setMascota(data);
    } catch (err) {
      console.error("Error al cargar mascota:", err);
      setError("Error de conexión. Intente nuevamente.");
      setMascota(null);
    } finally {
      setLoading(false);
    }
  };

  const enviarUbicacionUnaVezPorHora = async () => {
    const storageKey = `smartpet_geo_sent_${id}`;

    try {
      const guardado = localStorage.getItem(storageKey);

      if (guardado) {
        const parsed = JSON.parse(guardado);
        const lastSentAt = parsed?.timestamp || 0;

        if (Date.now() - lastSentAt < LOCATION_TTL_MS) {
          return;
        }
      }
    } catch (e) {
      console.warn("No se pudo leer cache de geolocalización:", e);
    }

    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitud = position.coords.latitude;
        const longitud = position.coords.longitude;

        try {
          await axios.post(`${API_BASE}/mascotas/${id}/ubicacion`, {
            mascota_id: id,
            latitud,
            longitud,
            origen: "landing"
          });

          localStorage.setItem(
            storageKey,
            JSON.stringify({
              timestamp: Date.now(),
              latitud,
              longitud
            })
          );
        } catch (err) {
          console.error("Error al enviar ubicación:", err);
        }
      },
      (geoError) => {
        console.warn("No se pudo obtener ubicación:", geoError);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: LOCATION_TTL_MS
      }
    );
  };

  useEffect(() => {
    cargarDatosMascota();
  }, [id]);

  useEffect(() => {
    enviarUbicacionUnaVezPorHora();
  }, [id]);

  const sexoInfo = useMemo(() => obtenerSexo(mascota?.sexo), [mascota?.sexo]);
  const edadTexto = useMemo(() => {
    return mascota?.fecha_nacimiento
      ? calcularEdad(mascota.fecha_nacimiento)
      : "Desconocida";
  }, [mascota?.fecha_nacimiento]);

  const imagenSrc =
    mascota?.urlImg && mascota.urlImg.trim() !== ""
      ? mascota.urlImg
      : "/assets/smartpet-default.jpg";

  if (loading) {
    return (
      <>
        <SmartHeader />
        <main className="pet-page">
          <section className="pet-shell">
            <div className="pet-skeleton-card"></div>
          </section>
        </main>
      </>
    );
  }

  if (error || !mascota) {
    return (
      <>
        <SmartHeader />
        <main className="pet-page">
          <section className="pet-shell">
            <div className="pet-error-card">
              <h2>Este usuario no se encuentra en nuestra base de datos</h2>
              <p>{error || "No se encontró la mascota."}</p>
              <Link to="/" className="pet-main-btn">
                Volver al inicio
              </Link>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <SmartHeader />

      <main className="pet-page">
        <section className="pet-shell">
          <section className="pet-card-main">
            <div className="pet-image-wrap">
              <img
                src={imagenSrc}
                alt={`Foto de ${mascota.nombre || "la mascota"}`}
                className="pet-image"
                onError={(e) => {
                  e.target.src = "/assets/smartpet-default.jpg";
                }}
              />
            </div>

            <div className="pet-content">
              <span className="pet-status">🐾 Mascota protegida</span>

              <h1 className="pet-name">
                {mascota.nombre || "Mascota sin nombre"}
              </h1>

              <p className="pet-message">
                Si la encontraste o tenés información, ayudanos a que vuelva con su familia.
              </p>

              <div className="pet-tags">
                <span className="pet-tag">
                  <span className="pet-tag-icon">{sexoInfo.icono}</span>
                  {sexoInfo.texto}
                </span>

                <span className="pet-tag">
                  <span className="pet-tag-icon">🎂</span>
                  {edadTexto}
                </span>

                {mascota.direccion && (
                  <span className="pet-tag pet-tag-soft">
                    <span className="pet-tag-icon">📍</span>
                    Zona: {mascota.direccion}
                  </span>
                )}
              </div>

              <div className="pet-description-card">
                <h2>Sobre {mascota.nombre || "esta mascota"}</h2>
                <p>
                  {mascota.descripcion ||
                    "No hay una descripción adicional disponible por el momento."}
                </p>
              </div>

              <div className="pet-contact-highlight">
                <h3>Contactá a su familia</h3>
                <p>
                  Elegí el medio más rápido para avisar que la encontraste.
                </p>

                <div className="pet-quick-actions">
                  {mascota.persona1tel && (
                    <>
                      <a
                        href={getWhatsappLink(
                          mascota.persona1tel,
                          mascota.mensajeRescate
                        )}
                        className="pet-main-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        WhatsApp
                      </a>

                      <a
                        href={getPhoneLink(mascota.persona1tel)}
                        className="pet-alt-btn"
                      >
                        Llamar
                      </a>
                    </>
                  )}

                  {!mascota.persona1tel && mascota.persona1ig && (
                    <a
                      href={getInstagramLink(mascota.persona1ig)}
                      className="pet-main-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Contactar por Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="pet-contacts-section">
            <div className="pet-section-heading">
              <h2>Personas de contacto</h2>
              <p>Podés comunicarte con cualquiera de estas personas.</p>
            </div>

            <div className="pet-contacts-grid">
              {mascota.persona1 && (
                <article className="pet-contact-card">
                  <div className="pet-contact-header">
                    <div className="pet-contact-avatar">👤</div>
                    <div>
                      <h3>{mascota.persona1}</h3>
                      <p>Contacto principal</p>
                    </div>
                  </div>

                  <div className="pet-contact-actions">
                    {mascota.persona1tel && (
                      <>
                        <a
                          href={getWhatsappLink(
                            mascota.persona1tel,
                            mascota.mensajeRescate
                          )}
                          className="pet-action-btn whatsapp"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={getPhoneLink(mascota.persona1tel)}
                          className="pet-action-btn call"
                        >
                          Llamar
                        </a>
                      </>
                    )}

                    {mascota.persona1ig && (
                      <a
                        href={getInstagramLink(mascota.persona1ig)}
                        className="pet-action-btn instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </article>
              )}

              {mascota.persona2 && (
                <article className="pet-contact-card">
                  <div className="pet-contact-header">
                    <div className="pet-contact-avatar">👤</div>
                    <div>
                      <h3>{mascota.persona2}</h3>
                      <p>Contacto alternativo</p>
                    </div>
                  </div>

                  <div className="pet-contact-actions">
                    {mascota.persona2tel && (
                      <>
                        <a
                          href={getWhatsappLink(
                            mascota.persona2tel,
                            mascota.mensajeRescate
                          )}
                          className="pet-action-btn whatsapp"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={getPhoneLink(mascota.persona2tel)}
                          className="pet-action-btn call"
                        >
                          Llamar
                        </a>
                      </>
                    )}

                    {mascota.persona2ig && (
                      <a
                        href={getInstagramLink(mascota.persona2ig)}
                        className="pet-action-btn instagram"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Instagram
                      </a>
                    )}
                  </div>
                </article>
              )}
            </div>
          </section>
        </section>
      </main>

      <footer className="pet-footer">
        <div className="pet-footer-container">
          <h3>SmartPet</h3>
          <p>Ayudando a que cada mascota vuelva a casa 🐾</p>
        </div>
      </footer>
    </>
  );
}

export default MascotaProtegida;