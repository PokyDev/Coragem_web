/**
 * src/types/admin.ts
 *
 * Tipos compartidos del panel administrativo.
 */

/* ─── Pattern Lock ──────────────────────────────────────────────── */

export interface Point {
  x: number;
  y: number;
}

export type PatternState = "idle" | "drawing" | "success" | "error";

export interface PatternLockState {
  pattern:    number[];
  state:      PatternState;
  cursor:     Point | null;
  statusMsg:  string;
}

export interface PatternLockHandlers {
  wrapperRef:             React.RefObject<HTMLDivElement | null>;
  svgRef:                 React.RefObject<SVGSVGElement | null>;
  handleWrapperMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleWrapperMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  nodeCenters:            React.RefObject<Point[]>;
}

/* ─── Dashboard ─────────────────────────────────────────────────── */

/**
 * Umbrales para clasificar el estado de stock de un producto.
 * Ajustar según las necesidades del negocio.
 */
export const STOCK_THRESHOLDS = {
  LOW: 3, // stock > 0 && stock <= LOW  → Stock Bajo
} as const;

export type StockStatus = "ok" | "low" | "out";

export interface DashboardStats {
  total:    number;
  inStock:  number;
  lowStock: number;
  outStock: number;
}

/**
 * Fila enriquecida de la tabla de productos del dashboard.
 * Extiende el Product del catálogo con el estado de stock calculado.
 */
export interface ProductRow {
  id:          number;
  name:        string;
  category:    string;
  price:       number;
  stock:       number;
  stockStatus: StockStatus;
  ventas:      number;
  image:       string;
  color:       string;
}

/* ─── Dashboard filters ─────────────────────────────────────────── */

export type StockFilter = StockStatus | "all";