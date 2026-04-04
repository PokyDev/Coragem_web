"use client";

/**
 * app/(admin)/admin/dashboard/images/page.tsx
 *
 * Orquestador de la pestaña Imágenes del panel administrativo.
 *
 * Esta page es responsable únicamente de:
 *   · Renderizar JSX con los componentes de images/
 *   · Mantener los refs de DOM que necesita SelectionOverlay
 *     (scrollRef, gridRef, assetRefs) y el cardRefCallback asociado,
 *     ya que son detalles de renderizado, no de lógica de negocio.
 *
 * scrollRef → apunta al scroll container del dashboard (el elemento
 *   con overflow-y: auto que rodea el contenido de la página).
 *   SelectionOverlay escucha mousedown aquí para que el rubber-band
 *   pueda iniciarse en cualquier área vacía, no solo dentro del grid.
 *
 * Todo el estado y los handlers viven en useImagesPage.
 */

import { useRef, useCallback, useEffect } from "react";
import { useImagesPage }          from "@/hooks/admin/pages/useImagesPage";
import { FolderCard }             from "@/components/admin/images/FolderCard";
import { FolderBreadcrumb }       from "@/components/admin/images/FolderBreadcrumb";
import { DraggableAssetCard }     from "@/components/admin/images/DraggableAssetCard";
import { SelectionOverlay }       from "@/components/admin/images/SelectionOverlay";
import { DropFolderTarget }       from "@/components/admin/images/DropFolderTarget";
import { ImageDetailModal }       from "@/components/admin/images/ImageDetailModal";
import { SearchInput }            from "@/components/shared/ui/SearchInput";
import styles from "./ImagesPage.module.css";

export default function ImagesPage() {
  /* ── Refs de DOM (renderizado, no lógica de negocio) ── */

  /**
   * scrollRef → el contenedor con scroll del dashboard.
   * SelectionOverlay escucha mousedown aquí para que el rubber-band
   * sea iniciable desde cualquier área vacía de la página.
   *
   * Se busca el ancestro con overflow-y distinto de "visible" para no
   * depender de un selector CSS frágil. El fallback es document.body.
   */
  const pageRef   = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    /* Subir por el árbol del DOM hasta encontrar el scroll container */
    let el: HTMLElement | null = pageRef.current?.parentElement ?? null;
    while (el && el !== document.body) {
      const overflow = window.getComputedStyle(el).overflowY;
      if (overflow === "auto" || overflow === "scroll") {
        scrollRef.current = el;
        return;
      }
      el = el.parentElement;
    }
    /* Fallback: el body si no encontramos un contenedor con scroll */
    scrollRef.current = document.documentElement as HTMLElement;
  }, []);

  const gridRef   = useRef<HTMLDivElement>(null);
  const assetRefs = useRef<Map<string, HTMLElement>>(new Map());

  const cardRefCallback = useCallback((publicId: string, el: HTMLElement | null) => {
    if (el) {
      assetRefs.current.set(publicId, el);
    } else {
      assetRefs.current.delete(publicId);
    }
  }, []);

  /* ── Lógica de negocio ── */
  const {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,
    query,
    filteredAssets,
    isSearching,
    searchInputProps,
    clearQuery,
    selectedIds,
    selectionMode,
    isSelected,
    toggleOne,
    selectMany,
    clearSelection,
    count,
    isMoving,
    droppingTo,
    handleDrop,
    selectedAsset,
    handleOpenDetail,
    handleCloseDetail,
    handleRenamed,
  } = useImagesPage();

  /* ── Estados derivados para el JSX ── */
  const hasFolders    = folders.length > 0;
  const hasAssets     = filteredAssets.length > 0;
  const hasRawAssets  = assets.length > 0;
  const isEmpty       = !hasFolders && !hasRawAssets;
  const isEmptySearch = hasRawAssets && !hasAssets && query.trim().length > 0;

  /* ── Estados de carga y error ── */
  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Cargando biblioteca…</span>
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

  return (
    <div ref={pageRef} className={styles.root}>
      {/* ── Toolbar: breadcrumb + búsqueda + controles ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <FolderBreadcrumb
            currentPath={currentPath}
            onNavigate={navigate}
            onDrop={handleDrop}
            droppingTo={droppingTo}
          />
        </div>

        <div className={styles.toolbarRight}>
          {hasRawAssets && (
            <div className={styles.searchWrap}>
              <SearchInput
                variant="admin"
                value={searchInputProps.value}
                onChange={searchInputProps.onChange}
                onClear={clearQuery}
                placeholder="Buscar imagen…"
              />
            </div>
          )}

          {selectionMode && (
            <div className={styles.selectionBar}>
              <span className={styles.selectionCount}>
                {count} seleccionada{count !== 1 ? "s" : ""}
              </span>
              <button
                className={styles.clearSelectionBtn}
                onClick={clearSelection}
                type="button"
              >
                Limpiar
              </button>
            </div>
          )}

          <button
            className={styles.refreshBtn}
            onClick={refetch}
            disabled={loading || isMoving || isSearching}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* ── Hint de selección activa ── */}
      {selectionMode && hasFolders && (
        <div className={styles.selectionHint} aria-live="polite">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Arrastra las imágenes seleccionadas sobre una carpeta para moverlas
        </div>
      )}

      {/* ── Estado vacío ── */}
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

      {/* ── Sin resultados de búsqueda ── */}
      {isEmptySearch && (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon} aria-hidden="true">⊘</span>
          <p className={styles.emptyTitle}>Sin resultados</p>
          <p className={styles.emptyDesc}>
            Ninguna imagen coincide con &ldquo;{query}&rdquo; en este folder.
          </p>
        </div>
      )}

      {/* ── Sección de carpetas ── */}
      {hasFolders && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Carpetas</span>
            <span className={styles.sectionCount}>{folders.length}</span>
          </div>
          <div className={styles.gridFolders}>
            {folders.map((folder, i) => (
              <DropFolderTarget
                key={folder.path}
                targetPath={folder.path}
                onDrop={handleDrop}
                isDropping={droppingTo === folder.path}
              >
                <FolderCard
                  folder={folder}
                  index={i}
                  onNavigate={navigate}
                />
              </DropFolderTarget>
            ))}
          </div>
        </div>
      )}

      {hasFolders && hasAssets && <div className={styles.divider} />}

      {/* ── Sección de assets con rubber-band ── */}
      {hasAssets && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Imágenes</span>
            <span className={styles.sectionCount}>
              {query.trim()
                ? `${filteredAssets.length} de ${assets.length}`
                : assets.length}
            </span>
          </div>
          <div ref={gridRef} className={styles.grid}>
            {filteredAssets.map((asset, i) => (
              <DraggableAssetCard
                key={asset.publicId}
                asset={asset}
                index={i}
                selectionMode={selectionMode}
                isSelected={isSelected(asset.publicId)}
                selectedIds={selectedIds}
                onToggleSelect={toggleOne}
                onOpenDetail={handleOpenDetail}
                cardRefCallback={cardRefCallback}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Rubber-band selection overlay ──
          listenRef  → todo el scroll container del dashboard (área activa ampliada)
          containerRef → solo el grid (para delimitar intersecciones)
      ── */}
      <SelectionOverlay
        listenRef={scrollRef}
        containerRef={gridRef}
        assetRefs={assetRefs}
        onSelect={selectMany}
        enabled={!isMoving}
      />

      {/* ── Modal de detalle / renombrar ── */}
      <ImageDetailModal
        asset={selectedAsset}
        onClose={handleCloseDetail}
        onRenamed={handleRenamed}
      />
    </div>
  );
}