import React from "react";
import { Badge } from "react-bootstrap";
import { Link as LinkIcon } from "lucide-react";
import { BOOL_COLS, formatPrice } from "./helpers";
import ImageCell from "./ImageCell";

// Función auxiliar para formatear fecha
const formatFechaHora = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // si no es fecha válida, devolver original
    const horas = date.getHours().toString().padStart(2, "0");
    const minutos = date.getMinutes().toString().padStart(2, "0");
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const anio = date.getFullYear();
    return `${horas}:${minutos} ${dia}-${mes}-${anio}`;
};

export default function CellValue({ col, value, fkData, section, item, onImageClick, refreshKey }) {
    // Formateo especial para fecha_hora en la sección ubicaciones
    if (section === "ubicaciones" && col === "fecha_hora") {
        return <>{formatFechaHora(value)}</>;
    }

    if (col === "foto") return <ImageCell section={section} item={item} onImageClick={onImageClick} refreshKey={refreshKey} />;
    if (col === "sexo") return value == 0 ? "Macho" : "Hembra";
    if (col === "precio") return formatPrice(value);
    if (BOOL_COLS.has(col)) {
        return (
            <Badge bg={value == 1 ? "success" : "secondary"} className="ds-badge">
                {value == 1 ? "Sí" : "No"}
            </Badge>
        );
    }
    if (fkData?.data) {
        const found = fkData.data.find((r) => String(r.id) === String(value));
        if (found) {
            return (
                <span className="db-fk-chip">
                    <LinkIcon size={11} />
                    {fkData.label(found)}
                </span>
            );
        }
    }
    return <>{value ?? "—"}</>;
}