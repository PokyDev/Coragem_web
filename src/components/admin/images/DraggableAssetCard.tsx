"use client";

/**
 * src/components/admin/images/DraggableAssetCard.tsx
 *
 * Wrapper sobre AssetCard que añade soporte de drag HTML5 (desktop)
 * y drag táctil mediante long press (móvil).
 *
 * ── Desktop (HTML5 drag API) ────────────────────────────────────────
 *   - Drag inmediato desde el primer movimiento (comportamiento nativo).
 *   - Ghost personalizado: badge con nombre o count de assets.
 *   - Los publicIds viajan en dataTransfer bajo DRAG_DATA_KEY.
 *
 * ── Móvil (touch events) ────────────────────────────────────────────
 *   Long press (~300 ms) para iniciar el arrastre, evitando conflicto
 *   con el scroll vertical de la página.
 *
 *   Flujo:
 *     1. touchstart  → armar timer de long press.
 *     2. touchmove antes del timer → cancelar (el usuario hace scroll).
 *     3. Timer cumplido → vibración háptica + activar drag táctil.
 *     4. touchmove durante drag → mover ghost + resaltar DropFolderTarget
 *        bajo el dedo con document.elementFromPoint().
 *     5. touchend → encontrar el DropFolderTarget final y disparar onDrop
 *        a través del evento sintético "touchdrop" que DropFolderTarget escucha.
 *
 *   La comunicación con DropFolderTarget se hace vía CustomEvent para no
 *   acoplar este componente directamente con el árbol del DOM.
 */

import { useRef, useCallback } from "react";
import { AssetCard }   from "./AssetCard";
import { DRAG_DATA_KEY } from "./DropFolderTarget";
import type { CloudinaryAsset } from "@/hooks/admin/cloudinary/useCloudinaryImages";
import styles from "./DraggableAssetCard.module.css";

/* ── Constantes ── */
const LONG_PRESS_MS    = 300;
const MOVE_CANCEL_PX   = 8;   // movimiento máximo antes de cancelar el long press
const TOUCH_DROP_EVENT = "coragem:touchdrop";

/* ── Tipos del evento sintético ── */
export interface TouchDropDetail {
  publicIds: string[];
}

/* ── Props ── */
interface DraggableAssetCardProps {
  asset:           CloudinaryAsset;
  index:           number;
  selectionMode:   boolean;
  isSelected:      boolean;
  selectedIds:     Set<string>;
  onToggleSelect:  (publicId: string) => void;
  onOpenDetail:    (asset: CloudinaryAsset) => void;
  cardRefCallback: (publicId: string, el: HTMLElement | null) => void;
}

/* ── Helpers ── */

/** Intenta disparar vibración háptica si el dispositivo la soporta */
function vibrateIfSupported(ms: number): void {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // Ignorar — navigator.vibrate no está disponible en todos los entornos
  }
}

/** Encuentra el DropFolderTarget más cercano bajo un punto de pantalla */
function findDropTarget(x: number, y: number): Element | null {
  // Ocultar el ghost temporalmente para que elementFromPoint no lo devuelva
  const ghost = document.getElementById("coragem-touch-ghost");
  const prevDisplay = ghost?.style.display ?? "";
  if (ghost) ghost.style.display = "none";

  const el = document.elementFromPoint(x, y);

  if (ghost) ghost.style.display = prevDisplay;

  return el?.closest("[data-drop-target]") ?? null;
}

/** Dispara el evento sintético de drop sobre un elemento destino */
function dispatchTouchDrop(target: Element, publicIds: string[]): void {
  const event = new CustomEvent<TouchDropDetail>(TOUCH_DROP_EVENT, {
    bubbles:    true,
    cancelable: true,
    detail:     { publicIds },
  });
  target.dispatchEvent(event);
}

/* ── Component ── */
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

  /* ── Estado del long press / touch drag ── */
  const longPressTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos   = useRef<{ x: number; y: number } | null>(null);
  const isTouchDragging = useRef(false);
  const lastDropTarget  = useRef<Element | null>(null);

  /* ── Shared: obtener IDs a arrastrar ── */
  const getDraggedIds = useCallback((): string[] => {
    if (isSelected && selectedIds.size > 1) return Array.from(selectedIds);
    return [asset.publicId];
  }, [asset.publicId, isSelected, selectedIds]);

  /* ── Shared: crear y añadir ghost al DOM ── */
  const createGhost = useCallback((ids: string[]): HTMLDivElement => {
    const ghost = document.createElement("div");
    ghost.id        = "coragem-touch-ghost";
    ghost.className = styles.dragGhost;
    ghost.textContent = ids.length > 1 ? `${ids.length} imágenes` : asset.displayName;
    document.body.appendChild(ghost);
    return ghost;
  }, [asset.displayName]);

  /* ── Shared: limpiar ghost y reset del drop target resaltado ── */
  const cleanupTouchDrag = useCallback(() => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    // Quitar el highlight del último target activo
    if (lastDropTarget.current) {
      lastDropTarget.current.dispatchEvent(
        new CustomEvent("coragem:touchdragleave", { bubbles: true })
      );
      lastDropTarget.current = null;
    }
    isTouchDragging.current = false;
  }, []);

  /* ════════════════════════════════════════════
   * DESKTOP — HTML5 Drag API
   * ════════════════════════════════════════════ */

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const ids = getDraggedIds();

    if (!isSelected) onToggleSelect(asset.publicId);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(DRAG_DATA_KEY, JSON.stringify({ publicIds: ids }));

    const ghost = createGhost(ids);
    ghostRef.current = ghost;
    e.dataTransfer.setDragImage(ghost, -8, -8);

    requestAnimationFrame(() => {
      if (ghostRef.current) {
        document.body.removeChild(ghostRef.current);
        ghostRef.current = null;
      }
    });
  }, [getDraggedIds, isSelected, onToggleSelect, asset.publicId, createGhost]);

  const handleDragEnd = useCallback(() => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
  }, []);

  /* ════════════════════════════════════════════
   * MÓVIL — Touch drag con long press
   * ════════════════════════════════════════════ */

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    isTouchDragging.current = false;

    longPressTimer.current = setTimeout(() => {
      // Long press cumplido → iniciar drag táctil
      const ids = getDraggedIds();
      if (!isSelected) onToggleSelect(asset.publicId);

      vibrateIfSupported(40);

      const ghost = createGhost(ids);
      ghostRef.current = ghost;

      // Posicionar el ghost sobre el dedo
      if (touchStartPos.current) {
        ghost.style.position = "fixed";
        ghost.style.left = `${touchStartPos.current.x + 12}px`;
        ghost.style.top  = `${touchStartPos.current.y - 20}px`;
        // Sobrescribir el off-screen del CSS para mostrarlo
        ghost.style.top  = `${touchStartPos.current.y - 20}px`;
        ghost.style.left = `${touchStartPos.current.x + 12}px`;
      }

      isTouchDragging.current = true;
    }, LONG_PRESS_MS);
  }, [getDraggedIds, isSelected, onToggleSelect, asset.publicId, createGhost]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];

    // Cancelar long press si el dedo se mueve antes de que se active
    if (!isTouchDragging.current && longPressTimer.current) {
      const dx = touch.clientX - (touchStartPos.current?.x ?? 0);
      const dy = touch.clientY - (touchStartPos.current?.y ?? 0);
      if (Math.hypot(dx, dy) > MOVE_CANCEL_PX) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        return;
      }
    }

    if (!isTouchDragging.current) return;

    // Prevenir scroll mientras arrastramos
    e.preventDefault();

    // Mover el ghost siguiendo el dedo
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX + 12}px`;
      ghostRef.current.style.top  = `${touch.clientY - 20}px`;
    }

    // Resaltar el drop target bajo el dedo
    const target = findDropTarget(touch.clientX, touch.clientY);

    if (target !== lastDropTarget.current) {
      // Quitar highlight del target anterior
      if (lastDropTarget.current) {
        lastDropTarget.current.dispatchEvent(
          new CustomEvent("coragem:touchdragleave", { bubbles: true })
        );
      }
      // Aplicar highlight al nuevo target
      if (target) {
        target.dispatchEvent(
          new CustomEvent("coragem:touchdragenter", { bubbles: true })
        );
      }
      lastDropTarget.current = target;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Cancelar el timer si el long press no se completó
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!isTouchDragging.current) return;

    const touch = e.changedTouches[0];
    const target = findDropTarget(touch.clientX, touch.clientY);

    if (target) {
      dispatchTouchDrop(target, getDraggedIds());
    }

    cleanupTouchDrag();
  }, [getDraggedIds, cleanupTouchDrag]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    cleanupTouchDrag();
  }, [cleanupTouchDrag]);

  return (
    <div
      ref={(el) => {
        (wrapRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
        cardRefCallback(asset.publicId, el);
      }}
      /* Desktop drag */
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      /* Touch drag */
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className={`${styles.draggable} ${isTouchDragging.current ? styles.dragging : ""}`}
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