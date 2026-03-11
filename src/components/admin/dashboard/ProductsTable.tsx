"use client";

/**
 * src/components/admin/dashboard/ProductsTable.tsx
 *
 * Tabla de productos del dashboard.
 * Ahora expone onEdit y onDelete para que DashboardPage
 * controle el modal y las acciones.
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProductRow, StockFilter } from "@/types/admin";
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

/* ─── Stock Count ────────────────────────────────────────────────── */

function StockCount({ status, stock }: { status: ProductRow["stockStatus"]; stock: number }) {
  const colorClass = { ok: styles.stockOk, low: styles.stockLow, out: styles.stockOut }[status];
  return <span className={`${styles.stockCount} ${colorClass}`}>{stock}</span>;
}

/* ─── Category label ─────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  EARCUFF: "Earcuff", ANILLO: "Anillo", DIJE: "Dije",
  CADENA: "Cadena", TOPOS: "Topos", CANDONGAS: "Candongas", CONJUNTOS: "Conjuntos",
};

/* ─── Pagination ─────────────────────────────────────────────────── */

interface PaginationProps {
  current: number; total: number; onChange: (page: number) => void;
}

function Pagination({ current, total, onChange }: PaginationProps) {
  if (total <= 1) return null;
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className={styles.pagination}>
      <button className={styles.pageBtn} onClick={() => onChange(current - 1)} disabled={current === 1} aria-label="Página anterior">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button key={p} className={`${styles.pageBtn} ${p === current ? styles.pageBtnActive : ""}`} onClick={() => onChange(p)} aria-label={`Página ${p}`} aria-current={p === current ? "page" : undefined}>
          {p}
        </button>
      ))}
      <button className={styles.pageBtn} onClick={() => onChange(current + 1)} disabled={current === total} aria-label="Página siguiente">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Empty States ────────────────────────────────────────────────── */

const STOCK_FILTER_LABELS: Record<string, string> = {
  ok: "con stock", low: "con stock bajo", out: "sin stock",
};

function EmptyState({ hasSearch, stockFilter }: { hasSearch: boolean; stockFilter: StockFilter }) {
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

function EmptyStateDesc({ hasSearch, stockFilter }: { hasSearch: boolean; stockFilter: StockFilter }) {
  const filterLabel = stockFilter !== "all" ? STOCK_FILTER_LABELS[stockFilter] : "";
  return hasSearch
    ? `Ningún producto ${filterLabel ? `${filterLabel} ` : ""}coincide con la búsqueda.`
    : `No hay productos ${filterLabel}.`;
}

/* ─── Props ─────────────────────────────────────────────────────── */

interface ProductsTableProps {
  products:    ProductRow[];
  searchQuery: string;
  stockFilter: StockFilter;
  onEdit:      (product: ProductRow) => void;
  onDelete:    (product: ProductRow) => void;
}

/* ─── Component ─────────────────────────────────────────────────── */

export function ProductsTable({ products, searchQuery, stockFilter, onEdit, onDelete }: ProductsTableProps) {
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

      {/* Tabla */}
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
                        {product.images[0]?.url ? (
                          <Image
                            src={product.images[0].url}
                            alt={product.name}
                            fill
                            sizes="30px"
                            className={styles.productThumbImg}
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <span className={styles.productThumbPlaceholder}>◈</span>
                        )}
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
                  <td className={`${styles.td} ${styles.tdMuted}`}>{product.ventas}</td>
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
                        onClick={() => onEdit(product)}
                      >
                        Editar
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        type="button"
                        aria-label={`Eliminar ${product.name}`}
                        onClick={() => onDelete(product)}
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

      {/* ── Card list (móvil ≤ 500px) ── */}
      <div className={styles.cardList}>
        {pageItems.length > 0 ? (
          pageItems.map((product, index) => (
            <div
              key={product.id}
              className={styles.productCard}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={styles.cardMain}>
                <div className={styles.cardThumb}>
                  {product.images[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      fill
                      sizes="34px"
                      className={styles.cardThumbImg}
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <span className={styles.cardId}>◈</span>
                  )}
                </div>
                <div className={styles.cardNameGroup}>
                  <p className={styles.cardName}>{product.name}</p>
                  <p className={styles.cardCategory}>
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </p>
                </div>
                <StockBadge status={product.stockStatus} />
              </div>

              <div className={styles.cardMeta}>
                <div className={styles.cardMetaItem}>
                  <span className={styles.cardMetaLabel}>Precio</span>
                  <span className={styles.cardMetaValue}>{formatPrice(product.price)}</span>
                </div>
                <div className={styles.cardMetaItem}>
                  <span className={styles.cardMetaLabel}>Stock</span>
                  <span className={styles.cardMetaValue}>
                    <StockCount status={product.stockStatus} stock={product.stock} />
                  </span>
                </div>
                <div className={styles.cardMetaItem}>
                  <span className={styles.cardMetaLabel}>Ventas</span>
                  <span className={styles.cardMetaValue}>{product.ventas}</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.cardActionBtn}
                  type="button"
                  onClick={() => onEdit(product)}
                  aria-label={`Editar ${product.name}`}
                >
                  Editar
                </button>
                <button
                  className={`${styles.cardActionBtn} ${styles.cardActionBtnDanger}`}
                  type="button"
                  onClick={() => onDelete(product)}
                  aria-label={`Eliminar ${product.name}`}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">◈</span>
            <p className={styles.emptyTitle}>Sin resultados</p>
            <p className={styles.emptyDesc}>
              <EmptyStateDesc hasSearch={!!searchQuery} stockFilter={stockFilter} />
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <span className={styles.footerInfo}>
          Mostrando {pageItems.length > 0 ? start + 1 : 0}–{Math.min(start + PAGE_SIZE, products.length)} de {products.length}
        </span>
        <Pagination current={page} total={totalPages} onChange={setPage} />
      </div>
    </div>
  );
}