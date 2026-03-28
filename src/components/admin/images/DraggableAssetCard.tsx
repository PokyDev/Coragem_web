"use client";

/**
 * src/components/admin/images/DraggableAssetCard.tsx
 *
 * Wrapper sobre AssetCard que añade soporte de drag HTML5.
 *
 * Comportamiento:
 *   - Si el asset no está seleccionado al iniciar el drag → se auto-selecciona
 *     y arrastra solo ese asset.
 *   - Si hay múltiples assets seleccionados y este es uno de ellos → arrastra todos.
 *   - Los publicIds se pasan en dataTransfer como JSON bajo DRAG_DATA_KEY.
 *   - Durante el drag se muestra un ghost personalizado (badge con el count).
 */

import { useRef, useCallback } from "react";
import { AssetCard } from "./AssetCard";
import { DRAG_DATA_KEY } from "./DropFolderTarget";
import type { CloudinaryAsset } from "@/hooks/admin/useCloudinaryImages";
import styles from "./DraggableAssetCard.module.css";

interface DraggableAssetCardProps {
  asset:          CloudinaryAsset;
  index:          number;
  selectionMode:  boolean;
  isSelected:     boolean;
  selectedIds:    Set<string>;
  onToggleSelect: (publicId: string) => void;
  onOpenDetail:   (asset: CloudinaryAsset) => void;
  /** Ref del mapa publicId → DOM element para el rubber-band */
  cardRefCallback: (publicId: string, el: HTMLElement | null) => void;
}

export function DraggableAssetCard({
  asset,
  index,
  selectionMode,
  isSelected,
  selectedIds,
  onToggleSelect,
  onOpenDetail,
  cardRefCallback,
}: DraggableAssetCardProps) {
  const wrapRef  = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const getDraggedIds = useCallback((): string[] => {
    /* Si el asset arrastrado está entre los seleccionados, arrastrar todos */
    if (isSelected && selectedIds.size > 1) {
      return Array.from(selectedIds);
    }
    /* Si no está seleccionado (o es el único), arrastrar solo este */
    return [asset.publicId];
  }, [asset.publicId, isSelected, selectedIds]);

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const ids = getDraggedIds();

    /* Auto-seleccionar si no estaba seleccionado */
    if (!isSelected) {
      onToggleSelect(asset.publicId);
    }

    /* Datos del drag */
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify({ publicIds: ids }));

    /* Ghost personalizado — badge con el count */
    const ghost = document.createElement("div");
    ghost.className = styles.dragGhost;
    ghost.textContent = ids.length > 1 ? `${ids.length} imágenes` : asset.displayName;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, -8, -8);

    /* Limpieza diferida (el ghost debe existir durante el dragstart) */
    requestAnimationFrame(() => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
    });
  }, [getDraggedIds, isSelected, onToggleSelect, asset]);

  const handleDragEnd = useCallback(() => {
    /* Limpiar ghost residual si por algún motivo no se eliminó */
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
  }, []);

  return (
    <div
      ref={(el) => {
        (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        cardRefCallback(asset.publicId, el);
      }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={styles.draggable}
    >
      <AssetCard
        mode="gallery"
        asset={asset}
        index={index}
        onClick={onOpenDetail}
        selectionMode={selectionMode}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onOpenDetail={onOpenDetail}
      />
    </div>
  );
}