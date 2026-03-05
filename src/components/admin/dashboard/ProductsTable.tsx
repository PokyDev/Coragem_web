"use client";

/**
 * src/components/admin/dashboard/ProductsTable.tsx
 *
 * Tabla de productos del dashboard con:
 *   - Scroll interno (solo la tabla hace overflow-y)
 *   - Paginación de 10 productos por página
 *   - Columna "Stock" con valor numérico coloreado por estado
 *   - Columna "Estado" con badge semáforo
 *   - Acciones: Editar / Eliminar (placeholders)
 */

import { useState, useEffect } from "react";
import type { ProductRow }     from "@/types/admin";
import type { StockFilter }    from "@/app/(admin)/admin/dashboard/page";
import styles from "@/components/admin/css/ProductsTable.module.css";

const PAGE_SIZE = 10;

/* ─── Formatters ────────────────────────────────────────────────── */

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style:                 "currency",
    currency:              "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ─── Stock Badge (estado) ───────────────────────────────────────── */

function StockBadge({ status }: { status: ProductRow["stockStatus"] }) {
  const map = {
    ok:  { label: "Con Stock",  cls: styles.badgeOk  },
    low: { label: "Stock Bajo", cls: styles.badgeLow },
    out: { label: "Sin Stock",  cls: styles.badgeOut },
  };
  const { label, cls } = map[status];
  return (
    <span className={`${styles.badge} ${cls}`}>
      <span className={styles.badgeDot} />
      {label}
    </span>
  );
}

/* ─── Stock Count (número coloreado por estado) ──────────────────── */

function StockCount({ status, stock }: { status: ProductRow["stockStatus"]; stock: number }) {
  const colorClass = {
    ok:  styles.stockOk,
    low: styles.stockLow,
    out: styles.stockOut,
  }[status];
  return <span className={`${styles.stockCount} ${colorClass}`}>{stock}</span>;
}

/* ─── Category label ─────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  EARCUFF:   "Earcuff",
  ANILLO:    "Anillo",
  DIJE:      "Dije",
  CADENA:    "Cadena",
  TOPOS:     "Topos",
  CANDONGAS: "Candongas",
  CONJUNTOS: "Conjuntos",
};

/* ─── Pagination ─────────────────────────────────────────────────── */

interface PaginationProps {
  current:  number;
  total:    number;
  onChange: (page: number) => void;
}

function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Página anterior"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.pageBtn} ${p === current ? styles.pageBtnActive : ""}`}
          onClick={() => onChange(p)}
          aria-label={`Página ${p}`}
          aria-current={p === current ? "page" : undefined}
        >
          {p}
        </button>
      ))}
      <button
        className={styles.pageBtn}
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Página siguiente"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────── */

const STOCK_FILTER_LABELS: Record<string, string> = {
  ok:  "con stock",
  low: "con stock bajo",
  out: "sin stock",
};

interface EmptyStateProps {
  hasSearch:   boolean;
  stockFilter: StockFilter;
}

function EmptyState({ hasSearch, stockFilter }: EmptyStateProps) {
  const filterLabel = stockFilter !== "all" ? STOCK_FILTER_LABELS[stockFilter] : "";
  const desc = hasSearch
    ? `Ningún producto ${filterLabel ? `${filterLabel} ` : ""}coincide con la búsqueda.`
    : `No hay productos ${filterLabel}.`;

  return (
    <tr>
      <td colSpan={7} className={styles.emptyCell}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">◈</span>
          <p className={styles.emptyTitle}>Sin resultados</p>
          <p className={styles.emptyDesc}>{desc}</p>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

interface ProductsTableProps {
  products:    ProductRow[];
  searchQuery: string;
  stockFilter: StockFilter;
}

export function ProductsTable({ products, searchQuery, stockFilter }: ProductsTableProps) {
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [searchQuery, stockFilter]);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const start      = (page - 1) * PAGE_SIZE;
  const pageItems  = products.slice(start, start + PAGE_SIZE);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.headerTitle}>Productos</h2>
          <span className={styles.headerCount}>{products.length} resultados</span>
        </div>
        {(searchQuery || stockFilter !== "all") && (
          <div className={styles.filterBadges}>
            {searchQuery && (
              <div className={styles.searchBadge}>
                Búsqueda: <strong>{searchQuery}</strong>
              </div>
            )}
            {stockFilter !== "all" && (
              <div className={`${styles.searchBadge} ${styles[`filterBadge_${stockFilter}`]}`}>
                Estado: <strong>{STOCK_FILTER_LABELS[stockFilter]}</strong>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabla con scroll interno */}
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Producto</th>
              <th className={styles.th}>Categoría</th>
              <th className={styles.th}>Precio</th>
              <th className={styles.th}>Ventas</th>
              <th className={styles.th}>Stock</th>
              <th className={styles.th}>Estado</th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((product) => (
                <tr key={product.id} className={styles.row}>
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        <span className={styles.productId}>#{product.id}</span>
                      </div>
                      <span className={styles.productName}>{product.name}</span>
                    </div>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </td>
                  <td className={styles.td}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                  </td>
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {product.ventas}
                  </td>
                  <td className={styles.td}>
                    <StockCount status={product.stockStatus} stock={product.stock} />
                  </td>
                  <td className={styles.td}>
                    <StockBadge status={product.stockStatus} />
                  </td>
                  <td className={`${styles.td} ${styles.tdActions}`}>
                    <div className={styles.actionsWrap}>
                      <button
                        className={styles.actionBtn}
                        type="button"
                        aria-label={`Editar ${product.name}`}
                        onClick={() => { /* TODO */ }}
                      >
                        Editar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        type="button"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => { /* TODO */ }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState hasSearch={!!searchQuery} stockFilter={stockFilter} />
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: info + paginación */}
      <div className={styles.footer}>
        <span className={styles.footerInfo}>
          Mostrando {pageItems.length > 0 ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, products.length)} de {products.length}
        </span>
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}