import React from "react";

export default function ImageModal({ show, src, alt, onHide }) {
    if (!show) return null;
    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
                cursor: "pointer",
                padding: 20,
            }}
            onClick={onHide}
            role="presentation"
        >
            <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "90vh" }} onClick={(e) => e.stopPropagation()}>
                <img src={src} alt={alt} style={{ maxWidth: "100%", maxHeight: "90vh", display: "block", borderRadius: 14 }} onError={(e) => { e.currentTarget.src = "/icono.png"; }} />
                <button
                    type="button"
                    onClick={onHide}
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        border: 0,
                        background: "rgba(0,0,0,.65)",
                        color: "#fff",
                        fontSize: 24,
                        lineHeight: "40px",
                    }}
                >×</button>
            </div>
        </div>
    );
}