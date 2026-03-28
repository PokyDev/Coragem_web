"use client";

/**
 * src/components/admin/images/DropFolderTarget.tsx
 *
 * Wrapper de drop target sobre FolderCard y segmentos del breadcrumb.
 *
 * Cuando el usuario arrastra assets sobre este componente:
 *   - dragover → resalta el borde con --admin-accent y fondo sutil
 *   - drop → extrae los publicIds del dataTransfer y llama a onDrop
 *
 * Espera recibir en dataTransfer.getData("application/x-coragem-assets")
 * un JSON con { publicIds: string[] }.
 */

import { useState, useCallback } from "react";
import styles from "./DropFolderTarget.module.css";

export const DRAG_DATA_KEY = "application/x-coragem-assets";

interface DropFolderTargetProps {
  /** Path destino de la carpeta (puede ser "" para raíz) */
  targetPath:  string;
  /** Callback cuando se suelta el drag sobre este target */
  onDrop:      (publicIds: string[], targetPath: string) => void;
  children:    React.ReactNode;
  /** Si true, está procesando un move → muestra estado de carga */
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

  const handleDragOver = useCallback((e: React.DragEvent) => {
    /* Solo aceptar drags que contengan nuestro tipo de dato */
    if (!e.dataTransfer.types.includes(DRAG_DATA_KEY)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    /* DragLeave se dispara al entrar en un hijo — verificar que salimos del target */
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

  return (
    <div
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

      {/* Indicador de carga mientras se procesa el move */}
      {isDropping && (
        <div className={styles.droppingIndicator} aria-hidden="true">
          <span className={styles.droppingSpinner} />
        </div>
      )}
    </div>
  );
}