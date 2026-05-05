// src/components/Buy/components/ModalCrearIA.jsx

import React from "react";
import {
    Copy,
    Image as ImageIcon,
    Sparkles,
    X,
} from "lucide-react";
import {
    FALLBACK_IMG,
    formatPrice,
    getChatGPTPromptUrl,
} from "../helpers/buyHelpers";

function ModalCrearIA({
    selectedProducto,
    selectedPrompt,
    copied,
    onClose,
    onCopy,
}) {
    if (!selectedProducto) return null;

    const irAChatGPT = () => {
        window.open(
            getChatGPTPromptUrl(selectedPrompt),
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <div className="buy-modal-overlay" onClick={onClose}>
            <section
                className="buy-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="buy-modal-title"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="buy-modal-header">
                    <div>
                        <span className="buy-modal-kicker">
                            <ImageIcon size={16} />
                            Prompt para generar imágenes
                        </span>

                        <h2 id="buy-modal-title">{selectedProducto.titulo}</h2>

                        <p>
                            Este prompt está preparado para crear 2 imágenes del producto:
                            <strong> frente</strong> y <strong> dorso</strong>.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="buy-modal-close"
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="buy-modal-product">
                    <img
                        src={selectedProducto.imagenes?.[0] || FALLBACK_IMG}
                        alt={selectedProducto.titulo}
                        onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = FALLBACK_IMG;
                        }}
                    />

                    <div>
                        <h3>{selectedProducto.titulo}</h3>

                        <p>
                            {selectedProducto.descripcion ||
                                "Sin descripción disponible."}
                        </p>

                        <strong>{formatPrice(selectedProducto.precio)}</strong>
                    </div>
                </div>

                <div className="buy-modal-body">
                    <textarea
                        readOnly
                        value={selectedPrompt}
                        className="buy-modal-textarea"
                        aria-label="Prompt IA"
                    />
                </div>

                <footer className="buy-modal-footer">
                    <button
                        type="button"
                        className="buy-modal-btn secondary"
                        onClick={onCopy}
                    >
                        <Copy size={17} />
                        {copied ? "Prompt copiado" : "Copiar prompt"}
                    </button>

                    <button
                        type="button"
                        className="buy-modal-btn primary"
                        onClick={irAChatGPT}
                    >
                        <Sparkles size={17} />
                        Ir a crear con ChatGPT
                    </button>
                </footer>
            </section>
        </div>
    );
}

export default ModalCrearIA;