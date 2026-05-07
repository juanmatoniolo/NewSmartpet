import React from "react";
import { Modal } from "react-bootstrap";
import { X, MapPin } from "lucide-react";

export default function MapModal({ show, onHide, coordinates }) {
    if (!coordinates?.lat || !coordinates?.lng) return null;

    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.01},${coordinates.lat - 0.01},${coordinates.lng + 0.01},${coordinates.lat + 0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`;

    return (
        <Modal
            show={show}
            onHide={onHide}
            enforceFocus={false}
            restoreFocus={false}
            size="lg"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Ubicación registrada</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ padding: 0 }}>
                <iframe
                    title="mapa"
                    width="100%"
                    height="400"
                    frameBorder="0"
                    style={{ border: 0, display: "block" }}
                    src={mapUrl}
                />
            </Modal.Body>
            <Modal.Footer>
                <button className="db-btn db-btn--ghost" onClick={onHide}>
                    <X size={15} /> Cerrar
                </button>
                <a
                    href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="db-btn db-btn--primary"
                >
                    <MapPin size={15} /> Abrir en Google Maps
                </a>
            </Modal.Footer>
        </Modal>
    );
}