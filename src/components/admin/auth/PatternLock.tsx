"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./css/PatternLock.module.css";

/* ─── Tipos ──────────────────────────────────────────────────────── */
interface PatternLockProps {
  /** Nodos actualmente seleccionados */
  activeNodes: number[];
  /** Llamado al activar un nodo nuevo */
  onNodeEnter: (index: number) => void;
  /** Estado visual del grid */
  status?: "idle" | "error" | "locked";
  /** Desactivar interacción */
  disabled?: boolean;
}

/* ─── Geometría de los 9 nodos ────────────────────────────────────── */
const NODE_SIZE = 52;   // px — debe coincidir con --node-size del CSS
const NODE_GAP  = 28;   // px — debe coincidir con --node-gap del CSS
const STRIDE    = NODE_SIZE + NODE_GAP;  // distancia centro-a-centro

/** Centro de cada nodo (en px, relativo al grid wrapper) */
function nodeCenter(index: number): { cx: number; cy: number } {
  const col = index % 3;
  const row = Math.floor(index / 3);
  return {
    cx: col * STRIDE + NODE_SIZE / 2,
    cy: row * STRIDE + NODE_SIZE / 2,
  };
}

/** Dimensiones totales del grid */
const GRID_W = 3 * NODE_SIZE + 2 * NODE_GAP;
const GRID_H = GRID_W;

/* ─── Componente ─────────────────────────────────────────────────── */
export function PatternLock({
  activeNodes,
  onNodeEnter,
  status = "idle",
  disabled = false,
}: PatternLockProps) {
  const gridRef       = useRef<HTMLDivElement>(null);
  const nodeRefs      = useRef<(HTMLDivElement | null)[]>(Array(9).fill(null));
  const isDrawing     = useRef(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  /* ── Traduce coordenadas de pantalla a coordenadas del SVG ── */
  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const rect = gridRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  /* ── Detecta qué nodo está bajo el punto dado ── */
  const nodeAtPoint = useCallback((clientX: number, clientY: number): number | null => {
    for (let i = 0; i < 9; i++) {
      const el = nodeRefs.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (
        clientX >= r.left &&
        clientX <= r.right &&
        clientY >= r.top &&
        clientY <= r.bottom
      ) {
        return i;
      }
    }
    return null;
  }, []);

  /* ── Pointer down: inicia dibujo ── */
  const handlePointerDown = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      isDrawing.current = true;

      const node = nodeAtPoint(e.clientX, e.clientY);
      if (node !== null) onNodeEnter(node);
    },
    [disabled, nodeAtPoint, onNodeEnter]
  );

  /* ── Pointer move: arrastra por los nodos ── */
  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDrawing.current || disabled) return;

      /* Actualiza línea de cursor live */
      const coords = toSvgCoords(e.clientX, e.clientY);
      if (coords) setCursor(coords);

      const node = nodeAtPoint(e.clientX, e.clientY);
      if (node !== null) onNodeEnter(node);
    },
    [disabled, toSvgCoords, nodeAtPoint, onNodeEnter]
  );

  /* ── Pointer up: termina dibujo, oculta cursor ── */
  const handlePointerUp = useCallback(() => {
    isDrawing.current = false;
    setCursor(null);
  }, []);

  /* ── Limpia cursor si el puntero sale del grid ── */
  const handlePointerLeave = useCallback(() => {
    if (!isDrawing.current) setCursor(null);
  }, []);

  /* ── Limpia estado de dibujo si el componente se resetea ── */
  useEffect(() => {
    if (activeNodes.length === 0) {
      isDrawing.current = false;
      setCursor(null);
    }
  }, [activeNodes]);

  /* ── Clases según status ── */
  const errorActive = status === "error";
  const locked      = status === "locked" || disabled;

  /* ── Renderizar líneas entre nodos activos ── */
  const renderLines = () => {
    const lines: React.ReactNode[] = [];

    /* Líneas entre nodos seleccionados */
    for (let i = 0; i < activeNodes.length - 1; i++) {
      const from = nodeCenter(activeNodes[i]);
      const to   = nodeCenter(activeNodes[i + 1]);
      lines.push(
        <line
          key={`line-${i}`}
          x1={from.cx}
          y1={from.cy}
          x2={to.cx}
          y2={to.cy}
          className={`${styles.line} ${errorActive ? styles.lineError : ""}`}
        />
      );
    }

    /* Línea de arrastre live (del último nodo al cursor) */
    if (cursor && activeNodes.length > 0 && isDrawing.current) {
      const last = nodeCenter(activeNodes[activeNodes.length - 1]);
      lines.push(
        <line
          key="draft"
          x1={last.cx}
          y1={last.cy}
          x2={cursor.x}
          y2={cursor.y}
          className={styles.lineDraft}
        />
      );
    }

    return lines;
  };

  return (
    <div
      ref={gridRef}
      className={`${styles.gridWrapper} ${locked ? styles.nodeLocked : ""}`}
      style={{ width: GRID_W, height: GRID_H }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      {/* SVG de líneas — debajo de los nodos */}
      <svg
        className={styles.svgLines}
        viewBox={`0 0 ${GRID_W} ${GRID_H}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {renderLines()}
      </svg>

      {/* Grid de 9 nodos */}
      <div className={styles.grid}>
        {Array.from({ length: 9 }, (_, i) => {
          const isActive = activeNodes.includes(i);
          const order    = activeNodes.indexOf(i) + 1;

          return (
            <div
              key={i}
              ref={(el) => { nodeRefs.current[i] = el; }}
              className={[
                styles.node,
                isActive          ? styles.nodeActive : "",
                errorActive && isActive ? styles.nodeError  : "",
                locked            ? styles.nodeLocked : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Número de orden visible al seleccionar */}
              {isActive && (
                <span className={styles.nodeIndex}>{order}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}