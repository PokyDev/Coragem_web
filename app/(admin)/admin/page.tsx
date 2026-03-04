"use client";

/**
 * app/(admin)/admin/page.tsx
 *
 * Pantalla de autenticación por patrón de desbloqueo.
 * Interacción: click sostenido + arrastrar sobre los nodos.
 *
 * Arquitectura de eventos:
 * - TODOS los eventos de puntero van al wrapper div (no a los botones).
 * - El SVG tiene pointer-events: none — solo dibuja, no captura nada.
 * - Los nodos son puramente visuales; su estado se controla por React.
 * - La detección de nodo activo usa coordenadas relativas al wrapper.
 */

import { useState, useRef, useCallback, useEffect } from "react";

/* ─── Types ────────────────────────────────────────────────────── */
interface Point { x: number; y: number }

type PatternState = "idle" | "drawing" | "success" | "error";

/* ─── Constants ─────────────────────────────────────────────────── */
const NODE_COUNT = 9;
const MIN_NODES  = 4;
const HIT_RADIUS = 28; // px — área de activación de cada nodo

/* ─── Helpers ───────────────────────────────────────────────────── */
function dist(a: Point, b: Point) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Calcula las posiciones centrales de los 9 nodos en coordenadas
 * relativas al wrapper, basándose en el tamaño real del elemento.
 */
function calcNodeCenters(wrapperEl: HTMLDivElement): Point[] {
  const rect = wrapperEl.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  // Grid 3x3: centros en 1/6, 3/6, 5/6 de cada eje
  const xs = [w / 6, w / 2, (w * 5) / 6];
  const ys = [h / 6, h / 2, (h * 5) / 6];
  const centers: Point[] = [];
  for (const y of ys) for (const x of xs) centers.push({ x, y });
  return centers;
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function AdminPage() {
  const [pattern,    setPattern]    = useState<number[]>([]);
  const [state,      setState]      = useState<PatternState>("idle");
  const [cursor,     setCursor]     = useState<Point | null>(null);
  const [statusMsg,  setStatusMsg]  = useState("Dibuja tu patrón para continuar");

  // Posiciones calculadas una sola vez al montar (y en resize)
  const nodeCenters  = useRef<Point[]>([]);
  const isDrawing    = useRef(false);
  // Ref paralela al state pattern para leerlo dentro de listeners globales
  const patternRef   = useRef<number[]>([]);

  const wrapperRef   = useRef<HTMLDivElement>(null);
  const svgRef       = useRef<SVGSVGElement>(null);
  const resetTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Calcular centros al montar / resize ── */
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

  /* ── Helpers de estado ── */
  const clearReset = () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  };

  const scheduleReset = useCallback((delay: number) => {
    clearReset();
    resetTimer.current = setTimeout(() => {
      setPattern([]);  patternRef.current = [];
      setState("idle");
      setCursor(null);
      setStatusMsg("Dibuja tu patrón para continuar");
    }, delay);
  }, []);

  /* ── Coordenadas relativas al wrapper ── */
  const relCoords = (e: MouseEvent | React.MouseEvent): Point => {
    const rect = wrapperRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  /* ── Nodo más cercano al punto (dentro del radio) ── */
  const hitNode = (pos: Point): number | null => {
    for (let i = 0; i < nodeCenters.current.length; i++) {
      if (dist(pos, nodeCenters.current[i]) < HIT_RADIUS) return i;
    }
    return null;
  };

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
    setState("success");
    setStatusMsg("Patrón registrado ✓");
    scheduleReset(1700);
  }, [scheduleReset]);

  /* ── Mouse up global ── */
  useEffect(() => {
    const onUp = () => { if (isDrawing.current) finishDraw(); };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [finishDraw]);

  /* ── onMouseDown en el wrapper ── */
  const handleWrapperMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (state === "drawing") return;
    clearReset();

    const pos  = relCoords(e);
    const node = hitNode(pos);

    isDrawing.current = true;
    setState("drawing");
    setStatusMsg("");
    setCursor(pos);

    if (node !== null) {
      patternRef.current = [node];
      setPattern([node]);
    } else {
      patternRef.current = [];
      setPattern([]);
    }
  }, [state]);   // eslint-disable-line react-hooks/exhaustive-deps

  /* ── onMouseMove en el wrapper ── */
  const handleWrapperMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing.current) return;
    const pos = relCoords(e);
    setCursor(pos);

    const node = hitNode(pos);
    if (node !== null && !patternRef.current.includes(node)) {
      patternRef.current = [...patternRef.current, node];
      setPattern([...patternRef.current]);
    }
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Colores por estado ── */
  const C = {
    idle:    { nodeBg: "var(--admin-surface)",      ring: "var(--admin-border)",   line: "rgba(78,196,196,0.4)",  dot: "#4a5568" },
    drawing: { nodeBg: "rgba(78,196,196,0.15)",     ring: "#4ec4c4",               line: "rgba(78,196,196,0.75)", dot: "#4ec4c4" },
    success: { nodeBg: "rgba(78,196,196,0.2)",      ring: "#4ec4c4",               line: "rgba(78,196,196,0.9)",  dot: "#4ec4c4" },
    error:   { nodeBg: "rgba(196,122,158,0.15)",    ring: "#c47a9e",               line: "rgba(196,122,158,0.75)",dot: "#c47a9e" },
  }[state];

  /* ── SVG: polyline de nodos conectados (coords relativas al wrapper) ── */
  const linePoints = pattern
    .map(i => nodeCenters.current[i])
    .filter(Boolean)
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  /* ── SVG: línea punteada último nodo → cursor ── */
  const lastCenter = pattern.length > 0 ? nodeCenters.current[pattern[pattern.length - 1]] : null;
  const trailPath = lastCenter && cursor && state === "drawing"
    ? `M${lastCenter.x},${lastCenter.y} L${cursor.x},${cursor.y}`
    : null;

  return (
    <div className="ap-root">
      <div className="ap-glow ap-glow--1" />
      <div className="ap-glow ap-glow--2" />
      <div className="ap-noise" />

      <div className="ap-card">
        {/* Marca */}
        <div className="ap-brand">
          <span className="ap-brand__logo">CORA<span>GEM</span></span>
          <span className="ap-brand__sub">Panel Administrativo</span>
        </div>

        <div className="ap-divider" />

        <p className="ap-label">Autenticación por patrón</p>

        {/* ── Wrapper: recibe TODOS los eventos de puntero ── */}
        <div
          ref={wrapperRef}
          className="ap-grid-wrap"
          onMouseDown={handleWrapperMouseDown}
          onMouseMove={handleWrapperMouseMove}
          style={{ userSelect: "none", cursor: "crosshair" }}
        >
          {/*
           * SVG: pointer-events none — solo dibuja líneas y puntos.
           * Coordenadas relativas al wrapper (mismo sistema que nodeCenters).
           */}
          <svg ref={svgRef} className="ap-svg" style={{ pointerEvents: "none" }}>
            {/* Líneas entre nodos del patrón */}
            {linePoints && (
              <polyline
                points={linePoints}
                fill="none"
                stroke={C.line}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {/* Línea punteada cursor */}
            {trailPath && (
              <path
                d={trailPath}
                fill="none"
                stroke={C.line}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeDasharray="5 5"
                opacity={0.55}
              />
            )}
            {/* Puntos sobre los nodos activos */}
            {pattern.map((idx, order) => {
              const p = nodeCenters.current[idx];
              if (!p) return null;
              return (
                <g key={`svgdot-${idx}`}>
                  {order === 0 && (
                    <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={C.dot} strokeWidth="1.5" opacity={0.4} />
                  )}
                  <circle cx={p.x} cy={p.y} r={5} fill={C.dot} />
                </g>
              );
            })}
          </svg>

          {/* Grid de nodos — puramente visuales, sin event handlers propios */}
          <div className="ap-grid">
            {Array.from({ length: NODE_COUNT }).map((_, i) => {
              const selected = pattern.includes(i);
              const isFirst  = pattern[0] === i;
              return (
                <div
                  key={i}
                  className={`ap-node ${selected ? "ap-node--on" : ""} ${isFirst ? "ap-node--first" : ""}`}
                  data-state={state}
                  aria-label={`Nodo ${i + 1}`}
                  style={{
                    "--node-bg":   selected ? C.nodeBg : "var(--admin-surface)",
                    "--node-ring": selected ? C.ring   : "var(--admin-border)",
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        </div>

        {/* Estado */}
        <div className={`ap-status ap-status--${state}`}>
          {state === "idle"    && <span className="ap-status__dot" />}
          {state === "error"   && <span className="ap-status__icon">✕</span>}
          {state === "success" && <span className="ap-status__icon ap-status__icon--ok">✓</span>}
          <span>{statusMsg}</span>
        </div>

        <p className="ap-hint">Mantén el click y arrastra para conectar los puntos</p>
      </div>

      <p className="ap-footer">Coragem Accessories &mdash; {new Date().getFullYear()}</p>

      <style>{`
        /* ── Root ───────────────────────────────────────────── */
        .ap-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem 3rem;
          background-color: var(--admin-bg);
          position: relative;
          overflow: hidden;
        }

        /* ── Glows ──────────────────────────────────────────── */
        .ap-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .ap-glow--1 {
          top: 10%;  left: 20%;
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(78,196,196,0.06) 0%, transparent 70%);
        }
        .ap-glow--2 {
          bottom: 5%; right: 15%;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(196,122,158,0.05) 0%, transparent 70%);
        }

        /* ── Noise ──────────────────────────────────────────── */
        .ap-noise {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── Card ───────────────────────────────────────────── */
        .ap-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 20px;
          padding: 2.5rem 2.25rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow:
            0 0 0 1px rgba(78,196,196,0.07),
            0 32px 64px rgba(0,0,0,0.22),
            0 2px 4px rgba(0,0,0,0.12);
        }

        /* ── Brand ──────────────────────────────────────────── */
        .ap-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 1.4rem;
        }
        .ap-brand__logo {
          font-family: var(--font-jost), sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--admin-text);
        }
        .ap-brand__logo span { color: var(--admin-accent); }
        .ap-brand__sub {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--admin-text-dim);
        }

        /* ── Divider ────────────────────────────────────────── */
        .ap-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--admin-border) 25%,
            rgba(78,196,196,0.3) 50%,
            var(--admin-border) 75%,
            transparent 100%
          );
          margin-bottom: 1.6rem;
        }

        /* ── Label ──────────────────────────────────────────── */
        .ap-label {
          font-family: var(--font-cormorant), serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--admin-text);
          letter-spacing: 0.02em;
          margin-bottom: 1.75rem;
        }

        /* ── Grid wrap ──────────────────────────────────────── */
        .ap-grid-wrap {
          position: relative;
          width: 240px;
          height: 240px;
          margin-bottom: 1.5rem;
        }

        /* SVG: solo visual, sin captura de eventos */
        .ap-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          overflow: visible;
        }

        /* Grid de nodos — debajo del SVG pero recibe eventos del wrapper */
        .ap-grid {
          position: absolute;
          inset: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          z-index: 1;
        }

        /* ── Nodo (div puro — puramente visual) ─────────────── */
        .ap-node {
          display: flex;
          align-items: center;
          justify-content: center;
          /* El círculo visible */
          --size: 36px;
        }
        .ap-node::after {
          content: "";
          display: block;
          width: var(--size);
          height: var(--size);
          border-radius: 50%;
          background: var(--node-bg, var(--admin-surface));
          border: 1.5px solid var(--node-ring, var(--admin-border));
          transition:
            background   0.15s ease,
            border-color 0.15s ease,
            transform    0.15s ease,
            box-shadow   0.15s ease;
        }

        /* Nodo activo */
        .ap-node--on::after {
          transform: scale(1.1);
          box-shadow: 0 0 14px rgba(78,196,196,0.3);
        }

        /* Primer nodo — halo extra */
        .ap-node--first::after {
          box-shadow:
            0 0 0 4px rgba(78,196,196,0.18),
            0 0 18px rgba(78,196,196,0.35);
        }

        /* Estado error */
        .ap-node[data-state="error"].ap-node--on::after {
          box-shadow: 0 0 12px rgba(196,122,158,0.3);
        }

        /* Pulso en success */
        .ap-node[data-state="success"].ap-node--on::after {
          animation: ap-pulse 0.45s ease forwards;
        }

        @keyframes ap-pulse {
          0%   { transform: scale(1);    }
          50%  { transform: scale(1.18); }
          100% { transform: scale(1.1);  }
        }

        /* ── Status ─────────────────────────────────────────── */
        .ap-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          height: 1.4rem;
          transition: color 0.2s ease;
          margin-bottom: 0.6rem;
        }
        .ap-status--idle    { color: var(--admin-text-muted); }
        .ap-status--drawing { color: var(--admin-accent); }
        .ap-status--success { color: var(--admin-accent); }
        .ap-status--error   { color: var(--admin-danger); }

        .ap-status__dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--admin-text-dim);
          flex-shrink: 0;
        }
        .ap-status__icon {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--admin-danger);
        }
        .ap-status__icon--ok { color: var(--admin-accent); }

        /* ── Hint ───────────────────────────────────────────── */
        .ap-hint {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.62rem;
          color: var(--admin-text-dim);
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* ── Footer ─────────────────────────────────────────── */
        .ap-footer {
          position: relative;
          z-index: 1;
          margin-top: 1.75rem;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: var(--admin-text-dim);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}