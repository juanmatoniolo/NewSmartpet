import React from "react";
import { X, GripVertical } from "lucide-react";

const ImageSlot = ({ slot, index, total, onRemove, onDragStart, onDragOver, onDrop, isDragging }) => {
    return (
        <div
            className={`img-slot ${isDragging ? "img-slot--dragging" : ""}`}
            draggable={!!slot}
            onDragStart={() => slot && onDragStart(index)}
            onDragOver={(e) => {
                e.preventDefault();
                onDragOver(index);
            }}
            onDrop={() => onDrop(index)}
            style={{
                position: "relative",
                width: "100px",
                height: "100px",
                borderRadius: "12px",
                overflow: "hidden",
                background: "#f3eff9",
                border: "1px dashed #cdb5e8",
                cursor: slot ? "grab" : "default",
            }}
        >
            {index === 0 && slot && (
                <span style={{
                    position: "absolute",
                    top: 4,
                    left: 4,
                    background: "#4e3f7f",
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "20px",
                    zIndex: 2,
                }}>Portada</span>
            )}
            {slot ? (
                <>
                    <img src={slot.preview} alt={`img ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            background: "rgba(0,0,0,0.6)",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            cursor: "pointer",
                        }}
                    >
                        <X size={14} />
                    </button>
                    {total > 1 && (
                        <div style={{
                            position: "absolute",
                            bottom: 4,
                            right: 4,
                            background: "rgba(0,0,0,0.5)",
                            borderRadius: "4px",
                            padding: "2px",
                        }}>
                            <GripVertical size={14} color="white" />
                        </div>
                    )}
                    <span style={{
                        position: "absolute",
                        bottom: 4,
                        left: 4,
                        background: "rgba(0,0,0,0.5)",
                        color: "white",
                        fontSize: "10px",
                        padding: "2px 5px",
                        borderRadius: "10px",
                    }}>{index + 1}</span>
                </>
            ) : (
                <div style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    color: "#9a8abf",
                }}>
                    <span style={{ fontSize: "24px" }}>+</span>
                    <span style={{ fontSize: "10px" }}>Imagen {index + 1}</span>
                </div>
            )}
        </div>
    );
};

export default ImageSlot;