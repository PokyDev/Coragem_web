"use client";

/**
 * app/(admin)/admin/dashboard/images/page.tsx
 *
 * Browser de Cloudinary con navegación, selección múltiple,
 * rubber-band selection y drag & drop para mover assets entre carpetas.
 *
 * Flujo:
 *   1. Navegar carpetas con FolderBreadcrumb + FolderCard (como antes).
 *   2. Buscar assets en el folder actual con SearchInput (useImageSearch).
 *      — Preparado para modo global: cambiar mode="global" en useImageSearch
 *        cuando el endpoint esté disponible, sin tocar este componente.
 *   3. Seleccionar assets:
 *      a) Click en checkbox individual (aparece al hacer hover o en selectionMode)
 *      b) Arrastrar sobre el fondo del grid (rubber-band)
 *   4. Mover assets:
 *      a) Arrastrar tarjeta(s) sobre un FolderCard o segmento del breadcrumb
 *      b) El backend recibe los publicIds y el targetFolder
 *      c) Tras el move: clearSelection + refetch
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { CloudinaryAsset }   from "@/hooks/admin/useCloudinaryImages";
import { useCloudinaryBrowser }   from "@/hooks/admin/useCloudinaryBrowser";
import { useAssetSelection }      from "@/hooks/admin/useAssetSelection";
import { useMoveAssets }          from "@/hooks/admin/useMoveAssets";
import { useImageSearch }         from "@/hooks/admin/useImageSearch";
import { FolderCard }             from "@/components/admin/images/FolderCard";
import { FolderBreadcrumb }       from "@/components/admin/images/FolderBreadcrumb";
import { DraggableAssetCard }     from "@/components/admin/images/DraggableAssetCard";
import { SelectionOverlay }       from "@/components/admin/images/SelectionOverlay";
import { DropFolderTarget }       from "@/components/admin/images/DropFolderTarget";
import { ImageDetailModal }       from "@/components/admin/images/ImageDetailModal";
import { SearchInput }            from "@/components/shared/ui/SearchInput";
import { useDashboardActions }    from "@/components/admin/layout/AdminShell";
import styles from "./ImagesPage.module.css";

/* ── Lazy SweetAlert2 ── */
async function getSwal() {
  return (await import("sweetalert2")).default;
}

const SWAL_THEME = {
  background:         "#111827",
  color:              "#e2e8f0",
  confirmButtonColor: "#4ec4c4",
} as const;

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

  const {
    selectedIds,
    selectionMode,
    isSelected,
    toggleOne,
    selectMany,
    clearSelection,
    count,
  } = useAssetSelection();

  const { move, isMoving, error: moveError, clearError: clearMoveError } = useMoveAssets();

  const { registerNewProductAction } = useDashboardActions();

  /*
   * Búsqueda de assets.
   * mode="local" → filtra en memoria los assets del folder actual.
   * Para activar búsqueda global en el futuro: cambiar a mode="global".
   * La interfaz de retorno (filteredAssets, query, inputProps, clearQuery)
   * es idéntica en ambos modos — ImagesPage no necesitará cambios.
   */
  const {
    query,
    filteredAssets,
    isSearching,
    inputProps: searchInputProps,
    clearQuery,
  } = useImageSearch({
    assets,
    mode: "local",
    onQueryChange: clearSelection,
  });

  const [selected,    setSelected]   = useState<CloudinaryAsset | null>(null);
  const [droppingTo,  setDroppingTo] = useState<string | null>(null);

  /* Ref del grid — usado por SelectionOverlay */
  const gridRef    = useRef<HTMLDivElement>(null);
  /* Map publicId → HTMLElement — para el rubber-band hit test */
  const assetRefs  = useRef<Map<string, HTMLElement>>(new Map());

  /* Esta página no usa el botón "+ Nuevo Producto" del topbar */
  useEffect(() => {
    registerNewProductAction(() => {});
  }, [registerNewProductAction]);

  /* Abrir / cerrar modal de detalle */
  const handleOpenDetail  = useCallback((asset: CloudinaryAsset) => setSelected(asset), []);
  const handleCloseDetail = useCallback(() => setSelected(null), []);

  const handleRenamed = useCallback(() => { refetch(); }, [refetch]);

  /* Callback para que DraggableAssetCard registre su DOM element */
  const cardRefCallback = useCallback((publicId: string, el: HTMLElement | null) => {
    if (el) {
      assetRefs.current.set(publicId, el);
    } else {
      assetRefs.current.delete(publicId);
    }
  }, []);

  /* Mover assets — llamado desde DropFolderTarget */
  const handleDrop = useCallback(async (publicIds: string[], targetPath: string) => {
    /* No mover hacia la carpeta actual */
    if (targetPath === currentPath) return;

    setDroppingTo(targetPath);
    const ok = await move(publicIds, targetPath);
    setDroppingTo(null);

    if (ok) {
      clearSelection();
      refetch();

      const Swal = await getSwal();
      await Swal.fire({
        title:             publicIds.length > 1
          ? `${publicIds.length} imágenes movidas`
          : "Imagen movida",
        text:              `Assets movidos a "${targetPath || "raíz"}" correctamente.`,
        icon:              "success",
        confirmButtonText: "Aceptar",
        timer:             2400,
        timerProgressBar:  true,
        ...SWAL_THEME,
      });
    } else if (moveError) {
      const Swal = await getSwal();
      await Swal.fire({
        title: "Error al mover",
        text:  moveError,
        icon:  "error",
        confirmButtonText: "Aceptar",
        ...SWAL_THEME,
      });
      clearMoveError();
    }
  }, [currentPath, move, clearSelection, refetch, moveError, clearMoveError]);

  /* ── Estado de carga ── */
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

  const hasFolders      = folders.length > 0;
  const hasAssets       = filteredAssets.length > 0;
  const hasRawAssets    = assets.length > 0;
  const isEmpty         = !hasFolders && !hasRawAssets;
  const isEmptySearch   = hasRawAssets && !hasAssets && query.trim().length > 0;

  return (
    <>
      {/* Toolbar: breadcrumb + búsqueda + controles */}
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
          {/* Buscador de assets — visible cuando hay assets en el folder */}
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

          {/* Contador de selección + botón limpiar */}
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

      {/* Hint de instrucciones cuando hay selección activa */}
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

      {/* Estado vacío — folder sin contenido */}
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

      {/* Sin resultados de búsqueda */}
      {isEmptySearch && (
        <div className={styles.emptyWrap}>
          <span className={styles.emptyIcon} aria-hidden="true">⊘</span>
          <p className={styles.emptyTitle}>Sin resultados</p>
          <p className={styles.emptyDesc}>
            Ninguna imagen coincide con &ldquo;{query}&rdquo; en este folder.
          </p>
        </div>
      )}

      {/* Sección de carpetas — cada una es un DropFolderTarget */}
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

      {/* Sección de assets — con SelectionOverlay para rubber-band */}
      {hasAssets && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Imágenes</span>
            {/* Mostrar cuántas matchean si hay búsqueda activa */}
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

          {/* Rubber-band selection overlay */}
          <SelectionOverlay
            containerRef={gridRef}
            assetRefs={assetRefs}
            onSelect={selectMany}
            enabled={!isMoving}
          />
        </div>
      )}

      {/* Modal de detalle / renombrar */}
      <ImageDetailModal
        asset={selected}
        onClose={handleCloseDetail}
        onRenamed={handleRenamed}
      />
    </>
  );
}