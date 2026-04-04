"use client";

/**
 * src/components/admin/products/ProductCard.tsx
 *
 * Tarjeta de producto para la pestaña /admin/dashboard/products.
 *
 * Secciones:
 *   · Imagen grande a la izquierda
 *   · Info: nombre, categoría, color, precio, stock
 *   · Controles de stock: input cantidad + botón "+ Compra" / "- Venta"
 *   · Acciones CRUD: Editar / Eliminar
 *
 * Las operaciones de Compra/Venta muestran un toast de WIP hasta
 * que se implemente la integración real con el backend.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import type { ProductRow } from "@/types/admin";
import { getStockStatus } from "@/lib/dashboard";
import { useProductMovement } from "@/hooks/admin/products/useProductMovement";
import styles from "./ProductCard.module.css";

/* ─── Formatters ────────────────────────────────────────────────── */

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style:                 "currency",
    currency:              "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ─── Stock Badge ─────────────────────────────────────────────── */

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

/* ─── Category labels ────────────────────────────────────────────── */

const CATEGORY_LABELS: Record<string, string> = {
  EARCUFF:   "Earcuff",
  ANILLO:    "Anillo",
  DIJE:      "Dije",
  CADENA:    "Cadena",
  TOPOS:     "Topos",
  CANDONGAS: "Candongas",
  CONJUNTOS: "Conjuntos",
};

/* ─── Props ─────────────────────────────────────────────────────── */

interface ProductCardProps {
  product:        ProductRow;
  animDelay?:     number;
  onEdit:         (product: ProductRow) => void;
  onDelete:       (product: ProductRow) => void;

  /** Callback opcional para notificar al padre del nuevo stock tras un movimiento */
  onStockChange?: (productId: string, newStock: number) => void;
}
/* ─── Component ─────────────────────────────────────────────────── */

export function ProductCard({ product, animDelay = 0, onEdit, onDelete, onStockChange }: ProductCardProps) {
  const [qty, setQty]           = useState<string>("1");
  const [localStock, setLocalStock] = useState(product.stock);
  const [localVentas, setLocalVentas] = useState(product.ventas);
  const { isLoading, error, register, clearError } = useProductMovement();

  const stockStatus = getStockStatus(localStock);

  const handleMovement = useCallback(async (type: "PURCHASE" | "SALE") => {
    const quantity = parseInt(qty, 10);
    const result = await register(product.id, type, quantity);
    if (result) {
      setLocalStock(result.stockAfter);
      if (type === "SALE") setLocalVentas((prev) => prev + quantity);
      setQty("1");
      onStockChange?.(product.id, result.stockAfter);
    }
  }, [qty, product.id, register, onStockChange]);

  const handleBuy  = useCallback(() => handleMovement("PURCHASE"), [handleMovement]);
  const handleSell = useCallback(() => handleMovement("SALE"),     [handleMovement]);

  const stockColorClass = {
    ok:  styles.stockOk,
    low: styles.stockLow,
    out: styles.stockOut,
  }[stockStatus];

  const imageUrl = product.images[0]?.url ?? null;

  return (
    <>
      <article
        className={styles.card}
        style={{ animationDelay: `${animDelay}s` }}
        aria-label={product.name}
      >
        {/* ── Imagen ── */}
        <div className={styles.imageWrap}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="160px"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true">◈</div>
          )}
        </div>

        {/* ── Cuerpo ── */}
        <div className={styles.body}>

          {/* Nombre + badge */}
          <div className={styles.header}>
            <div className={styles.nameRow}>
              <h3 className={styles.name}>{product.name}</h3>
              <StockBadge status={stockStatus} />
            </div>
            <div className={styles.meta}>
              <span>{CATEGORY_LABELS[product.category] ?? product.category}</span>
              {product.color && (
                <>
                  <span className={styles.metaDot} />
                  <span>{product.color}</span>
                </>
              )}
            </div>
          </div>

          {/* Precio + stock */}
          <div className={styles.infoRow}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Precio</span>
              <span className={styles.infoValue}>{formatPrice(product.price)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Stock</span>
              <span className={`${styles.infoValue} ${stockColorClass}`}>
                {localStock} Unidades
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Ventas</span>
              <span className={styles.infoValue}>{localVentas}</span> {/* Patron para actualización dinamica (Estado local) */}
            </div>
          </div>

          {/* Operaciones de stock */}
          <div className={styles.stockOpsSection}>
            <span className={styles.stockOpsLabel}>Registrar movimiento</span>
            <div className={styles.stockOpsRow}>
              <input
                className={styles.qtyInput}
                type="number"
                min="1"
                value={qty}
                onChange={(e) => { setQty(e.target.value); clearError(); }}
                aria-label="Cantidad de unidades"
                disabled={isLoading}
              />
              <span className={styles.qtyUnit}>Unidades</span>

              <button
                className={`${styles.opBtn} ${styles.opBtnBuy}`}
                type="button"
                onClick={handleBuy}
                disabled={isLoading}
                aria-label={`Registrar compra de ${product.name}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5"  y1="12" x2="19" y2="12" />
                </svg>
                {isLoading ? "…" : "Compra"}
              </button>

              <button
                className={`${styles.opBtn} ${styles.opBtnSell}`}
                type="button"
                onClick={handleSell}
                disabled={isLoading || localStock === 0}
                aria-label={`Registrar venta de ${product.name}`}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                {isLoading ? "…" : "Venta"}
              </button>
            </div>

            {/* Error inline bajo los controles */}
            {error && (
              <p className={styles.movementError} role="alert">
                {error}
              </p>
            )}
          </div>

          <div className={styles.divider} />

          {/* Acciones CRUD */}
          <div className={styles.footer}>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnEdit}`}
              type="button"
              onClick={() => onEdit(product)}
              aria-label={`Editar ${product.name}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button
              className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
              type="button"
              onClick={() => onDelete(product)}
              aria-label={`Eliminar ${product.name}`}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
              Eliminar
            </button>
          </div>

        </div>
      </article>
    </>
  );
}