"use client";

/**
 * src/components/admin/images/AssetCard.tsx
 *
 * Tarjeta de asset de Cloudinary reutilizable.
 *
 * Props:
 *   mode="gallery" → click abre detalle/renombrar (ImageDetailModal).
 *                    Se usa en /dashboard/images.
 *   mode="picker"  → click devuelve el asset al padre vía onSelect.
 *                    Se usa en ImagePickerModal dentro de ProductFormModal.
 *
 * isSelected solo aplica en modo "picker".
 */

import Image from "next/image";
import type { CloudinaryAsset } from "@/hooks/admin/useCloudinaryImages";
import styles from "./AssetCard.module.css";

/* ── Helpers ── */
function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* ── Props ── */
interface AssetCardGalleryProps {
  mode:       "gallery";
  asset:      CloudinaryAsset;
  index:      number;
  onClick:    (asset: CloudinaryAsset) => void;
  isSelected?: never;
}

interface AssetCardPickerProps {
  mode:       "picker";
  asset:      CloudinaryAsset;
  index:      number;
  onClick:    (asset: CloudinaryAsset) => void;
  isSelected: boolean;
}

type AssetCardProps = AssetCardGalleryProps | AssetCardPickerProps;

/* ── Component ── */
export function AssetCard({ asset, index, onClick, mode, isSelected = false }: AssetCardProps) {
  const isPicker = mode === "picker";

  return (
    <button
      className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
      style={{ animationDelay: `${index * 0.035}s` }}
      onClick={() => onClick(asset)}
      type="button"
      aria-label={isPicker ? `Seleccionar ${asset.displayName}` : `Ver detalle de ${asset.displayName}`}
      aria-pressed={isPicker ? isSelected : undefined}
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

        {/* Overlay con ícono contextual */}
        <div className={styles.thumbOverlay}>
          {isPicker ? (
            <svg
              className={styles.overlayIcon}
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              className={styles.overlayIcon}
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8"  x2="11"    y2="14"    />
              <line x1="8"  y1="11" x2="14"    y2="11"    />
            </svg>
          )}
        </div>

        {/* Check de selección (solo picker) */}
        {isPicker && (
          <div className={styles.checkIcon} aria-hidden="true">
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d1520"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
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