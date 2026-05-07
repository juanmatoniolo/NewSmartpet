import React from "react";
import { Modal, Badge } from "react-bootstrap";
import { Link as LinkIcon, X, Edit2 } from "lucide-react";
import { withCacheBust, getFallbackImage, formatPrice } from "../helpers";
import { getImageSrc, getImageAlt } from "../imageUtils";
import { BOOL_COLS } from "../helpers";

export default function DetailModal({ show, onHide, detailItem, sec, fkCatalog, refreshKey, onImageClick, onEdit }) {
    const resolveDetailValue = (field, value) => {
        if (field.type === "fk_select") {
            const opts = fkCatalog[field.fkEndpoint] || [];
            const found = opts.find((o) => String(o[field.fkValue]) === String(value));
            return found ? (
                <span className="db-fk-chip">
                    <LinkIcon size={11} />
                    {field.fkLabel(found)}
                </span>
            ) : (value ?? "—");
        }
        if (field.type === "checkbox") {
            return <Badge bg={value == 1 ? "success" : "secondary"}>{value == 1 ? "Sí" : "No"}</Badge>;
        }
        if (field.name === "sexo") return value == 0 ? "Macho" : "Hembra";
        if (field.name === "precio") return formatPrice(value);
        return value ?? "—";
    };

    if (!detailItem) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" enforceFocus={false} restoreFocus={false} centered scrollable>
            <Modal.Header closeButton>
                <Modal.Title>Detalle · {sec.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="db-detail-grid">
                    {["usuarios", "mascotas", "socios", "productos"].includes(sec.endpoint) && (
                        <div className="db-detail-row">
                            <span className="db-detail-label">Imagen</span>
                            <span className="db-detail-val">
                                <img
                                    src={withCacheBust(getImageSrc(sec.endpoint, detailItem), refreshKey)}
                                    alt={getImageAlt(sec.endpoint, detailItem)}
                                    style={{ width: 80, height: 80, borderRadius: sec.endpoint === "socios" || sec.endpoint === "productos" ? 16 : "50%", objectFit: "cover", cursor: "pointer" }}
                                    onClick={() => onImageClick(getImageSrc(sec.endpoint, detailItem), getImageAlt(sec.endpoint, detailItem))}
                                    onError={(e) => { e.currentTarget.src = getFallbackImage(sec.endpoint); }}
                                />
                            </span>
                        </div>
                    )}
                    {sec.fields.map((field) => (
                        <div key={field.name} className="db-detail-row">
                            <span className="db-detail-label">{field.label}</span>
                            <span className="db-detail-val">{resolveDetailValue(field, detailItem[field.name])}</span>
                        </div>
                    ))}
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className="db-btn db-btn--ghost" onClick={onHide}><X size={15} /> Cerrar</button>
                {onEdit && <button className="db-btn db-btn--primary" onClick={onEdit}><Edit2 size={15} /> Editar</button>}
            </Modal.Footer>
        </Modal>
    );
}