"use client";

/**
 * src/components/admin/dashboard/ProductsTable.tsx
 *
 * Tabla de productos del dashboard con:
 *   - Scroll interno (el contenedor tiene altura fija, solo la tabla hace scroll)
 *   - Paginación de 10 productos por página
 *   - Badge de estado de stock (semáforo Slate Command)
 *   - Acciones: Editar / Eliminar (placeholders)
 *
 * Recibe los productos ya filtrados por la búsqueda del topbar.
 */

import { useState, useEffect } from "react";
import type { ProductRow }     from "@/types/admin";
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

/* ─── Stock Badge ────────────────────────────────────────────────── */

function StockBadge({ status, stock }: { status: ProductRow["stockStatus"]; stock: number }) {
  const map = {
    ok:  { label: "Con Stock",   cls: styles.badgeOk  },
    low: { label: "Stock Bajo",  cls: styles.badgeLow },
    out: { label: "Sin Stock",   cls: styles.badgeOut },
  };
  const { label, cls } = map[status];

  return (
    <span className={`${styles.badge} ${cls}`}>
      <span className={styles.badgeDot} />
      {label}
      {status !== "out" && (
        <span className={styles.badgeCount}>({stock})</span>
      )}
    </span>
  );
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

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <tr>
      <td colSpan={6} className={styles.emptyCell}>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">◈</span>
          <p className={styles.emptyTitle}>
            {hasSearch ? "Sin resultados" : "No hay productos"}
          </p>
          <p className={styles.emptyDesc}>
            {hasSearch
              ? "Ningún producto coincide con la búsqueda."
              : "Agrega tu primer producto con el botón + Nuevo Producto."}
          </p>
        </div>
      </td>
    </tr>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */

interface ProductsTableProps {
  products:    ProductRow[];
  searchQuery: string;
}

export function ProductsTable({ products, searchQuery }: ProductsTableProps) {
  const [page, setPage] = useState(1);

  /* Resetear a la primera página cuando cambia la búsqueda */
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

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
        {searchQuery && (
          <div className={styles.searchBadge}>
            Filtrando por: <strong>{searchQuery}</strong>
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
              <th className={styles.th}>Estado</th>
              <th className={`${styles.th} ${styles.thRight}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length > 0 ? (
              pageItems.map((product) => (
                <tr key={product.id} className={styles.row}>
                  {/* Nombre */}
                  <td className={styles.td}>
                    <div className={styles.productCell}>
                      <div className={styles.productThumb}>
                        <span className={styles.productId}>#{product.id}</span>
                      </div>
                      <span className={styles.productName}>{product.name}</span>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </td>

                  {/* Precio */}
                  <td className={styles.td}>
                    <span className={styles.price}>{formatPrice(product.price)}</span>
                  </td>

                  {/* Ventas */}
                  <td className={`${styles.td} ${styles.tdMuted}`}>
                    {product.ventas}
                  </td>

                  {/* Estado */}
                  <td className={styles.td}>
                    <StockBadge status={product.stockStatus} stock={product.stock} />
                  </td>

                  {/* Acciones */}
                  <td className={`${styles.td} ${styles.tdActions}`}>
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
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState hasSearch={!!searchQuery} />
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