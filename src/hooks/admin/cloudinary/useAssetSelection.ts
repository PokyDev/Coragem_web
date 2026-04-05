"use client";

/**
 * src/hooks/admin/cloudinary/useAssetSelection.ts
 *
 * Centraliza toda la lógica de selección múltiple de assets.
 * Usado por ImagesPage, DraggableAssetCard y SelectionOverlay.
 *
 * Modos de selección:
 *   - toggleOne:      click en checkbox individual (acumulativo)
 *   - selectMany:     rubber-band — REEMPLAZA la selección completa con los ids
 *                     recibidos, de modo que encoger el rectángulo deselecciona
 *   - clearSelection: limpiar todo
 *
 * selectionMode se activa automáticamente cuando hay ≥ 1 asset seleccionado,
 * lo que hace que los AssetCard muestren los checkboxes.
 */

import { useState, useCallback, useMemo } from "react";

export interface UseAssetSelectionReturn {
  selectedIds:    Set<string>;
  selectionMode:  boolean;
  isSelected:     (publicId: string) => boolean;
  toggleOne:      (publicId: string) => void;
  selectMany:     (publicIds: string[]) => void;
  clearSelection: () => void;
  count:          number;
}

export function useAssetSelection(): UseAssetSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const selectionMode = selectedIds.size > 0;

  const isSelected = useCallback(
    (publicId: string) => selectedIds.has(publicId),
    [selectedIds],
  );

  const toggleOne = useCallback((publicId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(publicId)) {
        next.delete(publicId);
      } else {
        next.add(publicId);
      }
      return next;
    });
  }, []);

  /* Reemplaza la selección completa — rubber-band siempre parte de cero */
  const selectMany = useCallback((publicIds: string[]) => {
    setSelectedIds(new Set(publicIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const count = selectedIds.size;

  return useMemo(
    () => ({ selectedIds, selectionMode, isSelected, toggleOne, selectMany, clearSelection, count }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedIds, selectionMode, count],
  );
}