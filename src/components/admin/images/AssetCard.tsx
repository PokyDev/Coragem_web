"use client";

/**
 * src/components/admin/images/AssetCard.tsx
 *
 * Tarjeta de asset de Cloudinary reutilizable.
 *
 * Modos:
 *   mode="gallery"  → click abre detalle/renombrar (ImageDetailModal).
 *                     Cuando selectionMode=true, click hace toggle de selección
 *                     y aparece un checkbox. El detalle queda accesible por
 *                     un botón secundario (ícono de zoom).
 *   mode="picker"   → click devuelve el asset al padre vía onSelect.
 *                     Se usa en ImagePickerModal dentro de ProductFormModal.
 *
 * Props de selección (solo mode="gallery"):
 *   selectionMode  → activa los checkboxes en todas las tarjetas
 *   isSelected     → esta tarjeta está seleccionada
 *   onToggleSelect → callback para toggle de selección
 *   onOpenDetail   → callback para abrir el detalle (sustituye onClick en selectionMode)
 */

import Image from "next/image";
import type { CloudinaryAsset } from "@/hooks/admin/cloudinary/useCloudinaryImages";
import styles from "./AssetCard.module.css";

/* ── Helpers ── */
function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ── Props ── */
interface AssetCardGalleryProps {
  mode:           "gallery";
  asset:          CloudinaryAsset;
  index:          number;
  onClick:        (asset: CloudinaryAsset) => void;
  selectionMode?: boolean;
  isSelected?:    boolean;
  onToggleSelect?: (publicId: string) => void;
  onOpenDetail?:  (asset: CloudinaryAsset) => void;
}

interface AssetCardPickerProps {
  mode:            "picker";
  asset:           CloudinaryAsset;
  index:           number;
  onClick:         (asset: CloudinaryAsset) => void;
  isSelected:      boolean;
  selectionMode?:  never;
  onToggleSelect?: never;
  onOpenDetail?:   never;
}

type AssetCardProps = AssetCardGalleryProps | AssetCardPickerProps;

/* ── Component ── */
export function AssetCard({
  asset,
  index,
  onClick,
  mode,
  isSelected     = false,
  selectionMode  = false,
  onToggleSelect,
  onOpenDetail,
}: AssetCardProps) {
  const isPicker    = mode === "picker";
  const isGallery   = mode === "gallery";
  const inSelectMode = isGallery && selectionMode;

  /* En gallery + selectionMode: click = toggle selección */
  const handleClick = () => {
    if (isPicker) {
      onClick(asset);
      return;
    }
    if (inSelectMode && onToggleSelect) {
      onToggleSelect(asset.publicId);
    } else {
      onClick(asset);
    }
  };

  return (
    <button
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""} ${inSelectMode ? styles.cardSelectable : ""}`}
      style={{ animationDelay: `${index * 0.035}s` }}
      onClick={handleClick}
      type="button"
      aria-label={
        isPicker
          ? `Seleccionar ${asset.displayName}`
          : inSelectMode
          ? `${isSelected ? "Deseleccionar" : "Seleccionar"} ${asset.displayName}`
          : `Ver detalle de ${asset.displayName}`
      }
      aria-pressed={isPicker || inSelectMode ? isSelected : undefined}
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

        {/* Overlay contextual */}
        <div className={styles.thumbOverlay}>
          {isPicker ? (
            <svg
              className={styles.overlayIcon}
              width="20" height="20" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : !inSelectMode ? (
            <svg
              className={styles.overlayIcon}
              width="22" height="22" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8"  x2="11"    y2="14"    />
              <line x1="8"  y1="11" x2="14"    y2="11"    />
            </svg>
          ) : null}
        </div>

        {/* Checkbox de selección — gallery + selectionMode */}
        {isGallery && (
          <div
            className={`${styles.checkbox} ${isSelected ? styles.checkboxChecked : ""} ${selectionMode ? styles.checkboxVisible : ""}`}
            aria-hidden="true"
          >
            {isSelected && (
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0d1520" strokeWidth="3.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        )}

        {/* Check de selección picker — siempre visible cuando está seleccionado */}
        {isPicker && (
          <div className={styles.checkIcon} aria-hidden="true">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0d1520" strokeWidth="3" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* Botón de detalle — solo gallery + selectionMode */}
        {isGallery && selectionMode && onOpenDetail && (
          <button
            className={styles.detailBtn}
            onClick={(e) => { e.stopPropagation(); onOpenDetail(asset); }}
            type="button"
            aria-label={`Ver detalle de ${asset.displayName}`}
            title="Ver detalle"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <p className={styles.name} title={asset.displayName}>
          {asset.displayName}
        </p>
        <p className={styles.meta}>
          {asset.format.toUpperCase()} · {asset.width}×{asset.height} · {formatBytes(asset.bytes)}
        </p>
      </div>
    </button>
  );
}