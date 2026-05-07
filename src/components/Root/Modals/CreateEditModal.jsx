import React from "react";
import { Modal, Form, Alert } from "react-bootstrap";
import { X, Save } from "lucide-react";
import FkSelectField from "../FkSelectField";
import ImageUploader from "../ImageUploader";

export default function CreateEditModal({
    show, onHide, modalMode, currentItem, sec, fkCatalog, uploading,
    profileImageFile, setProfileImageFile, profileImagePreview, setProfileImagePreview,
    petImageFile, setPetImageFile, petImagePreview, setPetImagePreview,
    socioImageFile, setSocioImageFile, socioImagePreview, setSocioImagePreview,
    productoImageSlots, setProductoImageSlots, imgError, setImgError,
    onSave,
}) {
    const renderField = (field) => {
        const locked = modalMode === "edit" && field.readonlyOnEdit === true;
        let val = currentItem[field.name] ?? "";
        if (field.name === "password" && modalMode === "edit") val = "";

        if (sec.endpoint === "mascotas" && field.name === "codigo_unico" && modalMode === "edit") {
            const codigoObj = fkCatalog.codigos?.find((c) => String(c.id) === String(currentItem.codigo_id));
            val = codigoObj?.codigo_unico || currentItem.codigo_unico || "";
            return <Form.Control type="text" name={field.name} value={val} readOnly disabled className="db-field-locked" />;
        }

        if (field.type === "fk_select") {
            return <FkSelectField field={field} value={val} fkCatalog={fkCatalog} disabled={locked} />;
        }
        if (field.type === "textarea") {
            return <Form.Control as="textarea" rows={3} name={field.name} defaultValue={val} required={field.required && modalMode === "create"} placeholder={field.placeholder} readOnly={locked} />;
        }
        if (field.type === "select") {
            return (
                <Form.Select name={field.name} defaultValue={val} required={field.required} disabled={locked}>
                    <option value="">Seleccionar…</option>
                    {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </Form.Select>
            );
        }
        if (field.type === "checkbox") {
            return <Form.Check type="checkbox" name={field.name} defaultChecked={val == 1} disabled={locked} />;
        }
        return <Form.Control type={field.type} name={field.name} defaultValue={val} required={field.required && !(field.name === "password" && modalMode === "edit")} placeholder={field.placeholder} readOnly={locked} />;
    };

    const renderImageUpload = () => {
        if (sec.endpoint === "productos") return null;
        if (!["usuarios", "mascotas", "socios"].includes(sec.endpoint)) return null;

        const config = {
            usuarios: { label: "Foto de perfil", file: profileImageFile, preview: profileImagePreview, current: currentItem.foto_perfil, setFile: setProfileImageFile, setPreview: setProfileImagePreview, fallback: "/default.jpg", shape: "50%" },
            mascotas: { label: "Foto de la mascota", file: petImageFile, preview: petImagePreview, current: currentItem.urlImg, setFile: setPetImageFile, setPreview: setPetImagePreview, fallback: "/a.jpg", shape: "50%" },
            socios: { label: "Logo o foto del local", file: socioImageFile, preview: socioImagePreview, current: currentItem.logo_url, setFile: setSocioImageFile, setPreview: setSocioImagePreview, fallback: "/icono.png", shape: "16px" },
        }[sec.endpoint];

        const previewSrc = config.preview || (config.current ? `/api/${config.current}` : null);
        return (
            <div className="db-form-group full">
                <label className="db-label">{config.label}</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="form-control" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) { config.setFile(null); config.setPreview(null); return; }
                    config.setFile(file);
                    config.setPreview(URL.createObjectURL(file));
                }} />
                <small className="text-muted d-block mt-1">Se guardará en formato WEBP.</small>
                {previewSrc && (
                    <div className="mt-2">
                        <img src={previewSrc} alt="Preview" style={{ width: sec.endpoint === "socios" ? 120 : 80, height: sec.endpoint === "socios" ? 82 : 80, borderRadius: config.shape, objectFit: "cover", border: "1px solid #e5d9f2", background: "#f8f5fc" }} onError={(e) => { e.currentTarget.src = config.fallback; }} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" restoreFocus={false} enforceFocus={false} keyboard={!uploading} size="lg" centered scrollable>
            <Modal.Header closeButton={!uploading}>
                <Modal.Title>{modalMode === "create" ? "Crear" : "Editar"} {sec.title}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSave}>
                <Modal.Body>
                    <div className="db-form-grid">
                        {sec.fields.map((field) => (
                            <div key={field.name} className={`db-form-group ${field.type === "textarea" ? "full" : ""}`}>
                                <label className="db-label">
                                    {field.label}
                                    {field.required && <span className="db-required">*</span>}
                                    {field.name === "password" && modalMode === "edit" && <span className="text-muted"> (dejar vacío para no cambiar)</span>}
                                    {modalMode === "edit" && field.readonlyOnEdit && <span className="db-locked-badge">🔒 no editable</span>}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}
                        {renderImageUpload()}
                        {sec.endpoint === "productos" && (
                            <div className="db-form-group full">
                                <label className="db-label">Imágenes del producto (máx. 3)</label>
                                <ImageUploader slots={productoImageSlots} onChange={setProductoImageSlots} error={imgError} onError={setImgError} />
                                {imgError && <Alert variant="warning" className="mt-2">{imgError}</Alert>}
                            </div>
                        )}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button type="button" className="db-btn db-btn--ghost" onClick={onHide} disabled={uploading}>
                        <X size={15} /> Cancelar
                    </button>
                    <button type="submit" className="db-btn db-btn--primary" disabled={uploading}>
                        <Save size={15} /> {uploading ? "Guardando..." : "Guardar"}
                    </button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}