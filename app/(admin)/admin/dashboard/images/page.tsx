"use client";

/**
 * app/(admin)/admin/dashboard/images/page.tsx
 *
 * Galería de assets de Cloudinary.
 * Carga la lista desde el backend y permite:
 *   · Ver thumbnails en grid
 *   · Abrir modal con vista ampliada + metadatos
 *   · Renombrar assets (actualiza el estado local sin refetch global)
 */

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import type { CloudinaryAsset } from "@/hooks/admin/useCloudinaryImages";
import { useCloudinaryImages } from "@/hooks/admin/useCloudinaryImages";
import { ImageDetailModal } from "@/components/admin/images/ImageDetailModal";
import { useDashboardActions } from "@/components/admin/layout/AdminShell";
import styles from "./ImagesPage.module.css";

/* ── Helpers ─────────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 * 1024)  return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ── Tarjeta de asset ────────────────────────────────────────────── */
interface CardProps {
  asset:      CloudinaryAsset;
  index:      number;
  onClick:    (asset: CloudinaryAsset) => void;
}

function AssetCard({ asset, index, onClick }: CardProps) {
  return (
    <button
      className={styles.card}
      style={{ animationDelay: `${index * 0.035}s` }}
      onClick={() => onClick(asset)}
      type="button"
      aria-label={`Ver detalle de ${asset.displayName}`}
    >
      {/* Thumbnail */}
      <div className={styles.thumb}>
        <Image
          src={asset.secureUrl}
          alt={asset.displayName}
          fill
          sizes="220px"
          className={styles.thumbImg}
        />
        <div className={styles.thumbOverlay}>
          <svg className={styles.zoomIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8"  x2="11"    y2="14"    />
            <line x1="8"  y1="11" x2="14"    y2="11"    />
          </svg>
        </div>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.name} title={asset.displayName}>{asset.displayName}</p>
        <p className={styles.meta}>
          {asset.format.toUpperCase()} · {asset.width}×{asset.height} · {formatBytes(asset.bytes)}
        </p>
      </div>
    </button>
  );
}

/* ── Page ────────────────────────────────────────────────────────── */
export default function ImagesPage() {
  const { assets, loading, error, refetch } = useCloudinaryImages();
  const { registerNewProductAction } = useDashboardActions();

  const [selected, setSelected] = useState<CloudinaryAsset | null>(null);

  /* Registrar acción del botón "Nuevo Producto" del topbar como no-op aquí */
  useEffect(() => {
    registerNewProductAction(() => {});
  }, [registerNewProductAction]);

  const handleOpen  = useCallback((asset: CloudinaryAsset) => setSelected(asset), []);
  const handleClose = useCallback(() => setSelected(null), []);

  /* Actualizar el asset renombrado en el estado local sin refetch */
  const handleRenamed = useCallback((
    oldPublicId: string,
    newPublicId:  string,
    newUrl:       string,
  ) => {
    // El hook no expone setAssets, así que hacemos refetch tras rename.
    // Para una UX más fluida se podría elevar el estado, pero dado que
    // el listado de Cloudinary es rápido, el refetch es aceptable.
    void oldPublicId; void newPublicId; void newUrl;
    refetch();
  }, [refetch]);

  /* ── Estados de carga / error / vacío ── */
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Cargando biblioteca de imágenes…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorText}>{error}</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className={styles.emptyWrap}>
        <span className={styles.emptyIcon} aria-hidden="true">⊞</span>
        <p className={styles.emptyTitle}>Sin imágenes</p>
        <p className={styles.emptyDesc}>
          No hay assets en la carpeta <code>coragem/products</code> de Cloudinary.
          Crea un producto con imagen para que aparezca aquí.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.count}>
            {assets.length} imagen{assets.length !== 1 ? "es" : ""}
          </span>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={refetch}
          disabled={loading}
          type="button"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {assets.map((asset, i) => (
          <AssetCard
            key={asset.publicId}
            asset={asset}
            index={i}
            onClick={handleOpen}
          />
        ))}
      </div>

      {/* Modal */}
      <ImageDetailModal
        asset={selected}
        onClose={handleClose}
        onRenamed={handleRenamed}
      />
    </>
  );
}