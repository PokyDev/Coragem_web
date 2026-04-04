"use client";

/**
 * src/components/admin/images/ImagePickerModal.tsx
 *
 * Modal para seleccionar un asset de Cloudinary.
 * Usado desde ProductFormModal para asignar imagen a un producto.
 *
 * Permite navegar la jerarquía completa de carpetas de Cloudinary,
 * arrancando siempre en `coragem/products` (el folder raíz de producto).
 * Cada apertura del modal resetea la navegación a ese punto de partida.
 *
 * Flujo:
 *   1. Se abre con isOpen=true → navega a coragem/products.
 *   2. Muestra subcarpetas (FolderCard) y assets (AssetCard en modo picker).
 *   3. El admin puede entrar en subcarpetas via FolderCard o FolderBreadcrumb.
 *   4. La búsqueda filtra los assets del folder actualmente visible.
 *   5. Click en un AssetCard lo selecciona; confirmar llama a onSelect(asset).
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { CloudinaryAsset }    from "@/hooks/admin/cloudinary/useCloudinaryImages";
import { useCloudinaryPicker }     from "@/hooks/admin/cloudinary/useCloudinaryPicker";
import { AssetCard }               from "@/components/admin/images/AssetCard";
import { FolderCard }              from "@/components/admin/images/FolderCard";
import { FolderBreadcrumb }        from "@/components/admin/images/FolderBreadcrumb";
import { SearchInput }             from "@/components/shared/ui/SearchInput";
import { useProductSearch }        from "@/hooks/shared/useProductSearch";
import styles from "./ImagePickerModal.module.css";

const PICKER_ROOT = "coragem/products";

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

  const {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,
  } = useCloudinaryPicker({
    initialPath: PICKER_ROOT,
    resetOnOpen: isOpen,
  });

  const { query, clearQuery, inputProps } = useProductSearch({
    onChange: () => setSelected(null),
  });

  /* Filtrar assets por búsqueda (solo en el folder actual) */
  const filteredAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      a.displayName.toLowerCase().includes(q)
    );
  }, [assets, query]);

  /* Animación de apertura/cierre + reset de selección y búsqueda */
  useEffect(() => {
    if (isOpen) {
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

  /* Limpiar selección y búsqueda al navegar a otra carpeta */
  const handleNavigate = useCallback((path: string) => {
    setSelected(null);
    clearQuery();
    navigate(path);
  }, [navigate, clearQuery]);

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

  const hasFolders = folders.length > 0;
  const hasAssets  = filteredAssets.length > 0;
  const isEmpty    = !hasFolders && !hasAssets && !loading && !error;

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
        {/* ── Header ── */}
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

        {/* ── Toolbar: breadcrumb + búsqueda ── */}
        <div className={styles.toolbar}>
          {/* Fila superior: breadcrumb de navegación */}
          <div className={styles.toolbarTop}>
            <FolderBreadcrumb
              currentPath={currentPath}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Fila inferior: búsqueda + conteo de assets */}
          <div className={styles.toolbarBottom}>
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
        </div>

        {/* ── Cuerpo scrolleable ── */}
        {loading && (
          <div className={styles.stateWrap}>
            <span className={styles.stateDesc}>Cargando…</span>
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateWrap}>
            <span className={styles.stateError}>{error}</span>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <div className={styles.stateWrap}>
            <span className={styles.stateIcon} aria-hidden="true">⊞</span>
            <p className={styles.stateTitle}>Carpeta vacía</p>
            <p className={styles.stateDesc}>
              No hay carpetas ni imágenes en este directorio.
            </p>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <div className={styles.gridScroll}>

            {/* Sección de carpetas */}
            {hasFolders && (
              <div className={styles.foldersSection}>
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
                      onNavigate={handleNavigate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Divisor entre carpetas y assets */}
            {hasFolders && hasAssets && (
              <div className={styles.divider} />
            )}

            {/* Sección de assets */}
            {hasAssets && (
              <div className={styles.assetsSection}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionLabel}>Imágenes</span>
                  <span className={styles.sectionCount}>{filteredAssets.length}</span>
                </div>
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

            {/* Sin resultados de búsqueda (hay assets pero el filtro no matchea) */}
            {!hasFolders && !hasAssets && query && (
              <div className={styles.stateWrap}>
                <span className={styles.stateIcon} aria-hidden="true">⊞</span>
                <p className={styles.stateTitle}>Sin resultados</p>
                <p className={styles.stateDesc}>
                  Ninguna imagen coincide con &ldquo;{query}&rdquo;.
                </p>
              </div>
            )}

          </div>
        )}

        {/* ── Footer ── */}
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