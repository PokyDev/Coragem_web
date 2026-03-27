"use client";

/**
 * app/(admin)/admin/dashboard/images/page.tsx
 *
 * Galería de assets de Cloudinary.
 * Usa AssetCard en modo "gallery" — el componente es compartido con
 * ImagePickerModal que lo usa en modo "picker".
 */

import { useState, useCallback, useEffect } from "react";
import type { CloudinaryAsset } from "@/hooks/admin/useCloudinaryImages";
import { useCloudinaryImages }  from "@/hooks/admin/useCloudinaryImages";
import { AssetCard }            from "@/components/admin/images/AssetCard";
import { ImageDetailModal }     from "@/components/admin/images/ImageDetailModal";
import { useDashboardActions }  from "@/components/admin/layout/AdminShell";
import styles from "./ImagesPage.module.css";

/* ── Page ── */
export default function ImagesPage() {
  const { assets, loading, error, refetch } = useCloudinaryImages();
  const { registerNewProductAction }        = useDashboardActions();

  const [selected, setSelected] = useState<CloudinaryAsset | null>(null);

  /* Esta página no usa el botón "+ Nuevo Producto" del topbar */
  useEffect(() => {
    registerNewProductAction(() => {});
  }, [registerNewProductAction]);

  const handleOpen  = useCallback((asset: CloudinaryAsset) => setSelected(asset), []);
  const handleClose = useCallback(() => setSelected(null), []);

  /* Tras renombrar: refetch para sincronizar la lista */
  const handleRenamed = useCallback(() => {
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

      {/* Grid — AssetCard en modo "gallery" */}
      <div className={styles.grid}>
        {assets.map((asset, i) => (
          <AssetCard
            key={asset.publicId}
            mode="gallery"
            asset={asset}
            index={i}
            onClick={handleOpen}
          />
        ))}
      </div>

      {/* Modal de detalle / renombrar */}
      <ImageDetailModal
        asset={selected}
        onClose={handleClose}
        onRenamed={handleRenamed}
      />
    </>
  );
}