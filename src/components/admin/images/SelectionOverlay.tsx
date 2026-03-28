"use client";

/**
 * src/components/admin/images/SelectionOverlay.tsx
 *
 * Overlay de selección por área (rubber-band) sobre el grid de assets.
 *
 * Comportamiento:
 *   - mousedown sobre el fondo del grid (no sobre una tarjeta) → inicia rectángulo
 *   - mousemove → actualiza el rectángulo visual (position: fixed, pointer-events: none)
 *   - mouseup → calcula qué publicIds intersectan el rectángulo y llama onSelect(ids)
 *
 * El componente necesita acceso a las posiciones de las tarjetas:
 * Se pasa assetRefs: Map<publicId, HTMLElement> construido por ImagesPage.
 *
 * No interfiere con:
 *   - Clicks directos sobre las tarjetas (stopPropagation en las propias tarjetas)
 *   - El breadcrumb de navegación (está fuera del grid)
 */

import { useRef, useCallback, useEffect } from "react";
import styles from "./SelectionOverlay.module.css";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SelectionOverlayProps {
  /** Ref del contenedor del grid — el overlay escucha sus eventos */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Map de publicId → elemento DOM de cada AssetCard */
  assetRefs:    React.RefObject<Map<string, HTMLElement>>;
  /** Callback con los publicIds que intersectan el área seleccionada */
  onSelect:     (publicIds: string[]) => void;
  /** Si es false el overlay está desactivado (ej. durante un drag) */
  enabled?:     boolean;
}

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  return !(
    a.right  < b.x       ||
    a.left   > b.x + b.w ||
    a.bottom < b.y       ||
    a.top    > b.y + b.h
  );
}

export function SelectionOverlay({
  containerRef,
  assetRefs,
  onSelect,
  enabled = true,
}: SelectionOverlayProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const startRef    = useRef<{ x: number; y: number } | null>(null);
  const isDragging  = useRef(false);

  const updateOverlay = useCallback((rect: Rect) => {
    const el = overlayRef.current;
    if (!el) return;
    el.style.left    = `${Math.min(rect.x, rect.x + rect.w)}px`;
    el.style.top     = `${Math.min(rect.y, rect.y + rect.h)}px`;
    el.style.width   = `${Math.abs(rect.w)}px`;
    el.style.height  = `${Math.abs(rect.h)}px`;
    el.style.display = "block";
  }, []);

  const hideOverlay = useCallback(() => {
    const el = overlayRef.current;
    if (el) el.style.display = "none";
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const onMouseDown = (e: MouseEvent) => {
      /* Solo botón izquierdo y sobre el fondo del grid (no sobre una tarjeta) */
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      /* Si el click fue sobre un botón/imagen dentro de una tarjeta, ignorar */
      if (target.closest("button")) return;

      startRef.current = { x: e.clientX, y: e.clientY };
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startRef.current) return;

      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;

      /* Activar rubber-band solo si hay movimiento real (> 4px) */
      if (!isDragging.current && Math.hypot(dx, dy) < 4) return;
      isDragging.current = true;

      updateOverlay({
        x: startRef.current.x,
        y: startRef.current.y,
        w: dx,
        h: dy,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!startRef.current) return;

      if (isDragging.current) {
        /* Calcular rectángulo de selección normalizado */
        const selRect: Rect = {
          x: Math.min(startRef.current.x, e.clientX),
          y: Math.min(startRef.current.y, e.clientY),
          w: Math.abs(e.clientX - startRef.current.x),
          h: Math.abs(e.clientY - startRef.current.y),
        };

        /* Encontrar los assets que intersectan */
        const selected: string[] = [];
        assetRefs.current?.forEach((el, publicId) => {
          const domRect = el.getBoundingClientRect();
          if (rectsIntersect(domRect, selRect)) {
            selected.push(publicId);
          }
        });

        if (selected.length > 0) {
          onSelect(selected);
        }
      }

      hideOverlay();
      startRef.current   = null;
      isDragging.current = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [containerRef, assetRefs, onSelect, enabled, updateOverlay, hideOverlay]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}