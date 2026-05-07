import React from "react";
import { withCacheBust, getFallbackImage } from "./helpers";
import { getImageSrc, getImageAlt } from "./imageUtils";

export default function ImageCell({ section, item, onImageClick, refreshKey }) {
    if (!["usuarios", "mascotas", "socios", "productos"].includes(section))
        return <span>—</span>;

    const src = getImageSrc(section, item);
    const imageUrl = withCacheBust(src, refreshKey);
    const alt = getImageAlt(section, item);

    return (
        <button
            type="button"
            className="border-0 p-0 bg-transparent"
            onClick={(e) => {
                e.stopPropagation();
                onImageClick(imageUrl, alt);
            }}
            title="Ver imagen"
        >
            <img
                src={imageUrl}
                alt={alt}
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: section === "socios" || section === "productos" ? 14 : "50%",
                    objectFit: "cover",
                    border: "1px solid #e5d9f2",
                    background: "#f8f5fc",
                }}
                onError={(e) => {
                    e.currentTarget.src = getFallbackImage(section);
                }}
            />
        </button>
    );
}