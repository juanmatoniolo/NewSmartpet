import React from "react";
import { Modal, Button } from "react-bootstrap";

const calcularEdad = (fechaNac) => {
    if (!fechaNac) return "Desconocida";
    const hoy = new Date();
    const nac = new Date(fechaNac);
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mesDiff = hoy.getMonth() - nac.getMonth();
    if (mesDiff < 0 || (mesDiff === 0 && hoy.getDate() < nac.getDate())) edad--;
    return `${edad} año(s)`;
};

function MostrarMascota({ show, handleClose, mascota }) {
    if (!mascota) return null;

    const {
        nombre,
        urlImg,
        sexo,
        fecha_nacimiento,
        direccion,
        descripcion,
        persona1,
        persona1tel,
        persona1ig,
        persona2,
        persona2tel,
        persona2ig,
        mensajeRescate,
    } = mascota;

    const sexoTexto = sexo === 1 ? "Hembra" : "Macho";
    const imagen = urlImg || "https://via.placeholder.com/300";

    const handleWhatsapp = (numero, texto) => {
        if (!numero) return;
        const url = `https://wa.me/${numero.replace(/\D/g, '')}?text=${encodeURIComponent(texto || mensajeRescate || "Hola, vi a tu mascota perdida")}`;
        window.open(url, "_blank");
    };

    const handleLlamar = (numero) => {
        if (!numero) return;
        window.open(`tel:${numero}`, "_self");
    };

    const handleInstagram = (usuario) => {
        if (!usuario) return;
        const clean = usuario.replace('@', '');
        window.open(`https://instagram.com/${clean}`, "_blank");
    };

    return (
        <Modal show={show} fullscreen onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalles de {nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="container">
                    <div className="row">
                        <div className="col-md-5 text-center">
                            <img src={imagen} alt={nombre} className="img-fluid rounded shadow" style={{ maxHeight: "300px", objectFit: "cover" }} />
                        </div>
                        <div className="col-md-7">
                            <h2>{nombre}</h2>
                            <p><strong>Sexo:</strong> {sexoTexto}</p>
                            <p><strong>Edad:</strong> {calcularEdad(fecha_nacimiento)}</p>
                            <p><strong>Ubicación habitual:</strong> {direccion || "No especificada"}</p>
                            <p><strong>Descripción:</strong> {descripcion || "Sin descripción"}</p>
                        </div>
                    </div>

                    <hr />
                    <h5>Contactos de emergencia</h5>
                    <div className="row">
                        {persona1 && (
                            <div className="col-md-6 mb-3">
                                <div className="card p-2">
                                    <strong>{persona1}</strong>
                                    <div className="d-flex gap-2 mt-2">
                                        {persona1tel && (
                                            <>
                                                <Button size="sm" variant="success" onClick={() => handleWhatsapp(persona1tel, mensajeRescate)}>WhatsApp</Button>
                                                <Button size="sm" variant="info" onClick={() => handleLlamar(persona1tel)}>Llamar</Button>
                                            </>
                                        )}
                                        {persona1ig && <Button size="sm" variant="secondary" onClick={() => handleInstagram(persona1ig)}>Instagram</Button>}
                                    </div>
                                </div>
                            </div>
                        )}
                        {persona2 && (
                            <div className="col-md-6 mb-3">
                                <div className="card p-2">
                                    <strong>{persona2}</strong>
                                    <div className="d-flex gap-2 mt-2">
                                        {persona2tel && (
                                            <>
                                                <Button size="sm" variant="success" onClick={() => handleWhatsapp(persona2tel, mensajeRescate)}>WhatsApp</Button>
                                                <Button size="sm" variant="info" onClick={() => handleLlamar(persona2tel)}>Llamar</Button>
                                            </>
                                        )}
                                        {persona2ig && <Button size="sm" variant="secondary" onClick={() => handleInstagram(persona2ig)}>Instagram</Button>}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default MostrarMascota;