"use client";

/**
 * app/(admin)/admin/dashboard/images/page.tsx
 *
 * Browser de Cloudinary con navegación por carpetas.
 *
 * Comportamiento:
 * - Al montar restaura la última carpeta visitada (localStorage).
 * - Si no hay historial, arranca desde la raíz de Cloudinary.
 * - El breadcrumb permite navegar hacia atrás en cualquier nivel.
 * - Las carpetas se muestran arriba con FolderCard.
 * - Los assets se muestran debajo con AssetCard (modo gallery).
 * - Ambas secciones están separadas por un divisor con label.
 */

import { useState, useCallback, useEffect } from "react";
import type { CloudinaryAsset }   from "@/hooks/admin/useCloudinaryImages";
import { useCloudinaryBrowser }   from "@/hooks/admin/useCloudinaryBrowser";
import { FolderCard }             from "@/components/admin/images/FolderCard";
import { FolderBreadcrumb }       from "@/components/admin/images/FolderBreadcrumb";
import { AssetCard }              from "@/components/admin/images/AssetCard";
import { ImageDetailModal }       from "@/components/admin/images/ImageDetailModal";
import { useDashboardActions }    from "@/components/admin/layout/AdminShell";
import styles from "./ImagesPage.module.css";

/* ── Page ── */
export default function ImagesPage() {
  const {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,
  } = useCloudinaryBrowser();

  const { registerNewProductAction } = useDashboardActions();

  const [selected, setSelected] = useState<CloudinaryAsset | null>(null);

  /* Esta página no usa el botón "+ Nuevo Producto" del topbar */
  useEffect(() => {
    registerNewProductAction(() => {});
  }, [registerNewProductAction]);

  const handleOpen  = useCallback((asset: CloudinaryAsset) => setSelected(asset), []);
  const handleClose = useCallback(() => setSelected(null), []);

  const handleRenamed = useCallback(() => {
    refetch();
  }, [refetch]);

  /* ── Estado de carga ── */
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Cargando biblioteca…</span>
      </div>
    );
  }

  /* ── Estado de error ── */
  if (error) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorText}>{error}</span>
      </div>
    );
  }

  const hasFolders = folders.length > 0;
  const hasAssets  = assets.length > 0;
  const isEmpty    = !hasFolders && !hasAssets;

  return (
    <>
      {/* Toolbar: breadcrumb + botón actualizar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <FolderBreadcrumb
            currentPath={currentPath}
            onNavigate={navigate}
          />
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

      {/* Estado vacío */}
      {isEmpty && (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon} aria-hidden="true">⊞</span>
          <p className={styles.emptyTitle}>Carpeta vacía</p>
          <p className={styles.emptyDesc}>
            {currentPath
              ? `No hay carpetas ni imágenes en "${currentPath}".`
              : "No hay carpetas en la raíz de Cloudinary."}
          </p>
        </div>
      )}

      {/* Sección de carpetas */}
      {hasFolders && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Carpetas</span>
            <span className={styles.sectionCount}>{folders.length}</span>
          </div>
          <div className={styles.gridFolders}>
            {folders.map((folder, i) => (
              <FolderCard
                key={folder.path}
                folder={folder}
                index={i}
                onNavigate={navigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Divisor entre carpetas y assets (solo si hay ambos) */}
      {hasFolders && hasAssets && <div className={styles.divider} />}

      {/* Sección de assets */}
      {hasAssets && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Imágenes</span>
            <span className={styles.sectionCount}>{assets.length}</span>
          </div>
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
        </div>
      )}

      {/* Modal de detalle / renombrar */}
      <ImageDetailModal
        asset={selected}
        onClose={handleClose}
        onRenamed={handleRenamed}
      />
    </>
  );
}