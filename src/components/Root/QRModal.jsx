import React from "react";
import { Modal } from "react-bootstrap";
import { Download, X } from "lucide-react";
import QRCode from "react-qr-code";

export default function QRModal({ show, onHide, value }) {
    const downloadSVG = () => {
        const svgElement = document.querySelector("#qr-svg-to-download");
        if (svgElement) {
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svgElement);
            const blob = new Blob([source], { type: "image/svg+xml" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "qr_codigo.svg";
            link.click();
            URL.revokeObjectURL(link.href);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="sm" centered>
            <Modal.Header closeButton>
                <Modal.Title>Código QR para impresión</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
                <div className="p-3 bg-white d-inline-block rounded shadow-sm mx-auto" style={{ maxWidth: "200px" }}>
                    <div id="qr-svg-to-download">
                        <QRCode value={value} size={180} level="H" />
                    </div>
                </div>
                <p className="mt-3 small text-muted">Escanea con tu celular o imprime en 2x2 cm.</p>
                <p className="small text-break">{value}</p>
            </Modal.Body>
            <Modal.Footer>
                <button className="db-btn db-btn--primary" onClick={downloadSVG}>
                    <Download size={15} /> Descargar SVG
                </button>
                <button className="db-btn db-btn--ghost" onClick={onHide}>
                    <X size={15} /> Cerrar
                </button>
            </Modal.Footer>
        </Modal>
    );
}