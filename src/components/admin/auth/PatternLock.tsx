"use client";

/**
 * src/components/admin/auth/PatternLock.tsx
 *
 * Componente visual del grid de patrón.
 * Responsabilidad única: renderizar los nodos y las líneas SVG.
 *
 * Prop adicional `disabled`: cuando true, el grid se muestra
 * atenuado y no acepta eventos de puntero (fase "locked").
 */

import type { Point, PatternState } from "@/types/admin";
import styles from "@/components/admin/css/PatternLock.module.css";

/* ──── Types ────────────────────────────────────────────────────── */

interface PatternLockProps {
  pattern:     number[];
  state:       PatternState;
  cursor:      Point | null;
  nodeCenters: Point[];
  svgRef:      React.RefObject<SVGSVGElement | null>;
  wrapperRef:  React.RefObject<HTMLDivElement | null>;
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Cuando true, deshabilita toda interacción y atenúa el grid */
  disabled?:   boolean;
}

/* ─── Color map por estado ──────────────────────────────────────── */

const STATE_COLORS: Record<PatternState, { nodeBg: string; ring: string; line: string; dot: string }> = {
  idle:    { nodeBg: "var(--admin-surface)",    ring: "var(--admin-border)", line: "rgba(78,196,196,0.4)",   dot: "#4a5568" },
  drawing: { nodeBg: "rgba(78,196,196,0.15)",   ring: "#4ec4c4",             line: "rgba(78,196,196,0.75)",  dot: "#4ec4c4" },
  success: { nodeBg: "rgba(78,196,196,0.2)",    ring: "#4ec4c4",             line: "rgba(78,196,196,0.9)",   dot: "#4ec4c4" },
  error:   { nodeBg: "rgba(196,122,158,0.15)",  ring: "#c47a9e",             line: "rgba(196,122,158,0.75)", dot: "#c47a9e" },
};

/* ─── Component ─────────────────────────────────────────────────── */

export function PatternLock({
  pattern,
  state,
  cursor,
  nodeCenters,
  svgRef,
  wrapperRef,
  onMouseDown,
  onMouseMove,
  disabled = false,
}: PatternLockProps) {
  const C = STATE_COLORS[state];

  const linePoints = pattern
    .map(i => nodeCenters[i])
    .filter(Boolean)
    .map(p => `${p.x},${p.y}`)
    .join(" ");

  const lastCenter = pattern.length > 0 ? nodeCenters[pattern[pattern.length - 1]] : null;
  const trailPath  = lastCenter && cursor && state === "drawing"
    ? `M${lastCenter.x},${lastCenter.y} L${cursor.x},${cursor.y}`
    : null;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${disabled ? styles.wrapperDisabled : ""}`}
      onMouseDown={disabled ? undefined : onMouseDown}
      onMouseMove={disabled ? undefined : onMouseMove}
      style={{ userSelect: "none", cursor: disabled ? "not-allowed" : "crosshair" }}
    >
      <svg ref={svgRef} className={styles.svg} style={{ pointerEvents: "none" }}>

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

        {pattern.map((idx, order) => {
          const p = nodeCenters[idx];
          if (!p) return null;
          return (
            <g key={`dot-${idx}`}>
              {order === 0 && (
                <circle cx={p.x} cy={p.y} r={10} fill="none" stroke={C.dot} strokeWidth="1.5" opacity={0.4} />
              )}
              <circle cx={p.x} cy={p.y} r={5} fill={C.dot} />
            </g>
          );
        })}
      </svg>

      <div className={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => {
          const selected = pattern.includes(i);
          const isFirst  = pattern[0] === i;

          return (
            <div
              key={i}
              className={[
                styles.node,
                selected  ? styles.nodeOn    : "",
                isFirst   ? styles.nodeFirst : "",
                disabled  ? styles.nodeDisabled : "",
              ].join(" ").trim()}
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
  );
}