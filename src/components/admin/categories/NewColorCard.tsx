"use client";

/**
 * src/components/admin/categories/NewColorCard.tsx
 *
 * Tarjeta de creación de color. Se monta cuando el padre activa
 * el modo "isAddingColor". Presenta nombre + picker + hex sincronizados.
 *
 * Guardar (Enter o botón) → delega al padre para SweetAlert y llamada API.
 * Cancelar (Escape o botón) → llama onCancel.
 */

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import styles from "./ColorCard.module.css";

/* ── Helpers ────────────────────────────────────────────────────── */

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/;

function normalizeHex(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith("#") ? trimmed.toUpperCase() : `#${trimmed}`.toUpperCase();
}

const DEFAULT_HEX = "#4EC4C4";

/* ── Props ──────────────────────────────────────────────────────── */

interface NewColorCardProps {
  isLoading: boolean;
  onCreate:  (name: string, hex: string) => Promise<void>;
  onCancel:  () => void;
}

/* ── Component ──────────────────────────────────────────────────── */

export function NewColorCard({ isLoading, onCreate, onCancel }: NewColorCardProps) {
  const [name,       setName]       = useState("");
  const [hex,        setHex]        = useState(DEFAULT_HEX);
  const [hexInvalid, setHexInvalid] = useState(false);

  const nameInputRef  = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const handlePickerChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setHex(e.target.value.toUpperCase());
    setHexInvalid(false);
  }, []);

  const handleHexChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setHex(raw);
    const normalized = normalizeHex(raw);
    setHexInvalid(raw.length > 0 && !HEX_PATTERN.test(normalized));
  }, []);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    const normalized  = normalizeHex(hex);

    if (!trimmedName) return;
    if (!HEX_PATTERN.test(normalized)) {
      setHexInvalid(true);
      return;
    }

    await onCreate(trimmedName, normalized);
  }, [name, hex, onCreate]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel();   }
  }, [handleSave, onCancel]);

  const pickerValue = HEX_PATTERN.test(normalizeHex(hex))
    ? normalizeHex(hex)
    : DEFAULT_HEX;

  return (
    <article className={`${styles.card} ${styles.cardEditing}`}>

      {/* Nombre */}
      <div className={styles.cardTop}>
        <input
          ref={nameInputRef}
          className={styles.inputName}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={60}
          placeholder="Nombre del color"
          aria-label="Nombre del nuevo color"
          disabled={isLoading}
        />
      </div>

      {/* Picker + hex */}
      <div className={styles.pickerRow}>
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

        <input
          className={`${styles.inputHex} ${hexInvalid ? styles.hexInvalid : ""}`}
          type="text"
          value={hex}
          onChange={handleHexChange}
          onKeyDown={handleKeyDown}
          maxLength={7}
          placeholder="#000000"
          aria-label="Valor hexadecimal"
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
          disabled={isLoading || !name.trim() || hexInvalid}
          aria-label="Crear color"
        >
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          Crear
        </button>
        <button
          className={`${styles.btn} ${styles.btnCancel}`}
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Cancelar creación"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          <span className={styles.btnLabel}>Cancelar</span>
        </button>
      </div>

    </article>
  );
}