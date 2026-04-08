"use client";

/**
 * src/components/admin/categories/NewCategoryCard.tsx
 *
 * Tarjeta de creación de categoría. Se monta cuando el padre activa
 * el modo "isAdding". Presenta un input vacío enfocado automáticamente.
 *
 * Guardar (Enter o botón) → delega al padre para mostrar SweetAlert y llamar API.
 * Cancelar (Escape o botón) → llama onCancel.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import styles from "./CategoryCard.module.css";

/* ── Props ──────────────────────────────────────────────────────── */

interface NewCategoryCardProps {
  isLoading: boolean;
  onCreate:  (name: string) => Promise<void>;
  onCancel:  () => void;
}

/* ── Component ──────────────────────────────────────────────────── */

export function NewCategoryCard({ isLoading, onCreate, onCancel }: NewCategoryCardProps) {
  const [value,   setValue]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await onCreate(trimmed);
  }, [value, onCreate]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); onCancel();   }
  }, [handleSave, onCancel]);

  return (
    <article className={`${styles.card} ${styles.cardEditing}`}>

      {/* Ícono decorativo */}
      <span className={styles.icon} aria-hidden="true">◎</span>

      {/* Input */}
      <div className={styles.content}>
        <input
          ref={inputRef}
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nombre de la categoría"
          maxLength={60}
          aria-label="Nombre de la nueva categoría"
          disabled={isLoading}
        />
      </div>

      {/* Acciones */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnSave}`}
          type="button"
          onClick={handleSave}
          disabled={isLoading || !value.trim()}
          aria-label="Crear categoría"
        >
          {isLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          Cancelar
        </button>
      </div>

    </article>
  );
}