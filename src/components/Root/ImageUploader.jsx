import React, { useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import ImageSlot from "./ImageSlot";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 6;

const ImageUploader = ({ slots, onChange, error, onError }) => {
    const inputRef = useRef(null);
    const [dragFrom, setDragFrom] = useState(null);
    const [dragOver, setDragOver] = useState(null);

    const handleFiles = (files) => {
        const valid = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                onError("Formato inválido. Usá JPG, PNG o WEBP.");
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                onError(`La imagen no puede superar los ${MAX_SIZE_MB}MB.`);
                return;
            }
            valid.push({ file, preview: URL.createObjectURL(file), isNew: true });
        }
        const filled = slots.filter(Boolean);
        const merged = [...filled, ...valid].slice(0, 3);
        const padded = [...merged, null, null, null].slice(0, 3);
        onChange(padded);
        onError("");
    };

    const handleInputChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length) handleFiles(files);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length) handleFiles(files);
    };

    const handleRemove = (index) => {
        const next = [...slots];
        const slot = next[index];
        if (slot?.preview?.startsWith("blob:")) URL.revokeObjectURL(slot.preview);
        next[index] = null;
        const compacted = [...next.filter(Boolean), ...next.filter((s) => !s)];
        onChange(compacted);
    };

    const handleDragStart = (index) => setDragFrom(index);
    const handleDragOver = (index) => setDragOver(index);
    const handleDropSlot = (toIndex) => {
        if (dragFrom === null || dragFrom === toIndex) {
            setDragFrom(null);
            setDragOver(null);
            return;
        }
        const next = [...slots];
        [next[dragFrom], next[toIndex]] = [next[toIndex], next[dragFrom]];
        onChange(next);
        setDragFrom(null);
        setDragOver(null);
    };

    const filled = slots.filter(Boolean).length;
    const canAdd = filled < 3;

    return (
        <div className="img-uploader" style={{ marginTop: "12px" }}>
            <div
                style={{
                    border: "1px dashed #cdb5e8",
                    borderRadius: "16px",
                    padding: "16px",
                    background: "#fefbfe",
                    cursor: canAdd ? "pointer" : "default",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => canAdd && inputRef.current?.click()}
            >
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                    {slots.map((slot, i) => (
                        <ImageSlot
                            key={i}
                            slot={slot}
                            index={i}
                            total={filled}
                            onRemove={handleRemove}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDrop={handleDropSlot}
                            isDragging={dragOver === i && dragFrom !== null && dragFrom !== i}
                        />
                    ))}
                </div>
                {canAdd && (
                    <p style={{ fontSize: "12px", color: "#6c5c94", textAlign: "center", marginTop: "12px" }}>
                        {filled === 0
                            ? "Arrastrá hasta 3 imágenes o hacé clic para seleccionar"
                            : `Podés agregar ${3 - filled} imagen${3 - filled > 1 ? "es" : ""} más`}
                    </p>
                )}
            </div>
            {filled > 1 && (
                <p style={{ fontSize: "11px", color: "#8b72b1", marginTop: "8px" }}>
                    <GripVertical size={12} style={{ verticalAlign: "middle" }} /> Arrastrá las imágenes para cambiar el orden. La primera es la portada.
                </p>
            )}
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                style={{ display: "none" }}
                onChange={handleInputChange}
            />
            <small style={{ fontSize: "10px", color: "#9a8abf" }}>
                JPG, PNG o WEBP · Máx. {MAX_SIZE_MB}MB · El backend las guarda en WEBP
            </small>
        </div>
    );
};

export default ImageUploader;