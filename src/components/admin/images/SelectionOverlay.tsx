"use client";

/**
 * src/components/admin/images/SelectionOverlay.tsx
 *
 * Overlay de selección por área (rubber-band) sobre el grid de assets.
 *
 * Comportamiento:
 *   - mousedown sobre cualquier área vacía de `listenRef` → inicia rectángulo
 *   - mousemove → actualiza el rectángulo visual (position: fixed, pointer-events: none)
 *   - mouseup  → calcula qué publicIds intersectan el rectángulo y llama onSelect(ids)
 *
 * Auto-scroll:
 *   Mientras el usuario arrastra cerca del borde superior/inferior del viewport,
 *   un loop rAF scrollea el contenedor `listenRef` automáticamente y expande
 *   el rectángulo de selección para capturar assets fuera del campo de visión.
 *   La intersección usa getBoundingClientRect() en cada frame, por lo que
 *   funciona correctamente tanto con scroll manual como con auto-scroll.
 *
 * Props:
 *   listenRef   → contenedor scrolleable donde se escucha mousedown
 *                 (debe ser el scroll container del dashboard, p.ej. el main wrapper)
 *   containerRef → el section/div del grid de assets — solo para delimitar
 *                  dónde tiene sentido iniciar el rubber-band
 *   assetRefs   → Map<publicId, HTMLElement> construido por ImagesPage
 *   onSelect    → callback con los publicIds que intersectan el área
 *   enabled     → si es false el overlay está desactivado (ej. durante un drag)
 */

import { useRef, useCallback, useEffect } from "react";
import styles from "./SelectionOverlay.module.css";

/* ── Constantes ── */
/** Zona en px desde el borde del viewport que activa el auto-scroll */
const AUTO_SCROLL_ZONE = 80;
/** Velocidad máxima del auto-scroll en px/frame */
const AUTO_SCROLL_SPEED = 12;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SelectionOverlayProps {
  /**
   * Contenedor scrolleable donde se escucha mousedown.
   * Debe abarcar toda la zona de la página de imágenes
   * (el scroll container del dashboard).
   */
  listenRef:    React.RefObject<HTMLElement | null>;
  /**
   * El section/div del grid de assets.
   * Solo se usa para delimitar si tiene sentido iniciar el rubber-band:
   * si el mousedown ocurre fuera del listenRef, se ignora.
   */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Map de publicId → elemento DOM de cada AssetCard */
  assetRefs:    React.RefObject<Map<string, HTMLElement>>;
  /** Callback con los publicIds que intersectan el área seleccionada */
  onSelect:     (publicIds: string[]) => void;
  /** Si es false el overlay está desactivado (ej. durante un drag) */
  enabled?:     boolean;
}

function rectsIntersect(a: DOMRect, b: Rect): boolean {
  const bRight  = b.x + b.w;
  const bBottom = b.y + b.h;
  return !(
    a.right  < b.x      ||
    a.left   > bRight   ||
    a.bottom < b.y      ||
    a.top    > bBottom
  );
}

/** Calcula la velocidad de auto-scroll según la posición del cursor */
function getAutoScrollDelta(clientY: number): number {
  const vh = window.innerHeight;
  if (clientY < AUTO_SCROLL_ZONE) {
    // Zona superior — scroll hacia arriba
    return -AUTO_SCROLL_SPEED * (1 - clientY / AUTO_SCROLL_ZONE);
  }
  if (clientY > vh - AUTO_SCROLL_ZONE) {
    // Zona inferior — scroll hacia abajo
    return AUTO_SCROLL_SPEED * (1 - (vh - clientY) / AUTO_SCROLL_ZONE);
  }
  return 0;
}

export function SelectionOverlay({
  listenRef,
  containerRef,
  assetRefs,
  onSelect,
  enabled = true,
}: SelectionOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Posición del mousedown en coordenadas de viewport */
  const startViewport = useRef<{ x: number; y: number } | null>(null);
  /* Posición actual del mouse en coordenadas de viewport */
  const currentViewport = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const isDragging      = useRef(false);
  const rafId           = useRef<number | null>(null);

  /* ── Helpers del overlay ── */

  const showOverlay = useCallback((rect: Rect) => {
    const el = overlayRef.current;
    if (!el) return;
    const left   = Math.min(rect.x, rect.x + rect.w);
    const top    = Math.min(rect.y, rect.y + rect.h);
    const width  = Math.abs(rect.w);
    const height = Math.abs(rect.h);
    el.style.left    = `${left}px`;
    el.style.top     = `${top}px`;
    el.style.width   = `${width}px`;
    el.style.height  = `${height}px`;
    el.style.display = "block";
  }, []);

  const hideOverlay = useCallback(() => {
    const el = overlayRef.current;
    if (el) el.style.display = "none";
  }, []);

  /* ── Loop de auto-scroll + repintado del overlay ── */

  const startLoop = useCallback(() => {
    const scrollEl = listenRef.current;
    if (!scrollEl) return;

    const tick = () => {
      if (!isDragging.current || !startViewport.current) return;

      /* Auto-scroll */
      const delta = getAutoScrollDelta(currentViewport.current.y);
      if (delta !== 0) {
        scrollEl.scrollBy({ top: delta, behavior: "instant" });
      }

      /* Rect visual en coordenadas de viewport (position: fixed) */
      showOverlay({
        x: startViewport.current.x,
        y: startViewport.current.y,
        w: currentViewport.current.x - startViewport.current.x,
        h: currentViewport.current.y - startViewport.current.y,
      });

      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
  }, [listenRef, showOverlay]);

  const stopLoop = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  }, []);

  /* ── Cálculo de intersecciones ── */

  const computeSelection = useCallback((): string[] => {
    if (!startViewport.current) return [];

    const cur = currentViewport.current;
    const selRect: Rect = {
      x: Math.min(startViewport.current.x, cur.x),
      y: Math.min(startViewport.current.y, cur.y),
      w: Math.abs(cur.x - startViewport.current.x),
      h: Math.abs(cur.y - startViewport.current.y),
    };

    const selected: string[] = [];
    assetRefs.current?.forEach((el, publicId) => {
      /* getBoundingClientRect() devuelve coordenadas de viewport actualizadas,
         así que funciona correctamente después de cualquier scroll */
      const domRect = el.getBoundingClientRect();
      if (rectsIntersect(domRect, selRect)) {
        selected.push(publicId);
      }
    });
    return selected;
  }, [assetRefs]);

  /* ── Listeners globales de mouse ── */

  useEffect(() => {
    const listenEl = listenRef.current;
    if (!listenEl || !enabled) return;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;

      const target = e.target as HTMLElement;
      /* Ignorar clicks sobre botones, inputs o cualquier elemento interactivo */
      if (target.closest("button, input, a, [role='checkbox']")) return;

      startViewport.current   = { x: e.clientX, y: e.clientY };
      currentViewport.current = { x: e.clientX, y: e.clientY };
      isDragging.current      = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!startViewport.current) return;

      currentViewport.current = { x: e.clientX, y: e.clientY };

      const dx = e.clientX - startViewport.current.x;
      const dy = e.clientY - startViewport.current.y;

      /* Activar rubber-band solo si hay movimiento real (> 4px) */
      if (!isDragging.current && Math.hypot(dx, dy) < 4) return;

      if (!isDragging.current) {
        isDragging.current = true;
        startLoop();
      }
    };

    const onMouseUp = () => {
      if (!startViewport.current) return;

      if (isDragging.current) {
        const selected = computeSelection();
        if (selected.length > 0) onSelect(selected);
      }

      stopLoop();
      hideOverlay();
      startViewport.current = null;
      isDragging.current    = false;
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
    computeSelection, onSelect, hideOverlay,
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