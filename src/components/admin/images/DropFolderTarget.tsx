"use client";

/**
 * src/components/admin/images/DropFolderTarget.tsx
 *
 * Wrapper de drop target sobre FolderCard y segmentos del breadcrumb.
 *
 * ── Desktop (HTML5 drag API) ──────────────────────────────────────
 *   dragover → resalta el borde con --admin-accent y fondo sutil.
 *   drop     → extrae publicIds del dataTransfer y llama a onDrop.
 *
 * ── Móvil (CustomEvents desde DraggableAssetCard) ─────────────────
 *   coragem:touchdragenter → aplica el mismo highlight de drag-over.
 *   coragem:touchdragleave → quita el highlight.
 *   coragem:touchdrop      → extrae publicIds del detalle del evento
 *                            y llama a onDrop.
 *
 *   El elemento raíz lleva data-drop-target para que DraggableAssetCard
 *   pueda encontrarlo con closest("[data-drop-target]").
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { TouchDropDetail } from "./DraggableAssetCard";
import styles from "./DropFolderTarget.module.css";

export const DRAG_DATA_KEY = "application/x-coragem-assets";

interface DropFolderTargetProps {
  targetPath:  string;
  onDrop:      (publicIds: string[], targetPath: string) => void;
  children:    React.ReactNode;
  isDropping?: boolean;
  className?:  string;
}

export function DropFolderTarget({
  targetPath,
  onDrop,
  children,
  isDropping = false,
  className  = "",
}: DropFolderTargetProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  /* ── Desktop handlers ── */

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes(DRAG_DATA_KEY)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const raw = e.dataTransfer.getData(DRAG_DATA_KEY);
    if (!raw) return;

    try {
      const { publicIds } = JSON.parse(raw) as { publicIds: string[] };
      if (Array.isArray(publicIds) && publicIds.length > 0) {
        onDrop(publicIds, targetPath);
      }
    } catch {
      // Datos corruptos — ignorar
    }
  }, [onDrop, targetPath]);

  /* ── Móvil: escuchar CustomEvents del touch drag ── */

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onTouchDragEnter = () => setIsDragOver(true);
    const onTouchDragLeave = () => setIsDragOver(false);

    const onTouchDrop = (e: Event) => {
      setIsDragOver(false);
      const { publicIds } = (e as CustomEvent<TouchDropDetail>).detail;
      if (Array.isArray(publicIds) && publicIds.length > 0) {
        onDrop(publicIds, targetPath);
      }
    };

    el.addEventListener("coragem:touchdragenter", onTouchDragEnter);
    el.addEventListener("coragem:touchdragleave", onTouchDragLeave);
    el.addEventListener("coragem:touchdrop",      onTouchDrop);

    return () => {
      el.removeEventListener("coragem:touchdragenter", onTouchDragEnter);
      el.removeEventListener("coragem:touchdragleave", onTouchDragLeave);
      el.removeEventListener("coragem:touchdrop",      onTouchDrop);
    };
  }, [onDrop, targetPath]);

  return (
    <div
      ref={rootRef}
      data-drop-target
      className={`
        ${styles.target}
        ${isDragOver  ? styles.dragOver  : ""}
        ${isDropping  ? styles.dropping  : ""}
        ${className}
      `.trim()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}

      {isDropping && (
        <div className={styles.droppingIndicator} aria-hidden="true">
          <span className={styles.droppingSpinner} />
        </div>
      )}
    </div>
  );
}