/**
 * src/types/admin.ts
 *
 * Tipos compartidos del panel administrativo.
 * Ampliar con las entidades de producto, imagen, etc. cuando el backend esté listo.
 */

/* ─── Pattern Lock ──────────────────────────────────────────────── */

export interface Point {
  x: number;
  y: number;
}

/**
 * Estados del ciclo de vida del patrón de desbloqueo:
 * - idle     → sin actividad, esperando que el usuario empiece
 * - drawing  → el usuario está arrastrando actualmente
 * - success  → patrón aceptado (suficientes nodos)
 * - error    → patrón rechazado (muy pocos nodos u otro fallo)
 */
export type PatternState = "idle" | "drawing" | "success" | "error";

/** Resultado que devuelve usePatternLock al componente visual */
export interface PatternLockState {
  pattern:    number[];
  state:      PatternState;
  cursor:     Point | null;
  statusMsg:  string;
}

/** Handlers que expone usePatternLock para conectar al wrapper y al SVG */
export interface PatternLockHandlers {
  wrapperRef:             React.RefObject<HTMLDivElement | null>;
  svgRef:                 React.RefObject<SVGSVGElement | null>;
  handleWrapperMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleWrapperMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Centros de los 9 nodos en coordenadas relativas al wrapper */
  nodeCenters:            React.RefObject<Point[]>;
}