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

export const STOCK_THRESHOLDS = {
  LOW: 3,
} as const;

export type StockStatus = "ok" | "low" | "out";

export interface DashboardStats {
  total:    number;
  inStock:  number;
  lowStock: number;
  outStock: number;
}

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

export type StockFilter = StockStatus | "all";

/* ─── Product Form ──────────────────────────────────────────────── */

export interface ProductFormData {
  name:     string;
  price:    string;
  stock:    string;
  ventas:   string;
  category: string;
  color:    string;
  image:    File | null;
}

export interface ProductFormErrors {
  name?:     string;
  price?:    string;
  stock?:    string;
  ventas?:   string;
  category?: string;
  color?:    string;
  image?:    string;
}

/* ─── Modal state ───────────────────────────────────────────────── */

export type ProductModalMode = "new" | "edit";

export interface ProductModalState {
  isOpen:  boolean;
  product: ProductRow | null; // null → modo "new"
}