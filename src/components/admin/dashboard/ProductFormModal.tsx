"use client";

/**
 * src/components/admin/dashboard/ProductFormModal.tsx
 *
 * Modal unificado para crear y editar productos.
 * La subida de imágenes está suspendida temporalmente.
 * Los campos del formulario se envían como JSON al backend.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { ProductRow } from "@/types/admin";
import { useProductForm } from "@/hooks/admin/useProductForm";
import categories from "@/data/categories.json";
import colors     from "@/data/colors.json";
import styles from "./ProductFormModal.module.css";

/* ─── SweetAlert2 lazy ───────────────────────────────────────────── */
async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

const SWAL_THEME = {
  background:         "#111827",
  color:              "#e2e8f0",
  confirmButtonColor: "#4ec4c4",
  cancelButtonColor:  "#1e2d3d",
} as const;

/* ─── Props ─────────────────────────────────────────────────────── */
interface ProductFormModalProps {
  isOpen:   boolean;
  product:  ProductRow | null;
  onClose:  () => void;
  onSaved?: (mode: "new" | "edit") => void;
}

/* ─── Component ─────────────────────────────────────────────────── */
export function ProductFormModal({ isOpen, product, onClose, onSaved }: ProductFormModalProps) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isEdit   = product !== null;
  const mode     = isEdit ? "edit" : "new";

  const {
    formData, errors, isSubmitting, apiError,
    handleFieldChange, handleSubmit, handleCancel,
  } = useProductForm({ product, onClose });

  /* ── Animación de apertura/cierre ── */
  useEffect(() => {
    if (isOpen) {
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  /* ── Cerrar con Escape ── */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancelWithConfirm();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, formData]);

  /* ── Cerrar al hacer click fuera del panel ── */
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      handleCancelWithConfirm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  /* ── Submit con confirmación ── */
  const handleSubmitWithConfirm = useCallback(async () => {
    const Swal = await getSwal();

    if (isEdit) {
      const { isConfirmed } = await Swal.fire({
        title:             "¿Guardar cambios?",
        text:              `Se actualizará "${product?.name}".`,
        icon:              "question",
        showCancelButton:  true,
        confirmButtonText: "Sí, guardar",
        cancelButtonText:  "Cancelar",
        ...SWAL_THEME,
      });
      if (!isConfirmed) return;
    }

    const success = await handleSubmit();

    if (success) {
      await Swal.fire({
        title:             isEdit ? "¡Producto actualizado!" : "¡Producto creado!",
        text:              isEdit
          ? "Los cambios fueron guardados correctamente."
          : "El nuevo producto fue agregado al catálogo.",
        icon:              "success",
        confirmButtonText: "Aceptar",
        timer:             2800,
        timerProgressBar:  true,
        ...SWAL_THEME,
      });
      onSaved?.(mode);
      onClose();
    }
  }, [isEdit, product, handleSubmit, onSaved, onClose, mode]);

  /* ── Cancelar con confirmación ── */
  const handleCancelWithConfirm = useCallback(async () => {
    const hasUnsaved = formData.name.trim() || formData.price;
    if (!hasUnsaved) { handleCancel(); return; }

    const Swal = await getSwal();
    const { isConfirmed } = await Swal.fire({
      title:              "¿Descartar cambios?",
      text:               "Los cambios no guardados se perderán.",
      icon:               "warning",
      showCancelButton:   true,
      confirmButtonText:  "Sí, descartar",
      cancelButtonText:   "Seguir editando",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      background:         "#111827",
      color:              "#e2e8f0",
    });
    if (isConfirmed) handleCancel();
  }, [formData, handleCancel]);

  /* ── Imagen no disponible ── */
  const handleImageUnavailable = useCallback(async () => {
    const Swal = await getSwal();
    await Swal.fire({
      title:             "Funcionalidad no disponible",
      html:              `<span style="color:#94a3b8;font-size:0.88rem;line-height:1.6">
                           La subida de imágenes está temporalmente suspendida.<br>
                           Esta funcionalidad estará disponible próximamente.
                         </span>`,
      icon:              "info",
      confirmButtonText: "Entendido",
      ...SWAL_THEME,
    });
  }, []);

  /* Color hex para el dot del select */
  const selectedColorHex = colors.find((c) => c.id === formData.color)?.hex ?? null;

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropVisible : ""}`}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-label={isEdit ? `Editar ${product?.name}` : "Nuevo producto"}
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${visible ? styles.panelVisible : ""}`}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEyebrow}>
              {isEdit ? "Editar producto" : "Nuevo producto"}
            </span>
            <h2 className={styles.headerTitle}>
              {isEdit ? product?.name : "Agregar al catálogo"}
            </h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={handleCancelWithConfirm}
            aria-label="Cerrar"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Nombre */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Nombre <span className={styles.fieldRequired}>*</span>
            </label>
            <input
              type="text"
              className={`${styles.fieldInput} ${errors.name ? styles.fieldInputError : ""}`}
              placeholder="Ej. Collar Teal Wave"
              value={formData.name}
              onChange={handleFieldChange("name")}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          {/* Precio + Stock */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Precio (COP) <span className={styles.fieldRequired}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.fieldInput} ${errors.price ? styles.fieldInputError : ""}`}
                placeholder="Ej. 38000"
                min="0"
                value={formData.price}
                onChange={handleFieldChange("price")}
              />
              {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                Stock <span className={styles.fieldRequired}>*</span>
              </label>
              <input
                type="number"
                className={`${styles.fieldInput} ${errors.stock ? styles.fieldInputError : ""}`}
                placeholder="Ej. 12"
                min="0"
                value={formData.stock}
                onChange={handleFieldChange("stock")}
              />
              {errors.stock && <span className={styles.fieldError}>{errors.stock}</span>}
            </div>
          </div>

          {/* Ventas */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Nº de ventas</label>
            <input
              type="number"
              className={styles.fieldInput}
              placeholder="Ej. 34"
              min="0"
              value={formData.ventas}
              onChange={handleFieldChange("ventas")}
            />
          </div>

          {/* Categoría */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Categoría <span className={styles.fieldRequired}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              <select
                className={`${styles.fieldSelect} ${errors.category ? styles.fieldSelectError : ""}`}
                value={formData.category}
                onChange={handleFieldChange("category")}
              >
                <option value="" disabled>Seleccionar categoría…</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
              <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
          </div>

          {/* Color */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              Color <span className={styles.fieldRequired}>*</span>
            </label>
            <div className={styles.selectWrapper}>
              {selectedColorHex && (
                <div className={styles.colorDotWrapper}>
                  <span className={styles.colorDot} style={{ background: selectedColorHex }} />
                </div>
              )}
              <select
                className={`${styles.fieldSelect} ${errors.color ? styles.fieldSelectError : ""} ${selectedColorHex ? styles.fieldSelectWithDot : ""}`}
                value={formData.color}
                onChange={handleFieldChange("color")}
              >
                <option value="" disabled>Seleccionar color…</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              <svg className={styles.selectArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {errors.color && <span className={styles.fieldError}>{errors.color}</span>}
          </div>

          {/* Imagen — suspendida */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>Imagen</label>
            <button
              type="button"
              onClick={handleImageUnavailable}
              style={{
                width:          "100%",
                padding:        "0.75rem 1rem",
                border:         "1.5px dashed var(--admin-border)",
                borderRadius:   "8px",
                background:     "var(--admin-surface)",
                color:          "var(--admin-text-dim)",
                fontFamily:     "var(--font-jost), sans-serif",
                fontSize:       "0.78rem",
                letterSpacing:  "0.04em",
                cursor:         "pointer",
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            "0.5rem",
                transition:     "border-color 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(78,196,196,0.3)";
                (e.currentTarget as HTMLButtonElement).style.color       = "var(--admin-text-muted)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--admin-border)";
                (e.currentTarget as HTMLButtonElement).style.color       = "var(--admin-text-dim)";
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              Subir imagen — no disponible por ahora
            </button>
          </div>

        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          {apiError && (
            <span
              style={{
                fontFamily:    "var(--font-jost), sans-serif",
                fontSize:      "0.72rem",
                color:         "var(--admin-danger)",
                letterSpacing: "0.02em",
                flex:          1,
              }}
            >
              {apiError}
            </span>
          )}
          <button
            type="button"
            className={styles.btnCancel}
            onClick={handleCancelWithConfirm}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={handleSubmitWithConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && <span className={styles.spinner} />}
            {isSubmitting ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </div>
  );
}