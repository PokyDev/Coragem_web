"use client";

/**
 * src/components/admin/dashboard/TopProducts/TopProducts.tsx
 *
 * Widget que muestra los 5 productos más vendidos.
 * Datos provistos por useTopProducts (mock hasta integración backend).
 */

import Image from "next/image";
import type { TopProduct } from "@/hooks/admin/dashboard/useTopProducts";
import { getStockStatus }  from "@/lib/dashboard";
import styles from "./TopProducts.module.css";

/* ── Formatters ─────────────────────────────────────────────────── */

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style:                 "currency",
    currency:              "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ── Rank label ─────────────────────────────────────────────────── */

const RANK_CLASS: Record<number, string> = {
  1: styles.rankFirst,
  2: styles.rankSecond,
  3: styles.rankThird,
};

/* ── Skeleton ───────────────────────────────────────────────────── */

function TopProductsSkeleton() {
  return (
    <div className={styles.skeleton}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard} style={{ animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

/* ── Card individual ────────────────────────────────────────────── */

interface ProductCardProps {
  product:  TopProduct;
  rank:     number;
  maxSales: number;
  delay:    number;
}

function ProductCard({ product, rank, maxSales, delay }: ProductCardProps) {
  const stockStatus    = getStockStatus(product.stock);
  const stockClass     = { ok: styles.stockOk, low: styles.stockLow, out: styles.stockOut }[stockStatus];
  const barWidth       = maxSales > 0 ? Math.round((product.ventas / maxSales) * 100) : 0;

  return (
    <div className={styles.card} style={{ animationDelay: `${delay}s` }}>
      {/* Ranking */}
      <span className={`${styles.rank} ${RANK_CLASS[rank] ?? ""}`}>
        #{rank}
      </span>

      {/* Thumbnail */}
      <div className={styles.thumb}>
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="44px"
            className={styles.thumbImg}
            priority={rank <= 2}
          />
        ) : (
          <span className={styles.thumbPlaceholder} aria-hidden="true">◈</span>
        )}
      </div>

      {/* Nombre + precio */}
      <div className={styles.info}>
        <span className={styles.name}>{product.name}</span>
        <span className={styles.price}>{formatPrice(product.price)}</span>
      </div>

      {/* Barra de ventas relativa */}
      <div className={styles.barWrap} aria-hidden="true">
        <div className={styles.bar} style={{ width: `${barWidth}%` }} />
      </div>

      {/* Ventas */}
      <div className={styles.metric}>
        <span className={`${styles.metricValue} ${styles.metricSales}`}>
          {product.ventas}
        </span>
        <span className={styles.metricLabel}>Ventas</span>
      </div>

      {/* Stock */}
      <div className={styles.metric}>
        <span className={`${styles.metricValue} ${stockClass}`}>
          {product.stock}
        </span>
        <span className={styles.metricLabel}>Stock</span>
      </div>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────── */

interface TopProductsProps {
  products: TopProduct[];
  loading:  boolean;
}

/* ── Component ──────────────────────────────────────────────────── */

export function TopProducts({ products, loading }: TopProductsProps) {
  const maxSales = products[0]?.ventas ?? 0;

  return (
    <section className={styles.section} aria-label="Top 5 productos más vendidos">
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Top productos</h2>
        <span className={styles.sectionCount}>más vendidos</span>
      </div>

      {loading ? (
        <TopProductsSkeleton />
      ) : (
        <div className={styles.list}>
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              rank={index + 1}
              maxSales={maxSales}
              delay={index * 0.06}
            />
          ))}
        </div>
      )}
    </section>
  );
}