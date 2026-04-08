"use client";

/**
 * src/components/admin/categories/ColorCard.tsx
 *
 * Tarjeta de color con dos modos:
 *   - display  → círculo de color + nombre + count + botones Editar/Eliminar
 *   - editing  → input nombre + swatch clickeable (abre picker nativo) +
 *                input hex manual — todos sincronizados bidireccionalmente
 *
 * Las confirmaciones se delegan al padre mediante onUpdate / onDelete.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import type { CatalogColor } from "@/types/catalog";
import styles from "./ColorCard.module.css";

/* ── Helpers ────────────────────────────────────────────────────── */

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/** Normaliza texto a hex válido: añade '#' si falta, fuerza mayúsculas. */
function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed.toUpperCase() : `#${trimmed}`.toUpperCase();
}

/* ── Props ──────────────────────────────────────────────────────── */

interface ColorCardProps {
  color:     CatalogColor;
  isLoading: boolean;
  onUpdate:  (id: string, name: string, hex: string) => Promise<void>;
  onDelete:  (color: CatalogColor) => Promise<void>;
}

/* ── Component ──────────────────────────────────────────────────── */

export function ColorCard({ color, isLoading, onUpdate, onDelete }: ColorCardProps) {
  const [isEditing,  setIsEditing]  = useState(false);
  const [editName,   setEditName]   = useState(color.name);
  const [editHex,    setEditHex]    = useState(color.hex);
  const [hexInvalid, setHexInvalid] = useState(false);

  const nameInputRef  = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  /* Enfocar nombre al entrar en edición */
  useEffect(() => {
    if (isEditing) nameInputRef.current?.focus();
  }, [isEditing]);

  const startEdit = useCallback(() => {
    setEditName(color.name);
    setEditHex(color.hex);
    setHexInvalid(false);
    setIsEditing(true);
  }, [color]);

  const cancelEdit = useCallback(() => {
    setEditName(color.name);
    setEditHex(color.hex);
    setHexInvalid(false);
    setIsEditing(false);
  }, [color]);

  /* Picker nativo → actualiza hex text */
  const handlePickerChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setEditHex(val);
    setHexInvalid(false);
  }, []);

  /* Input hex manual → valida y actualiza picker */
  const handleHexChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setEditHex(raw);

    const normalized = normalizeHex(raw);
    setHexInvalid(raw.length > 0 && !HEX_PATTERN.test(normalized));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = editName.trim();
    const normalized  = normalizeHex(editHex);

    if (!trimmedName) return;
    if (!HEX_PATTERN.test(normalized)) {
      setHexInvalid(true);
      return;
    }

    const nameUnchanged = trimmedName === color.name;
    const hexUnchanged  = normalized  === color.hex;
    if (nameUnchanged && hexUnchanged) {
      cancelEdit();
      return;
    }

    await onUpdate(color.id, trimmedName, normalized);
    setIsEditing(false);
  }, [editName, editHex, color, onUpdate, cancelEdit]);

  const handleNameKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  }, [handleSave, cancelEdit]);

  const handleHexKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  }, [handleSave, cancelEdit]);

  /* Valor seguro para el picker nativo (solo hex válido) */
  const pickerValue = HEX_PATTERN.test(normalizeHex(editHex))
    ? normalizeHex(editHex)
    : color.hex;

  const productCount = (color as CatalogColor & { _count?: { products: number } })
    ._count?.products ?? null;

  /* ── Display mode ─────────────────────────────────────────────── */

  if (!isEditing) {
    return (
      <article className={styles.card}>
        <div className={styles.cardTop}>
          <span
            className={styles.swatch}
            style={{ background: color.hex }}
            aria-label={`Color ${color.hex}`}
          />
          <span className={styles.name}>{color.name}</span>
          {productCount !== null && (
            <span className={styles.count}>
              {productCount}p
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnEdit}`}
            type="button"
            onClick={startEdit}
            disabled={isLoading}
            aria-label={`Editar color ${color.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Editar
          </button>
          <button
            className={`${styles.btn} ${styles.btnDelete}`}
            type="button"
            onClick={() => onDelete(color)}
            disabled={isLoading}
            aria-label={`Eliminar color ${color.name}`}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
            Eliminar
          </button>
        </div>
      </article>
    );
  }

  /* ── Editing mode ─────────────────────────────────────────────── */

  return (
    <article className={`${styles.card} ${styles.cardEditing}`}>

      {/* Nombre */}
      <div className={styles.cardTop}>
        <input
          ref={nameInputRef}
          className={styles.inputName}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleNameKeyDown}
          maxLength={60}
          placeholder="Nombre del color"
          aria-label="Nombre del color"
          disabled={isLoading}
        />
      </div>

      {/* Picker + hex */}
      <div className={styles.pickerRow}>
        {/* Swatch clickeable — abre el picker nativo */}
        <span
          className={`${styles.swatch} ${styles.swatchClickable}`}
          style={{ background: pickerValue }}
          onClick={() => colorInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Abrir selector de color"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") colorInputRef.current?.click(); }}
        >
          <input
            ref={colorInputRef}
            className={styles.colorPickerInput}
            type="color"
            value={pickerValue}
            onChange={handlePickerChange}
            aria-hidden="true"
            tabIndex={-1}
            disabled={isLoading}
          />
        </span>

        {/* Hex manual */}
        <input
          className={`${styles.inputHex} ${hexInvalid ? styles.hexInvalid : ""}`}
          type="text"
          value={editHex}
          onChange={handleHexChange}
          onKeyDown={handleHexKeyDown}
          maxLength={7}
          placeholder="#000000"
          aria-label="Valor hexadecimal del color"
          spellCheck={false}
          disabled={isLoading}
        />
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnSave}`}
          type="button"
          onClick={handleSave}
          disabled={isLoading || !editName.trim() || hexInvalid}
          aria-label="Guardar cambios"
        >
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          Guardar
        </button>
        <button
          className={`${styles.btn} ${styles.btnCancel}`}
          type="button"
          onClick={cancelEdit}
          disabled={isLoading}
          aria-label="Cancelar edición"
        >
          Cancelar
        </button>
      </div>

    </article>
  );
}