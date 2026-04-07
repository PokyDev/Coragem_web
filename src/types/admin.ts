/**
 * src/types/admin.ts
 *
 * Tipos compartidos del panel administrativo.
 */

import type { CatalogCategory, CatalogColor } from "./catalog";

/* ─── Pattern Lock ──────────────────────────────────────────────── */

export interface Point {
  x: number;
  y: number;
}

export type PatternState = "idle" | "drawing" | "success" | "error";

export interface PatternLockState {
  pattern:   number[];
  state:     PatternState;
  cursor:    Point | null;
  statusMsg: string;
}

export interface PatternLockHandlers {
  wrapperRef:             React.RefObject<HTMLDivElement | null>;
  svgRef:                 React.RefObject<SVGSVGElement | null>;
  handleWrapperMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleWrapperMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  nodeCenters:            React.RefObject<Point[]>;
  patternRef:             React.RefObject<number[]>;
}

/* ─── Auth flow ─────────────────────────────────────────────────── */

export type PatternAuthPhase =
  | "loading"
  | "setup-define"
  | "setup-confirm"
  | "verify"
  | "locked"
  | "authenticated";

export interface PatternAuthState {
  phase:          PatternAuthPhase;
  statusMsg:      string;
  failedAttempts: number;
  lockedUntil?:   number;
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
  id:          string;
  name:        string;
  category:    CatalogCategory;
  color:       CatalogColor;
  price:       number;
  stock:       number;
  stockStatus: StockStatus;
  ventas:      number;
  images:      { id: string; url: string; order: number }[];
  isVisible:   boolean;
}

export type StockFilter = StockStatus | "all";

/* ─── Product Form ──────────────────────────────────────────────── */

export interface ProductFormData {
  name:          string;
  price:         string;
  stock:         string;
  ventas:        string;
  categoryId:    string;
  colorId:       string;
  /** URL de entrega de Cloudinary */
  imageUrl:      string;
  /** public_id del asset en Cloudinary */
  imagePublicId: string;
}

export interface ProductFormErrors {
  name?:       string;
  price?:      string;
  stock?:      string;
  ventas?:     string;
  categoryId?: string;
  colorId?:    string;
}

/* ─── Modal state ───────────────────────────────────────────────── */

export type ProductModalMode = "new" | "edit";

export interface ProductModalState {
  isOpen:  boolean;
  product: ProductRow | null;
}