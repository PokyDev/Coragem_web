"use client";

/**
 * src/components/admin/categories/CategoryCard.tsx
 *
 * Tarjeta de categoría con dos modos:
 *   - display  → muestra el nombre + botones Editar / Eliminar
 *   - editing  → input inline enfocado + botón Guardar / Cancelar (Escape)
 *
 * Las confirmaciones se delegan al padre mediante onUpdate / onDelete,
 * que ya muestran SweetAlert antes de llamar a la API.
 */

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import type { CatalogCategory } from "@/types/catalog";
import styles from "./CategoryCard.module.css";

/* ── Props ──────────────────────────────────────────────────────── */

interface CategoryCardProps {
  category:  CatalogCategory;
  isLoading: boolean;
  onUpdate:  (id: string, newName: string) => Promise<void>;
  onDelete:  (category: CatalogCategory) => Promise<void>;
}

/* ── Component ──────────────────────────────────────────────────── */

export function CategoryCard({ category, isLoading, onUpdate, onDelete }: CategoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Enfocar el input al entrar en modo edición */
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const startEdit = useCallback(() => {
    setEditValue(category.name);
    setIsEditing(true);
  }, [category.name]);

  const cancelEdit = useCallback(() => {
    setEditValue(category.name);
    setIsEditing(false);
  }, [category.name]);

  const handleSave = useCallback(async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === category.name) {
      cancelEdit();
      return;
    }
    await onUpdate(category.id, trimmed);
    setIsEditing(false);
  }, [editValue, category, onUpdate, cancelEdit]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter")  { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") { e.preventDefault(); cancelEdit(); }
  }, [handleSave, cancelEdit]);

  /* Conteo de productos */
  const productCount = (category as CatalogCategory & { _count?: { products: number } })
    ._count?.products ?? null;

  return (
    <article className={`${styles.card} ${isEditing ? styles.cardEditing : ""}`}>

      {/* ── Ícono decorativo ── */}
      <span className={styles.icon} aria-hidden="true">◎</span>

      {/* ── Nombre o input ── */}
      <div className={styles.content}>
        {isEditing ? (
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={60}
            aria-label="Nuevo nombre de la categoría"
            disabled={isLoading}
          />
        ) : (
          <>
            <span className={styles.name}>{category.name}</span>
            {productCount !== null && (
              <span className={styles.count}>
                {productCount} producto{productCount !== 1 ? "s" : ""}
              </span>
            )}
          </>
        )}
      </div>

      {/* ── Acciones ── */}
      <div className={styles.actions}>
        {isEditing ? (
          <>
            <button
              className={`${styles.btn} ${styles.btnSave}`}
              type="button"
              onClick={handleSave}
              disabled={isLoading || !editValue.trim()}
              aria-label="Guardar nombre"
            >
              {isLoading ? (
                <span className={styles.spinner} aria-hidden="true" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          </>
        ) : (
          <>
            <button
              className={`${styles.btn} ${styles.btnEdit}`}
              type="button"
              onClick={startEdit}
              disabled={isLoading}
              aria-label={`Editar categoría ${category.name}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              className={`${styles.btn} ${styles.btnDelete}`}
              type="button"
              onClick={() => onDelete(category)}
              disabled={isLoading}
              aria-label={`Eliminar categoría ${category.name}`}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Eliminar
            </button>
          </>
        )}
      </div>

    </article>
  );
}