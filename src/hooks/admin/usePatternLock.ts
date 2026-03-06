"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Point, PatternState, PatternLockState, PatternLockHandlers } from "@/types/admin";

const MIN_NODES  = 4;
const HIT_RADIUS = 28;

function dist(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function calcNodeCenters(wrapperEl: HTMLDivElement): Point[] {
  const { width: w, height: h } = wrapperEl.getBoundingClientRect();
  const xs = [w / 6, w / 2, (w * 5) / 6];
  const ys = [h / 6, h / 2, (h * 5) / 6];
  const centers: Point[] = [];
  for (const y of ys) for (const x of xs) centers.push({ x, y });
  return centers;
}

export type UsePatternLockReturn = PatternLockState & PatternLockHandlers & {
  resetPattern: () => void;
  patternRef: React.RefObject<number[]>;
};

export function usePatternLock(): UsePatternLockReturn {
  const [pattern,   setPattern]   = useState<number[]>([]);
  const [state,     setState]     = useState<PatternState>("idle");
  const [cursor,    setCursor]    = useState<Point | null>(null);
  const [statusMsg, setStatusMsg] = useState("Dibuja tu patrón para continuar");

  const patternRef  = useRef<number[]>([]);
  const nodeCenters = useRef<Point[]>([]);
  const isDrawing   = useRef(false);
  const resetTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const svgRef      = useRef<SVGSVGElement>(null);

  const recalc = useCallback(() => {
    if (wrapperRef.current) {
      nodeCenters.current = calcNodeCenters(wrapperRef.current);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(recalc, 50);
    window.addEventListener("resize", recalc);
    return () => { clearTimeout(t); window.removeEventListener("resize", recalc); };
  }, [recalc]);

  const clearScheduledReset = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const doReset = useCallback(() => {
    isDrawing.current  = false;
    patternRef.current = [];
    setPattern([]);
    setState("idle");
    setCursor(null);
    setStatusMsg("Dibuja tu patrón para continuar");
  }, []);

  const resetPattern = useCallback(() => {
    clearScheduledReset();
    doReset();
  }, [clearScheduledReset, doReset]);

  const scheduleReset = useCallback((delay: number) => {
    clearScheduledReset();
    resetTimer.current = setTimeout(doReset, delay);
  }, [clearScheduledReset, doReset]);

  // Coordenadas relativas al wrapper — acepta MouseEvent, React.MouseEvent o Touch
  const relCoords = useCallback((e: { clientX: number; clientY: number }): Point => {
    const rect = wrapperRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const hitNode = useCallback((pos: Point): number | null => {
    for (let i = 0; i < nodeCenters.current.length; i++) {
      if (dist(pos, nodeCenters.current[i]) < HIT_RADIUS) return i;
    }
    return null;
  }, []);

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

    setState("success");
    setStatusMsg("Patrón registrado ✓");
  }, [scheduleReset]);

  // ── Eventos globales: mouseup + touchend ──────────────────────────
  useEffect(() => {
    const onEnd = () => {
      if (isDrawing.current) finishDraw();
    };
    window.addEventListener("mouseup",  onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mouseup",  onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [finishDraw]);

  // ── Eventos táctiles registrados directamente en el wrapper ──────
  // Se usa { passive: false } para poder llamar preventDefault() y
  // evitar que el scroll de la página interfiera con el trazado.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      // Solo un toque activo; ignorar multi-touch
      if (e.touches.length !== 1) return;
      e.preventDefault();

      clearScheduledReset();

      const touch = e.touches[0];
      const pos   = relCoords(touch);
      const node  = hitNode(pos);

      isDrawing.current  = true;
      patternRef.current = node !== null ? [node] : [];

      setState("drawing");
      setStatusMsg("");
      setCursor(pos);
      setPattern([...patternRef.current]);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDrawing.current || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const pos   = relCoords(touch);
      const node  = hitNode(pos);

      setCursor(pos);

      if (node !== null && !patternRef.current.includes(node)) {
        patternRef.current = [...patternRef.current, node];
        setPattern([...patternRef.current]);
      }
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove",  onTouchMove,  { passive: false });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove",  onTouchMove);
    };
  // relCoords y hitNode son estables (useCallback sin deps cambiantes),
  // pero incluirlos garantiza que el efecto se rehidrate si el wrapper
  // se desmonta y remonta (ej. hot reload en dev).
  }, [relCoords, hitNode, clearScheduledReset]);

  // ── Handlers mouse (desktop) ─────────────────────────────────────
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
    pattern,
    state,
    cursor,
    statusMsg,
    wrapperRef,
    svgRef,
    nodeCenters,
    handleWrapperMouseDown,
    handleWrapperMouseMove,
    resetPattern,
    patternRef,
  };
}