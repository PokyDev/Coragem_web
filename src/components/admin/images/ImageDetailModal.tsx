"use client";

/**
 * src/components/admin/images/ImageDetailModal.tsx
 *
 * Modal de detalle de un asset de Cloudinary.
 *
 * Cambio respecto a la versión anterior:
 *   onRenamed() → firma simplificada sin parámetros.
 *   ImagesPage llama a refetch() directamente; el modal no necesita
 *   comunicar los nuevos valores porque la recarga los trae frescos.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import type { CloudinaryAsset } from "@/hooks/admin/cloudinary/useCloudinaryImages";
import { api } from "@/lib/api";
import styles from "./ImageDetailModal.module.css";

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric", month: "short", day: "numeric",
  });
}

interface Props {
  asset:     CloudinaryAsset | null;
  onClose:   () => void;
  /** Llamado tras un rename exitoso — sin parámetros; el padre hace refetch */
  onRenamed: () => void;
}

export function ImageDetailModal({ asset, onClose, onRenamed }: Props) {
  const [visible,     setVisible]     = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renaming,    setRenaming]    = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const [copied,      setCopied]      = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (asset) {
      setRenameValue(asset.displayName);
      setRenameError(null);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  }, [asset]);

  useEffect(() => {
    if (!asset) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [asset, onClose]);

  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
  }, [onClose]);

  const handleRename = useCallback(async () => {
    if (!asset) return;
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === asset.displayName) return;

    setRenaming(true);
    setRenameError(null);

    const encodedId = encodeURIComponent(asset.publicId);
    const res = await api.patch<{
      asset: { publicId: string; secureUrl: string; displayName: string };
    }>(
      `/api/admin/cloudinary/images/${encodedId}/rename`,
      { newName: trimmed },
    );

    setRenaming(false);

    if (res.error || !res.data) {
      setRenameError(res.error ?? 'Error al renombrar');
      return;
    }

    onRenamed();
    onClose();
  }, [asset, renameValue, onRenamed, onClose]);

  const handleCopy = useCallback(async () => {
    if (!asset) return;
    await navigator.clipboard.writeText(asset.publicId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, [asset]);

  if (!asset) return null;

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropVisible : ""}`}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle: ${asset.displayName}`}
    >
      <div
        ref={panelRef}
        className={`${styles.modal} ${visible ? styles.modalVisible : ""}`}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.modalEyebrow}>Asset de Cloudinary</p>
            <h2 className={styles.modalTitle}>{asset.displayName}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6"  y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.modalBody}>

          <div className={styles.previewWrap}>
            <Image src={asset.secureUrl} alt={asset.displayName} fill sizes="400px" className={styles.previewImg} priority />
          </div>

          <div className={styles.details}>

            <div className={styles.renameSection}>
              <span className={styles.fieldLabel}>Nombre del asset</span>
              <div className={styles.renameRow}>
                <input
                  className={styles.renameInput}
                  type="text"
                  value={renameValue}
                  onChange={(e) => { setRenameValue(e.target.value); setRenameError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
                  placeholder="Nuevo nombre…"
                  disabled={renaming}
                />
                <button
                  className={styles.renameBtn}
                  onClick={handleRename}
                  disabled={renaming || !renameValue.trim() || renameValue.trim() === asset.displayName}
                  type="button"
                >
                  {renaming ? "…" : "Renombrar"}
                </button>
              </div>
              {renameError && <span className={styles.renameError}>{renameError}</span>}
            </div>

            <div className={styles.divider} />

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Formato</p>
                <p className={`${styles.metaValue} ${styles.metaValueAccent}`}>{asset.format.toUpperCase()}</p>
              </div>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Tamaño</p>
                <p className={styles.metaValue}>{formatBytes(asset.bytes)}</p>
              </div>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Dimensiones</p>
                <p className={styles.metaValue}>{asset.width} × {asset.height} px</p>
              </div>
              <div className={styles.metaItem}>
                <p className={styles.metaLabel}>Subido el</p>
                <p className={styles.metaValue}>{formatDate(asset.createdAt)}</p>
              </div>
              <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                <p className={styles.metaLabel}>Carpeta</p>
                <p className={styles.metaValue}>{asset.folder || "—"}</p>
              </div>
              <div className={styles.metaItem} style={{ gridColumn: "1 / -1" }}>
                <p className={styles.metaLabel}>Public ID</p>
                <div className={styles.publicIdRow}>
                  <p className={styles.metaValue} style={{ flex: 1 }}>{asset.publicId}</p>
                  <button
                    className={`${styles.copyBtn} ${copied ? styles.copyOk : ""}`}
                    onClick={handleCopy}
                    type="button"
                    aria-label="Copiar public ID"
                  >
                    {copied ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.metaItem}>
              <p className={styles.metaLabel}>URL segura</p>
              <a href={asset.secureUrl} target="_blank" rel="noopener noreferrer" className={styles.urlLink}>
                {asset.secureUrl}
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}