"use client";

/**
 * src/components/admin/dashboard/ProductFormModal.tsx
 *
 * Modal unificado para crear y editar productos.
 *
 * Modos:
 *   - product === null  → "nuevo"  → campos vacíos, botón "Crear"
 *   - product !== null  → "editar" → campos prellenados, botón "Guardar"
 *
 * La lógica de formulario, validación y drag & drop está completamente
 * delegada a useProductForm. Este componente solo es responsable de la UI.
 *
 * SweetAlert2 se carga de forma dinámica (import()) para no inflar el bundle.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { ProductRow } from "@/types/admin";
import { useProductForm } from "@/hooks/admin/useProductForm";
import categories from "@/data/categories.json";
import colors     from "@/data/colors.json";
import styles from "@/components/admin/css/ProductFormModal.module.css";

/* ─── SweetAlert2 lazy loader ───────────────────────────────────── */
async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

/* Opciones de tema compartidas para todos los dialogs */
const SWAL_THEME = {
  background: "#111827",
  color:      "#e2e8f0",
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

/* ─── ImageZone — zona de drop/preview separada en sub-componente ── */
interface ImageZoneProps {
  imagePreview:   string | null;
  isDragging:     boolean;
  hasError:       boolean;
  errorMsg?:      string;
  onZoneClick:    () => void;
  onDragEnter:    React.DragEventHandler;
  onDragLeave:    React.DragEventHandler;
  onDragOver:     React.DragEventHandler;
  onDrop:         React.DragEventHandler;
  onRemove:       () => void;
  fileInputRef:   React.RefObject<HTMLInputElement | null>;
  onFileChange:   React.ChangeEventHandler<HTMLInputElement>;
}

function ImageZone({
  imagePreview, isDragging, hasError, errorMsg,
  onZoneClick, onDragEnter, onDragLeave, onDragOver, onDrop,
  onRemove, fileInputRef, onFileChange,
}: ImageZoneProps) {
  return (
    <div className={styles.imageSection}>
      <span className={styles.imageLabel}>
        Imagen <span className={styles.fieldRequired}>*</span>
      </span>

      {/*
        Input file oculto.

        accept: lista explícita de MIME types + wildcard "image/*".

        Por qué no solo "image/*":
          En Android, "image/*" a veces solo muestra la galería local o la
          cámara, sin opción de acceder a Google Fotos, Drive u otras fuentes.
          Incluir los MIME types explícitos junto con el wildcard hace que el
          sistema operativo muestre el selector de fuentes completo (sistema de
          archivos, Google Fotos, Drive, Samsung Cloud, etc.) en lugar de
          limitarlo a la galería predeterminada.

        Por qué incluir image/heic e image/heif:
          Necesarios para que el picker de iOS y algunos Android ofrezcan
          imágenes nativas del carrete cuando el dispositivo usa HEIF como
          formato de captura (iPhone por defecto desde iOS 11).

        El atributo accept es solo una sugerencia al SO — el backend valida
        el contenido real del archivo independientemente de lo que declare el
        MIME type del multipart.
      */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,image/*"
        style={{ display: "none" }}
        onChange={onFileChange}
      />

      {/* Zona de drop */}
      <div
        className={[
          styles.imageDropZone,
          isDragging  ? styles.imageDropZoneDragging : "",
          hasError    ? styles.imageDropZoneError    : "",
        ].filter(Boolean).join(" ")}
        onClick={onZoneClick}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onZoneClick()}
        aria-label="Zona para subir imagen"
      >
        {/* Estado: arrastrando */}
        {isDragging && (
          <div className={styles.draggingOverlay}>
            <div className={styles.draggingBadge}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
              <span className={styles.draggingText}>Suelta aquí</span>
            </div>
          </div>
        )}

        {/* Estado: sin imagen */}
        {!imagePreview && !isDragging && (
          <div className={styles.imageEmpty}>
            <div className={styles.imageEmptyIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <p className={styles.imageEmptyTitle}>Agregar imagen</p>
            <p className={styles.imageEmptyHint}>
              Haz clic para seleccionar<br />o arrastra el archivo aquí
            </p>
            <span className={styles.imageEmptyFormats}>PNG · JPG · WEBP · HEIF</span>
          </div>
        )}

        {/* Estado: imagen cargada → preview */}
        {imagePreview && !isDragging && (
          <>
            <Image
              src={imagePreview}
              alt="Preview del producto"
              fill
              sizes="340px"
              className={styles.imagePreviewImg}
              style={{ objectFit: "cover" }}
            />
            <div className={styles.imagePreviewOverlay}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0.9 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span className={styles.imagePreviewOverlayText}>Cambiar imagen</span>
            </div>
            <button
              className={styles.imageRemoveBtn}
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              aria-label="Quitar imagen"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </>
        )}
      </div>

      {errorMsg && <span className={styles.imageErrorText}>{errorMsg}</span>}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function ProductFormModal({ isOpen, product, onClose, onSaved }: ProductFormModalProps) {
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isEdit   = product !== null;
  const mode     = isEdit ? "edit" : "new";

  const {
    formData, errors, imagePreview, isDragging, isSubmitting,
    fileInputRef, apiError,
    handleFieldChange, handleImageClick, handleFileInputChange,
    handleDragEnter, handleDragLeave, handleDragOver, handleDrop,
    handleRemoveImage, handleSubmit, handleCancel,
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
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleCancelWithConfirm(); };
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
        title: "¿Guardar cambios?",
        text:  `Se actualizará "${product?.name}".`,
        icon:  "question",
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
        title: isEdit ? "¡Producto actualizado!" : "¡Producto creado!",
        text:  isEdit
          ? "Los cambios fueron guardados correctamente."
          : "El nuevo producto fue agregado al catálogo.",
        icon:             "success",
        confirmButtonText: "Aceptar",
        timer:             2800,
        timerProgressBar:  true,
        ...SWAL_THEME,
      });
      onSaved?.(mode);
      onClose();
    }
  }, [isEdit, product, handleSubmit, onSaved, onClose, mode]);

  /* ── Cancelar con confirmación si hay datos sin guardar ── */
  const handleCancelWithConfirm = useCallback(async () => {
    const hasUnsaved = formData.name.trim() || formData.price || (!isEdit && formData.image);
    if (!hasUnsaved) { handleCancel(); return; }

    const Swal = await getSwal();
    const { isConfirmed } = await Swal.fire({
      title: "¿Descartar cambios?",
      text:  "Los cambios no guardados se perderán.",
      icon:  "warning",
      showCancelButton:  true,
      confirmButtonText: "Sí, descartar",
      cancelButtonText:  "Seguir editando",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      background: "#111827",
      color:      "#e2e8f0",
    });
    if (isConfirmed) handleCancel();
  }, [formData, isEdit, handleCancel]);

  /* Color hex para el dot del select de color */
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* Columna izquierda: campos */}
          <div className={styles.fieldsSection}>

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
                {/* Dot de color del valor seleccionado */}
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

          </div>

          {/* Columna derecha: imagen */}
          <ImageZone
            imagePreview={imagePreview}
            isDragging={isDragging}
            hasError={!!errors.image}
            errorMsg={errors.image}
            onZoneClick={handleImageClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onRemove={handleRemoveImage}
            fileInputRef={fileInputRef}
            onFileChange={handleFileInputChange}
          />

        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          {/* Error de API — visible si el backend rechaza la operación */}
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