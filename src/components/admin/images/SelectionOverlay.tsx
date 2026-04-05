"use client";

/**
 * src/components/admin/images/SelectionOverlay.tsx
 *
 * Overlay de selección por área (rubber-band) sobre el grid de assets.
 *
 * Comportamiento:
 *   - mousedown sobre cualquier área vacía de `listenRef` → inicia rectángulo
 *   - mousemove → actualiza el rectángulo visual (position: fixed, pointer-events: none)
 *   - mouseup  → finaliza la selección; si no hubo arrastre real, limpia la selección
 *
 * Selección dinámica:
 *   En cada frame del rAF se recalculan las intersecciones y se llama a onSelect
 *   con los ids actuales, de modo que los checkboxes se actualizan en tiempo real
 *   mientras el rectángulo crece o encoge.
 *
 * Corrección de scroll:
 *   El punto de anclaje se guarda en coordenadas de viewport. En cada frame se
 *   compensa el desplazamiento acumulado del scroll container desde el mousedown,
 *   de modo que el borde superior del rectángulo "sigue" el contenido y captura
 *   correctamente los assets que van entrando en el área de selección.
 *
 *   Fórmula:
 *     anchorY_actual = anchorY_viewport + (scrollTop_actual - scrollTop_inicio)
 *
 * Limpiar selección al hacer click en área vacía:
 *   Si el mouseup ocurre sin arrastre real (desplazamiento < 4px), se llama a
 *   onClearSelection para deseleccionar todo, siempre que el click no haya sido
 *   sobre un asset, botón, input u otro elemento interactivo.
 *
 * Auto-scroll:
 *   Mientras el usuario arrastra cerca del borde superior/inferior del viewport,
 *   un loop rAF scrollea el contenedor `listenRef` automáticamente y expande
 *   el rectángulo de selección para capturar assets fuera del campo de visión.
 *
 * Props:
 *   listenRef        → contenedor scrolleable donde se escucha mousedown
 *   containerRef     → el section/div del grid — solo para delimitar el área activa
 *   assetRefs        → Map<publicId, HTMLElement> construido por ImagesPage
 *   onSelect         → callback con los publicIds que intersectan el área (reemplaza)
 *   onClearSelection → callback para limpiar la selección al hacer click en vacío
 *   enabled          → si es false el overlay está desactivado (ej. durante un drag)
 */

import { useRef, useCallback, useEffect } from "react";
import styles from "./SelectionOverlay.module.css";

/* ── Constantes ── */
const AUTO_SCROLL_ZONE  = 80;
const AUTO_SCROLL_SPEED = 12;
const DRAG_THRESHOLD    = 4;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SelectionOverlayProps {
  listenRef:        React.RefObject<HTMLElement | null>;
  containerRef:     React.RefObject<HTMLDivElement | null>;
  assetRefs:        React.RefObject<Map<string, HTMLElement>>;
  onSelect:         (publicIds: string[]) => void;
  onClearSelection: () => void;
  enabled?:         boolean;
}

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  const bRight  = b.x + b.w;
  const bBottom = b.y + b.h;
  return !(
    a.right  < b.x    ||
    a.left   > bRight ||
    a.bottom < b.y    ||
    a.top    > bBottom
  );
}

function getAutoScrollDelta(clientY: number): number {
  const vh = window.innerHeight;
  if (clientY < AUTO_SCROLL_ZONE) {
    return -AUTO_SCROLL_SPEED * (1 - clientY / AUTO_SCROLL_ZONE);
  }
  if (clientY > vh - AUTO_SCROLL_ZONE) {
    return AUTO_SCROLL_SPEED * (1 - (vh - clientY) / AUTO_SCROLL_SPEED);
  }
  return 0;
}

export function SelectionOverlay({
  listenRef,
  containerRef,
  assetRefs,
  onSelect,
  onClearSelection,
  enabled = true,
}: SelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Coordenadas de viewport en el momento del mousedown */
  const anchorViewport = useRef<{ x: number; y: number } | null>(null);
  /* scrollTop del contenedor en el momento del mousedown */
  const anchorScrollTop = useRef<number>(0);
  /* Posición actual del mouse en coordenadas de viewport */
  const currentViewport = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDragging = useRef(false);
  const rafId      = useRef<number | null>(null);

  /* ── Helpers del overlay ── */

  const showOverlay = useCallback((rect: Rect) => {
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

  /* ── Cálculo de intersecciones ──
   * Recibe el rectángulo en coordenadas de viewport (position: fixed),
   * que coincide exactamente con getBoundingClientRect(). */
  const computeSelection = useCallback((viewportRect: Rect): string[] => {
    const normalizedRect: Rect = {
      x: Math.min(viewportRect.x, viewportRect.x + viewportRect.w),
      y: Math.min(viewportRect.y, viewportRect.y + viewportRect.h),
      w: Math.abs(viewportRect.w),
      h: Math.abs(viewportRect.h),
    };

    const selected: string[] = [];
    assetRefs.current?.forEach((el, publicId) => {
      const domRect = el.getBoundingClientRect();
      if (rectsIntersect(domRect, normalizedRect)) {
        selected.push(publicId);
      }
    });
    return selected;
  }, [assetRefs]);

  /* ── Loop rAF: auto-scroll + repintado + selección en tiempo real ── */

  const startLoop = useCallback(() => {
    const scrollEl = listenRef.current;
    if (!scrollEl) return;

    const tick = () => {
      if (!isDragging.current || !anchorViewport.current) return;

      /* Auto-scroll */
      const delta = getAutoScrollDelta(currentViewport.current.y);
      if (delta !== 0) {
        scrollEl.scrollBy({ top: delta, behavior: "instant" });
      }

      /* Compensar el scroll acumulado desde el mousedown.
       * Si el usuario scrolleó 100px hacia abajo, el anchor visual
       * debe subir 100px en el viewport para "seguir" al contenido. */
      const scrollCompensation = scrollEl.scrollTop - anchorScrollTop.current;

      const viewportRect: Rect = {
        x: anchorViewport.current.x,
        y: anchorViewport.current.y - scrollCompensation,
        w: currentViewport.current.x - anchorViewport.current.x,
        h: currentViewport.current.y - (anchorViewport.current.y - scrollCompensation),
      };

      showOverlay(viewportRect);

      /* Selección dinámica en tiempo real */
      const selected = computeSelection(viewportRect);
      onSelect(selected);

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
  }, [listenRef, showOverlay, computeSelection, onSelect]);

  const stopLoop = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  /* ── Listeners globales de mouse ── */

  useEffect(() => {
    const listenEl = listenRef.current;
    if (!listenEl || !enabled) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      if (target.closest("button, input, a, [role='checkbox']")) return;

      anchorViewport.current  = { x: e.clientX, y: e.clientY };
      anchorScrollTop.current = listenEl.scrollTop;
      currentViewport.current = { x: e.clientX, y: e.clientY };
      isDragging.current      = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!anchorViewport.current) return;

      currentViewport.current = { x: e.clientX, y: e.clientY };

      const dx = e.clientX - anchorViewport.current.x;
      const dy = e.clientY - anchorViewport.current.y;

      if (!isDragging.current && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

      if (!isDragging.current) {
        isDragging.current = true;
        startLoop();
      }
    };

    const onMouseUp = () => {
      if (!anchorViewport.current) return;

      if (!isDragging.current) {
        /* Click sin arrastre real → limpiar selección */
        onClearSelection();
      }

      stopLoop();
      hideOverlay();
      anchorViewport.current = null;
      isDragging.current     = false;
    };

    listenEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove",   onMouseMove);
    window.addEventListener("mouseup",     onMouseUp);

    return () => {
      listenEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove",   onMouseMove);
      window.removeEventListener("mouseup",     onMouseUp);
      stopLoop();
    };
  }, [
    listenRef, enabled,
    startLoop, stopLoop,
    hideOverlay, onClearSelection,
  ]);

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}