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
      console.log("[PatternLock] nodeCenters recalculados:", nodeCenters.current.length, "nodos");
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
    console.log("[PatternLock] doReset() — limpiando grid");
    isDrawing.current  = false;
    patternRef.current = [];
    setPattern([]);
    setState("idle");
    setCursor(null);
    setStatusMsg("Dibuja tu patrón para continuar");
  }, []);

  const resetPattern = useCallback(() => {
    console.log("[PatternLock] resetPattern() llamado externamente");
    clearScheduledReset();
    doReset();
  }, [clearScheduledReset, doReset]);

  const scheduleReset = useCallback((delay: number) => {
    console.log(`[PatternLock] scheduleReset() en ${delay}ms`);
    clearScheduledReset();
    resetTimer.current = setTimeout(doReset, delay);
  }, [clearScheduledReset, doReset]);

  const relCoords = useCallback((e: MouseEvent | React.MouseEvent | Touch): Point => {
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
    console.log("[PatternLock] finishDraw() — patternRef.current:", [...patternRef.current]);
    isDrawing.current = false;
    setCursor(null);

    const current = patternRef.current;

    if (current.length < MIN_NODES) {
      console.log(`[PatternLock] finishDraw() — INSUFICIENTE (${current.length} < ${MIN_NODES}), estado → error`);
      setState("error");
      setStatusMsg(`Conecta al menos ${MIN_NODES} puntos`);
      scheduleReset(1300);
      return;
    }

    console.log(`[PatternLock] finishDraw() — OK (${current.length} nodos), estado → success`);
    setState("success");
    setStatusMsg("Patrón registrado ✓");
  }, [scheduleReset]);

  useEffect(() => {
    const onEnd = () => {
      if (isDrawing.current) {
        console.log("[PatternLock] mouseup/touchend detectado mientras dibujaba");
        finishDraw();
      }
    };
    window.addEventListener("mouseup",  onEnd);
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("mouseup",  onEnd);
      window.removeEventListener("touchend", onEnd);
    };
  }, [finishDraw]);

  const handleWrapperMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state === "drawing") return;

    clearScheduledReset();

    const pos  = relCoords(e);
    const node = hitNode(pos);

    isDrawing.current  = true;
    patternRef.current = node !== null ? [node] : [];

    console.log("[PatternLock] mousedown — nodo inicial:", node, "pos:", pos);

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
      console.log("[PatternLock] mousemove — nuevo nodo:", node, "patrón:", [...patternRef.current]);
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