"use client";

/**
 * src/hooks/admin/usePatternLock.ts
 *
 * Encapsula toda la lógica de interacción del patrón de desbloqueo:
 *   - Cálculo de posiciones de nodos relativas al wrapper
 *   - Detección de hit por proximidad
 *   - Gestión del estado del patrón (idle → drawing → success/error)
 *   - Listeners globales de mouseup
 *   - Timer de reset automático
 *
 * El componente visual (PatternLock.tsx) solo consume el estado
 * y los handlers que este hook expone — no contiene lógica propia.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import type { Point, PatternState, PatternLockState, PatternLockHandlers } from "@/types/admin";

/* ─── Constants ─────────────────────────────────────────────────── */
const NODE_COUNT  = 9;
const MIN_NODES   = 4;
const HIT_RADIUS  = 28; // px — radio de activación por nodo

/* ─── Pure helpers ──────────────────────────────────────────────── */

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Calcula los centros de los 9 nodos en coordenadas relativas
 * al wrapper. Usa el tamaño real del elemento para ser preciso
 * independientemente del tamaño del grid en pantalla.
 *
 * Grid 3×3: los centros caen en 1/6, 3/6, 5/6 de cada eje.
 */
function calcNodeCenters(wrapperEl: HTMLDivElement): Point[] {
  const { width: w, height: h } = wrapperEl.getBoundingClientRect();
  const xs = [w / 6, w / 2, (w * 5) / 6];
  const ys = [h / 6, h / 2, (h * 5) / 6];
  const centers: Point[] = [];
  for (const y of ys) for (const x of xs) centers.push({ x, y });
  return centers;
}

/* ─── Hook ──────────────────────────────────────────────────────── */

export function usePatternLock(): PatternLockState & PatternLockHandlers {
  const [pattern,   setPattern]   = useState<number[]>([]);
  const [state,     setState]     = useState<PatternState>("idle");
  const [cursor,    setCursor]    = useState<Point | null>(null);
  const [statusMsg, setStatusMsg] = useState("Dibuja tu patrón para continuar");

  /*
   * patternRef: ref paralela a `pattern` para poder leer el valor
   * actual dentro de listeners globales (mouseup) sin cerrar sobre
   * el estado obsoleto de un closure.
   */
  const patternRef  = useRef<number[]>([]);
  const nodeCenters = useRef<Point[]>([]);
  const isDrawing   = useRef(false);
  const resetTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const svgRef     = useRef<SVGSVGElement>(null);

  /* ── Calcular centros al montar y en resize ── */
  const recalc = useCallback(() => {
    if (wrapperRef.current) {
      nodeCenters.current = calcNodeCenters(wrapperRef.current);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(recalc, 50);
    window.addEventListener("resize", recalc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", recalc);
    };
  }, [recalc]);

  /* ── Reset helpers ── */
  const clearScheduledReset = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const scheduleReset = useCallback((delay: number) => {
    clearScheduledReset();
    resetTimer.current = setTimeout(() => {
      patternRef.current = [];
      setPattern([]);
      setState("idle");
      setCursor(null);
      setStatusMsg("Dibuja tu patrón para continuar");
    }, delay);
  }, [clearScheduledReset]);

  /* ── Coordenadas relativas al wrapper ── */
  const relCoords = useCallback((e: MouseEvent | React.MouseEvent): Point => {
    const rect = wrapperRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  /* ── Nodo más cercano dentro del radio de hit ── */
  const hitNode = useCallback((pos: Point): number | null => {
    for (let i = 0; i < nodeCenters.current.length; i++) {
      if (dist(pos, nodeCenters.current[i]) < HIT_RADIUS) return i;
    }
    return null;
  }, []);

  /* ── Finalizar dibujo ── */
  const finishDraw = useCallback(() => {
    isDrawing.current = false;
    setCursor(null);

    const current = patternRef.current;

    if (current.length < MIN_NODES) {
      setState("error");
      setStatusMsg(`Conecta al menos ${MIN_NODES} puntos`);
      scheduleReset(1300);
      return;
    }

    // Por ahora: cualquier patrón con los nodos suficientes es aceptado.
    // Aquí irá la validación contra el patrón guardado cuando exista auth real.
    setState("success");
    setStatusMsg("Patrón registrado ✓");
    scheduleReset(1700);
  }, [scheduleReset]);

  /* ── Listener global de mouseup ── */
  useEffect(() => {
    const onMouseUp = () => {
      if (isDrawing.current) finishDraw();
    };
    window.addEventListener("mouseup", onMouseUp);
    return () => window.removeEventListener("mouseup", onMouseUp);
  }, [finishDraw]);

  /* ── Handler: mousedown en el wrapper ── */
  const handleWrapperMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state === "drawing") return;

    clearScheduledReset();

    const pos  = relCoords(e);
    const node = hitNode(pos);

    isDrawing.current  = true;
    patternRef.current = node !== null ? [node] : [];

    setState("drawing");
    setStatusMsg("");
    setCursor(pos);
    setPattern([...patternRef.current]);
  }, [state, clearScheduledReset, relCoords, hitNode]);

  /* ── Handler: mousemove en el wrapper ── */
  const handleWrapperMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing.current) return;

    const pos  = relCoords(e);
    const node = hitNode(pos);

    setCursor(pos);

    if (node !== null && !patternRef.current.includes(node)) {
      patternRef.current = [...patternRef.current, node];
      setPattern([...patternRef.current]);
    }
  }, [relCoords, hitNode]);

  return {
    // State
    pattern,
    state,
    cursor,
    statusMsg,
    // Refs
    wrapperRef,
    svgRef,
    nodeCenters,
    // Handlers
    handleWrapperMouseDown,
    handleWrapperMouseMove,
  };
}