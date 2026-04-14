"use client";

/**
 * src/components/admin/dashboard/TopProducts/TopProducts.tsx
 *
 * Widget que muestra los productos más vendidos.
 * Las imágenes son clickeables: se expanden en un lightbox con overlay.
 */

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import type { TopProduct } from "@/hooks/admin/dashboard/useTopProducts";
import { getStockStatus } from "@/lib/dashboard";
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

/* ── Lightbox ───────────────────────────────────────────────────── */

interface LightboxProps {
  url:     string;
  alt:     string;
  onClose: () => void;
}

const LIGHTBOX_ANIM_MS = 160;

function ImageLightbox({ url, alt, onClose }: LightboxProps) {
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
  }, []);

  /* Espera a que termine la animación de salida antes de desmontar */
  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(onClose, LIGHTBOX_ANIM_MS);
    return () => clearTimeout(t);
  }, [closing, onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleClose]);

  return (
    <div
      className={`${styles.overlay} ${closing ? styles.overlayClosing : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal
      aria-label={`Imagen de ${alt}`}
    >
      <div
        className={`${styles.lightboxContainer} ${closing ? styles.lightboxClosing : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeBtn}
          onClick={handleClose}
          aria-label="Cerrar imagen"
        >
          <X size={16} strokeWidth={2.5} />
        </button>
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 90vw, 500px"
          className={styles.lightboxImg}
        />
      </div>
    </div>
  );
}

/* ── Card individual ────────────────────────────────────────────── */

interface ProductCardProps {
  product:      TopProduct;
  rank:         number;
  maxSales:     number;
  delay:        number;
  onImageClick: (url: string, name: string) => void;
}

function ProductCard({ product, rank, maxSales, delay, onImageClick }: ProductCardProps) {
  const stockStatus = getStockStatus(product.stock);
  const stockClass  = { ok: styles.stockOk, low: styles.stockLow, out: styles.stockOut }[stockStatus];
  const barWidth    = maxSales > 0 ? Math.round((product.ventas / maxSales) * 100) : 0;

  const firstImage  = product.images
    ?.slice()
    .sort((a, b) => a.order - b.order)[0] ?? null;

  const handleThumbClick = firstImage
    ? () => onImageClick(firstImage.url, product.name)
    : undefined;

  const handleThumbKeyDown = firstImage
    ? (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onImageClick(firstImage.url, product.name);
        }
      }
    : undefined;

  return (
    <div className={styles.card} style={{ animationDelay: `${delay}s` }}>
      {/* Ranking */}
      <span className={`${styles.rank} ${RANK_CLASS[rank] ?? ""}`}>
        #{rank}
      </span>

      {/* Thumbnail */}
      <div
        className={`${styles.thumb} ${firstImage ? styles.thumbClickable : ""}`}
        onClick={handleThumbClick}
        onKeyDown={handleThumbKeyDown}
        role={firstImage ? "button" : undefined}
        tabIndex={firstImage ? 0 : undefined}
        aria-label={firstImage ? `Ver imagen de ${product.name}` : undefined}
      >
        {firstImage ? (
          <>
            <Image
              src={firstImage.url}
              alt={product.name}
              fill
              sizes="44px"
              className={styles.thumbImg}
              priority={rank <= 2}
            />
            <span className={styles.thumbOverlay} aria-hidden />
          </>
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

  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);

  const handleImageClick = useCallback((url: string, name: string) => {
    setLightbox({ url, name });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  return (
    <section className={styles.section} aria-label="Top productos más vendidos">
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
              onImageClick={handleImageClick}
            />
          ))}
        </div>
      )}

      {lightbox && (
        <ImageLightbox
          url={lightbox.url}
          alt={lightbox.name}
          onClose={closeLightbox}
        />
      )}
    </section>
  );
}