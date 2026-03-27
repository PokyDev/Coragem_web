"use client";

/**
 * src/components/admin/images/ImagePickerModal.tsx
 *
 * Modal para seleccionar un asset de Cloudinary.
 * Usado desde ProductFormModal para asignar imagen a un producto.
 *
 * Flujo:
 *   1. Se abre con isOpen=true.
 *   2. Carga assets vía useCloudinaryImages.
 *   3. El admin busca y hace click en una AssetCard (modo "picker").
 *   4. Al confirmar, llama a onSelect(asset) y se cierra.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CloudinaryAsset } from "@/hooks/admin/useCloudinaryImages";
import { useCloudinaryImages } from "@/hooks/admin/useCloudinaryImages";
import { AssetCard }           from "@/components/admin/images/AssetCard";
import { SearchInput }         from "@/components/shared/ui/SearchInput";
import { useProductSearch }    from "@/hooks/shared/useProductSearch";
import styles from "./ImagePickerModal.module.css";

/* ── Props ── */
interface ImagePickerModalProps {
  isOpen:   boolean;
  onClose:  () => void;
  onSelect: (asset: CloudinaryAsset) => void;
}

/* ── Component ── */
export function ImagePickerModal({ isOpen, onClose, onSelect }: ImagePickerModalProps) {
  const [visible,  setVisible]  = useState(false);
  const [selected, setSelected] = useState<CloudinaryAsset | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const { assets, loading, error } = useCloudinaryImages();

  const { query, setQuery, clearQuery, inputProps } = useProductSearch({
    onChange: () => setSelected(null),
  });

  /* Filtrado por nombre */
  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      a.displayName.toLowerCase().includes(q)
    );
  }, [assets, query]);

  /* Animación de apertura/cierre */
  useEffect(() => {
    if (isOpen) {
      /* Resetear estado al abrir */
      setSelected(null);
      clearQuery();
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    } else {
      setVisible(false);
    }
  // clearQuery es estable — incluirla es seguro
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* Cerrar con Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  /* Click fuera del panel */
  const handleBackdrop = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    onSelect(selected);
    onClose();
  }, [selected, onSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.backdrop} ${visible ? styles.backdropVisible : ""}`}
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-label="Seleccionar imagen"
    >
      <div
        ref={panelRef}
        className={`${styles.panel} ${visible ? styles.panelVisible : ""}`}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerEyebrow}>Biblioteca de imágenes</span>
            <h2 className={styles.headerTitle}>Seleccionar imagen</h2>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <SearchInput
              variant="admin"
              value={inputProps.value}
              onChange={inputProps.onChange}
              onClear={clearQuery}
              placeholder="Buscar imagen…"
            />
          </div>
          {!loading && !error && (
            <span className={styles.count}>
              {filteredAssets.length} imagen{filteredAssets.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>

        {/* Cuerpo: grid o estados */}
        {loading && (
          <div className={styles.stateWrap}>
            <span className={styles.stateDesc}>Cargando imágenes…</span>
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateWrap}>
            <span className={styles.stateError}>{error}</span>
          </div>
        )}

        {!loading && !error && filteredAssets.length === 0 && (
          <div className={styles.stateWrap}>
            <span className={styles.stateIcon} aria-hidden="true">⊞</span>
            <p className={styles.stateTitle}>
              {query ? "Sin resultados" : "Sin imágenes"}
            </p>
            <p className={styles.stateDesc}>
              {query
                ? `Ninguna imagen coincide con "${query}".`
                : "No hay assets en la carpeta coragem/products de Cloudinary."}
            </p>
          </div>
        )}

        {!loading && !error && filteredAssets.length > 0 && (
          <div className={styles.gridScroll}>
            <div className={styles.grid}>
              {filteredAssets.map((asset, i) => (
                <AssetCard
                  key={asset.publicId}
                  mode="picker"
                  asset={asset}
                  index={i}
                  onClick={setSelected}
                  isSelected={selected?.publicId === asset.publicId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.selectedLabel}>
            {selected ? (
              <>Seleccionada: <strong>{selected.displayName}</strong></>
            ) : (
              "Ninguna imagen seleccionada"
            )}
          </p>
          <button
            className={styles.btnConfirm}
            onClick={handleConfirm}
            disabled={!selected}
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Confirmar selección
          </button>
        </div>
      </div>
    </div>
  );
}