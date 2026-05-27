import React, { useRef, useState, useEffect, useCallback } from "react";
import { GripVertical, X } from "lucide-react";

// --------------------------------------------------------------
//  ImageEditorModal – recorte, zoom y pan (táctil + ratón)
// --------------------------------------------------------------
function ImageEditorModal({ slot, slotIndex, onApply, onClose }) {
    const canvasRef = useRef(null);
    const wrapRef = useRef(null);
    const imgRef = useRef(null);
    const stateRef = useRef({
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        dragging: false,
        lastX: 0,
        lastY: 0,
        lastDist: 0,
        pinchCenter: { x: 0, y: 0 },
    });
    const [zoom, setZoom] = useState(100);
    const [ratio, setRatio] = useState({ label: "4:3", value: 4 / 3, free: false });
    const [preview, setPreview] = useState(null);

    const RATIOS = [
        { label: "4:3", value: 4 / 3, free: false },
        { label: "1:1", value: 1, free: false },
        { label: "16:9", value: 16 / 9, free: false },
        { label: "Libre", value: null, free: true },
    ];

    const screenToCanvasCoords = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;
        x = Math.min(Math.max(0, x), canvas.width);
        y = Math.min(Math.max(0, y), canvas.height);
        return { x, y };
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imgRef.current) return;
        const ctx = canvas.getContext("2d");
        const { scale, offsetX, offsetY } = stateRef.current;
        const cw = canvas.width, ch = canvas.height;
        ctx.clearRect(0, 0, cw, ch);
        ctx.fillStyle = "#111";
        ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(imgRef.current, offsetX, offsetY, imgRef.current.naturalWidth * scale, imgRef.current.naturalHeight * scale);

        const cr = getCropRect(canvas, ratio);
        ctx.fillStyle = "rgba(0,0,0,0.52)";
        ctx.fillRect(0, 0, cw, cr.y);
        ctx.fillRect(0, cr.y + cr.h, cw, ch - cr.y - cr.h);
        ctx.fillRect(0, cr.y, cr.x, cr.h);
        ctx.fillRect(cr.x + cr.w, cr.y, cw - cr.x - cr.w, cr.h);

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cr.x, cr.y, cr.w, cr.h);

        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 0.5;
        for (let t = 1; t < 3; t++) {
            ctx.beginPath(); ctx.moveTo(cr.x + cr.w * t / 3, cr.y); ctx.lineTo(cr.x + cr.w * t / 3, cr.y + cr.h); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cr.x, cr.y + cr.h * t / 3); ctx.lineTo(cr.x + cr.w, cr.y + cr.h * t / 3); ctx.stroke();
        }

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2.5;
        const hs = 16;
        [[cr.x, cr.y], [cr.x + cr.w, cr.y], [cr.x, cr.y + cr.h], [cr.x + cr.w, cr.y + cr.h]].forEach(([cx, cy]) => {
            const dx = cx === cr.x ? 1 : -1, dy = cy === cr.y ? 1 : -1;
            ctx.beginPath(); ctx.moveTo(cx, cy + dy * hs); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * hs, cy); ctx.stroke();
        });
    }, [ratio]);

    function getCropRect(canvas, ratio) {
        const cw = canvas.width, ch = canvas.height;
        if (ratio.free) return { x: 0, y: 0, w: cw, h: ch };
        const r = ratio.value;
        let w = cw, h = cw / r;
        if (h > ch) { h = ch; w = ch * r; }
        return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
    }

    const fitImage = useCallback((img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cw = canvas.width, ch = canvas.height;
        const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
        stateRef.current.scale = s;
        stateRef.current.offsetX = (cw - img.naturalWidth * s) / 2;
        stateRef.current.offsetY = (ch - img.naturalHeight * s) / 2;
        setZoom(Math.round(s * 100));
        draw();
    }, [draw]);

    useEffect(() => {
        if (!slot?.preview) return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imgRef.current = img;
            fitImage(img);
        };
        img.src = slot.preview;
    }, [slot, fitImage]);

    useEffect(() => { draw(); }, [ratio, draw]);

    // Mouse events
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const onMouseDown = (e) => {
            e.preventDefault();
            stateRef.current.dragging = true;
            const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
            stateRef.current.lastX = canvasCoords.x;
            stateRef.current.lastY = canvasCoords.y;
        };
        const onMouseMove = (e) => {
            if (!stateRef.current.dragging) return;
            const canvasCoords = screenToCanvasCoords(e.clientX, e.clientY);
            const dx = canvasCoords.x - stateRef.current.lastX;
            const dy = canvasCoords.y - stateRef.current.lastY;
            stateRef.current.offsetX += dx;
            stateRef.current.offsetY += dy;
            stateRef.current.lastX = canvasCoords.x;
            stateRef.current.lastY = canvasCoords.y;
            draw();
        };
        const onMouseUp = () => { stateRef.current.dragging = false; };
        wrap.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        return () => {
            wrap.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
        };
    }, [screenToCanvasCoords, draw]);

    // Touch events
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        const onTouchStart = (e) => {
            e.preventDefault();
            const touches = e.touches;
            if (touches.length === 1) {
                stateRef.current.dragging = true;
                const canvasCoords = screenToCanvasCoords(touches[0].clientX, touches[0].clientY);
                stateRef.current.lastX = canvasCoords.x;
                stateRef.current.lastY = canvasCoords.y;
            } else if (touches.length === 2) {
                stateRef.current.dragging = false;
                const dx = touches[0].clientX - touches[1].clientX;
                const dy = touches[0].clientY - touches[1].clientY;
                stateRef.current.lastDist = Math.hypot(dx, dy);
                const midX = (touches[0].clientX + touches[1].clientX) / 2;
                const midY = (touches[0].clientY + touches[1].clientY) / 2;
                stateRef.current.pinchCenter = screenToCanvasCoords(midX, midY);
            }
        };
        const onTouchMove = (e) => {
            e.preventDefault();
            const touches = e.touches;
            const s = stateRef.current;
            if (touches.length === 1 && s.dragging) {
                const canvasCoords = screenToCanvasCoords(touches[0].clientX, touches[0].clientY);
                const dx = canvasCoords.x - s.lastX;
                const dy = canvasCoords.y - s.lastY;
                s.offsetX += dx;
                s.offsetY += dy;
                s.lastX = canvasCoords.x;
                s.lastY = canvasCoords.y;
                draw();
            } else if (touches.length === 2) {
                const dx = touches[0].clientX - touches[1].clientX;
                const dy = touches[0].clientY - touches[1].clientY;
                const dist = Math.hypot(dx, dy);
                const factor = dist / s.lastDist;
                let newScale = s.scale * factor;
                newScale = Math.min(8, Math.max(0.2, newScale));
                if (newScale !== s.scale) {
                    const center = s.pinchCenter;
                    if (center) {
                        const factorInv = newScale / s.scale;
                        s.offsetX = center.x + (s.offsetX - center.x) * factorInv;
                        s.offsetY = center.y + (s.offsetY - center.y) * factorInv;
                    }
                    s.scale = newScale;
                    setZoom(Math.round(newScale * 100));
                    draw();
                }
                s.lastDist = dist;
                const midX = (touches[0].clientX + touches[1].clientX) / 2;
                const midY = (touches[0].clientY + touches[1].clientY) / 2;
                s.pinchCenter = screenToCanvasCoords(midX, midY);
            }
        };
        const onTouchEnd = (e) => {
            if (e.touches.length === 0) {
                stateRef.current.dragging = false;
            } else if (e.touches.length === 1) {
                const canvasCoords = screenToCanvasCoords(e.touches[0].clientX, e.touches[0].clientY);
                stateRef.current.lastX = canvasCoords.x;
                stateRef.current.lastY = canvasCoords.y;
                stateRef.current.dragging = true;
            }
        };
        wrap.addEventListener("touchstart", onTouchStart, { passive: false });
        wrap.addEventListener("touchmove", onTouchMove, { passive: false });
        wrap.addEventListener("touchend", onTouchEnd);
        return () => {
            wrap.removeEventListener("touchstart", onTouchStart);
            wrap.removeEventListener("touchmove", onTouchMove);
            wrap.removeEventListener("touchend", onTouchEnd);
        };
    }, [screenToCanvasCoords, draw]);

    const handleZoom = (e) => {
        const canvas = canvasRef.current;
        const cw = canvas.width, ch = canvas.height;
        const newScale = e.target.value / 100;
        const factor = newScale / stateRef.current.scale;
        stateRef.current.offsetX = cw / 2 + (stateRef.current.offsetX - cw / 2) * factor;
        stateRef.current.offsetY = ch / 2 + (stateRef.current.offsetY - ch / 2) * factor;
        stateRef.current.scale = newScale;
        setZoom(Math.round(e.target.value));
        draw();
    };

    const handleApply = () => {
        const canvas = canvasRef.current;
        const cr = getCropRect(canvas, ratio);
        const out = document.createElement("canvas");
        out.width = Math.round(cr.w);
        out.height = Math.round(cr.h);
        out.getContext("2d").drawImage(canvas, cr.x, cr.y, cr.w, cr.h, 0, 0, cr.w, cr.h);
        out.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            setPreview(url);
            onApply(slotIndex, blob, url);
        }, "image/jpeg", 0.92);
    };

    return (
        <div className="img-editor-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="img-editor-inner">
                <div className="img-editor-header">
                    <span>✂️ Editar — {slotIndex === 0 ? "Portada" : `Imagen ${slotIndex + 1}`}</span>
                    <button type="button" className="img-editor-close" onClick={onClose}><X size={20} /></button>
                </div>
                <div className="img-editor-canvas-wrap" ref={wrapRef} style={{ cursor: "grab", touchAction: "none" }}>
                    <canvas ref={canvasRef} width={560} height={420} className="img-editor-canvas" />
                </div>
                <div className="img-editor-controls">
                    <div className="img-editor-ratios">
                        {RATIOS.map((r) => (
                            <button key={r.label} type="button" className={`img-editor-ratio-btn ${ratio.label === r.label ? "active" : ""}`} onClick={() => setRatio(r)}>
                                {r.label}
                            </button>
                        ))}
                    </div>
                    <div className="img-editor-zoom-row">
                        <span>🔍 Zoom</span>
                        <input type="range" min="50" max="500" step="1" value={zoom} onChange={handleZoom} />
                        <span className="img-editor-zoom-val">{zoom}%</span>
                    </div>
                    {preview && (
                        <div className="img-editor-preview-row">
                            <img src={preview} alt="Preview recorte" className="img-editor-preview-thumb" />
                            <span className="img-editor-preview-label">✓ Recorte aplicado</span>
                        </div>
                    )}
                    <div className="img-editor-actions">
                        <button type="button" className="img-editor-btn cancel" onClick={onClose}>Cancelar</button>
                        <button type="button" className="img-editor-btn apply" onClick={handleApply}>Aplicar recorte</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --------------------------------------------------------------
//  ImageSlot – cada cuadro con imagen, botones y arrastre personalizado
// --------------------------------------------------------------
function ImageSlot({ slot, index, total, onRemove, onEdit, onDragStart, onDragOver, onDrop, isDragging, dragHandleProps }) {
    return (
        <div
            className={`img-slot ${isDragging ? "img-slot--dragging" : ""}`}
            {...dragHandleProps}
            onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
            onDrop={(e) => { e.preventDefault(); onDrop(index); }}
        >
            {index === 0 && <span className="img-slot-badge">📷 Portada</span>}
            {slot ? (
                <>
                    <img src={slot.preview} alt={`Imagen ${index + 1}`} className="img-slot-preview" />
                    <div className="img-slot-actions">
                        <button type="button" className="img-slot-action-btn edit" onClick={() => onEdit(index)} aria-label="Editar">✂️</button>
                        <button type="button" className="img-slot-action-btn remove" onClick={() => onRemove(index)} aria-label="Eliminar"><X size={14} /></button>
                    </div>
                    {total > 1 && (
                        <div className="img-slot-grip" {...dragHandleProps}>
                            <GripVertical size={16} />
                        </div>
                    )}
                    <span className="img-slot-num">{index + 1}</span>
                </>
            ) : (
                <div className="img-slot-empty">
                    <span className="img-slot-empty-icon">+</span>
                    <span>Imagen {index + 1}</span>
                </div>
            )}
        </div>
    );
}

// --------------------------------------------------------------
//  ImageUploader principal (con arrastre personalizado corregido)
// --------------------------------------------------------------
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 6;

export default function ImageUploader({ slots, onChange, onError }) {
    const inputRef = useRef(null);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [editorSlot, setEditorSlot] = useState(null);
    const dragStartPoint = useRef({ x: 0, y: 0 });

    const handleFiles = (files) => {
        const valid = [];
        for (const file of files) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                onError("❌ Formato inválido. Usá JPG, PNG o WEBP.");
                return;
            }
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                onError(`❌ Máximo ${MAX_SIZE_MB}MB por imagen.`);
                return;
            }
            valid.push({ file, preview: URL.createObjectURL(file), isNew: true });
        }
        const filled = slots.filter(Boolean);
        const merged = [...filled, ...valid].slice(0, 3);
        onChange([...merged, null, null, null].slice(0, 3));
        onError("");
    };

    const handleRemove = (index) => {
        const next = [...slots];
        if (next[index]?.preview?.startsWith("blob:")) URL.revokeObjectURL(next[index].preview);
        next[index] = null;
        onChange([...next.filter(Boolean), null, null, null].slice(0, 3));
    };

    const handleEdit = (index) => {
        setEditorSlot({ index, slot: slots[index] });
    };

    const handleEditorApply = (index, blob, url) => {
        const next = [...slots];
        if (next[index]?.preview?.startsWith("blob:")) URL.revokeObjectURL(next[index].preview);
        next[index] = {
            ...next[index],
            file: new File([blob], "imagen_recortada.jpg", { type: "image/jpeg" }),
            preview: url,
            isNew: true,
        };
        onChange(next);
    };

    // Arrastre personalizado CORREGIDO (sin elementFromPoint con NaN)
    const startDrag = (e, index) => {
        if (!slots[index]) return;
        e.preventDefault();
        setDragIndex(index);
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        dragStartPoint.current = { x: clientX, y: clientY };
    };

    const onDragMove = useCallback((e) => {
        if (dragIndex === null) return;
        e.preventDefault();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0]?.clientX;
            clientY = e.touches[0]?.clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        // Validar que las coordenadas sean números finitos
        if (typeof clientX !== 'number' || !isFinite(clientX) || typeof clientY !== 'number' || !isFinite(clientY)) {
            return;
        }
        const targetEl = document.elementFromPoint(clientX, clientY);
        const slotEl = targetEl?.closest('.img-slot');
        if (slotEl) {
            const slotsElements = Array.from(document.querySelectorAll('.img-slot'));
            const newIndex = slotsElements.indexOf(slotEl);
            if (newIndex !== -1 && newIndex !== dragIndex) {
                setDragOverIndex(newIndex);
            }
        }
    }, [dragIndex]);

    const endDrag = useCallback(() => {
        if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
            const next = [...slots];
            [next[dragIndex], next[dragOverIndex]] = [next[dragOverIndex], next[dragIndex]];
            onChange(next);
        }
        setDragIndex(null);
        setDragOverIndex(null);
    }, [dragIndex, dragOverIndex, slots, onChange]);

    useEffect(() => {
        if (dragIndex !== null) {
            window.addEventListener('mousemove', onDragMove);
            window.addEventListener('mouseup', endDrag);
            window.addEventListener('touchmove', onDragMove, { passive: false });
            window.addEventListener('touchend', endDrag);
            return () => {
                window.removeEventListener('mousemove', onDragMove);
                window.removeEventListener('mouseup', endDrag);
                window.removeEventListener('touchmove', onDragMove);
                window.removeEventListener('touchend', endDrag);
            };
        }
    }, [dragIndex, onDragMove, endDrag]);

    const dragHandleProps = (index) => ({
        onMouseDown: (e) => startDrag(e, index),
        onTouchStart: (e) => startDrag(e, index),
        style: { cursor: 'grab' },
    });

    const filled = slots.filter(Boolean).length;

    return (
        <>
            <div className="img-uploader">
                <div
                    className={`img-dropzone ${filled < 3 ? "img-dropzone--active" : ""}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFiles(Array.from(e.dataTransfer.files)); }}
                    onClick={() => filled < 3 && inputRef.current?.click()}
                >
                    <div className="img-slots-grid">
                        {slots.map((slot, i) => (
                            <ImageSlot
                                key={i}
                                slot={slot}
                                index={i}
                                total={filled}
                                onRemove={handleRemove}
                                onEdit={handleEdit}
                                onDragStart={() => { }}
                                onDragOver={(idx) => setDragOverIndex(idx)}
                                onDrop={(idx) => {
                                    if (dragIndex !== null && dragIndex !== idx) {
                                        const next = [...slots];
                                        [next[dragIndex], next[idx]] = [next[idx], next[dragIndex]];
                                        onChange(next);
                                    }
                                    setDragIndex(null);
                                    setDragOverIndex(null);
                                }}
                                isDragging={dragOverIndex === i && dragIndex !== null && dragIndex !== i}
                                dragHandleProps={slot ? dragHandleProps(i) : {}}
                            />
                        ))}
                    </div>
                    {filled < 3 && (
                        <p className="img-dropzone-hint">
                            {filled === 0
                                ? "📸 Arrastrá hasta 3 imágenes o tocá para seleccionar"
                                : `➕ Podés agregar ${3 - filled} imagen${3 - filled > 1 ? "es" : ""} más`}
                        </p>
                    )}
                </div>
                {filled > 1 && (
                    <p className="img-order-hint">
                        <GripVertical size={14} style={{ verticalAlign: "middle" }} /> Arrastrá los cuadros para cambiar el orden. La primera es la portada.
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: "none" }}
                    onChange={(e) => { handleFiles(Array.from(e.target.files || [])); e.target.value = ""; }}
                />
                <small className="img-hint-small">📏 JPG, PNG o WEBP · Máx. {MAX_SIZE_MB}MB · El backend las guarda optimizadas</small>
            </div>

            {editorSlot && (
                <ImageEditorModal
                    slot={editorSlot.slot}
                    slotIndex={editorSlot.index}
                    onApply={handleEditorApply}
                    onClose={() => setEditorSlot(null)}
                />
            )}
        </>
    );
}