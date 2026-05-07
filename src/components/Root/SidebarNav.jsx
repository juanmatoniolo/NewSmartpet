// src/components/Root/SidebarNav.jsx
import React from "react";
import { ChevronRight } from "lucide-react";
import { SECTIONS } from "./sections";

export default function SidebarNav({ activeTab, onSelectTab }) {
    return (
        <nav className="db-sidebar-nav">
            {Object.entries(SECTIONS).map(([key, section]) => {
                const Icon = section.icon;
                return (
                    <button
                        key={key}
                        type="button"
                        className={`db-sidebar-item ${activeTab === key ? "active" : ""}`}
                        onClick={() => onSelectTab(key)}
                    >
                        <Icon size={18} />
                        <span>{section.title}</span>
                        <ChevronRight size={14} className="db-sidebar-arrow" />
                    </button>
                );
            })}
        </nav>
    );
}