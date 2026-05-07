import React from "react";

export default function FkSelectField({ field, value, fkCatalog, disabled }) {
    const options = fkCatalog[field.fkEndpoint] || [];
    return (
        <div className={`db-fk-wrap ${disabled ? "db-fk-wrap--locked" : ""}`}>
            <select
                name={field.name}
                defaultValue={value ?? ""}
                required={!disabled && field.required}
                disabled={disabled}
                className="db-fk-select form-select"
            >
                <option value="">Seleccionar…</option>
                {options.map((opt) => (
                    <option key={opt[field.fkValue]} value={opt[field.fkValue]}>
                        {field.fkLabel(opt)}
                    </option>
                ))}
            </select>
            {disabled && <input type="hidden" name={field.name} value={value ?? ""} />}
        </div>
    );
}