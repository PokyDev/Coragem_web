"use client";

/**
 * src/hooks/admin/pages/useImagesPage.ts
 *
 * Hook orquestador de la pestaña Imágenes del panel administrativo.
 *
 * Concentra todo el estado y handlers de negocio, manteniéndose
 * agnóstico al DOM. Los refs de renderizado (gridRef, assetRefs)
 * y el cardRefCallback viven en page.tsx junto al JSX.
 *
 * Responsabilidades:
 *   · Navegación de carpetas            (useCloudinaryBrowser)
 *   · Selección múltiple de assets      (useAssetSelection)
 *   · Movimiento de assets              (useMoveAssets)
 *   · Búsqueda local de assets          (useImageSearch)
 *   · Registro de acción en el topbar   (useDashboardActions)
 *   · Handlers de detalle y renombrado
 *   · Confirmaciones SweetAlert2 post-movimiento
 */

import { useState, useCallback, useEffect } from "react";
import type { CloudinaryAsset }   from "@/hooks/admin/cloudinary/useCloudinaryImages";
import { useCloudinaryBrowser }   from "@/hooks/admin/cloudinary/useCloudinaryBrowser";
import { useAssetSelection }      from "@/hooks/admin/cloudinary/useAssetSelection";
import { useMoveAssets }          from "@/hooks/admin/cloudinary/useMoveAssets";
import { useImageSearch }         from "@/hooks/admin/cloudinary/useImageSearch";
import { useDashboardActions }    from "@/components/admin/layout/AdminShell";

/* ── SweetAlert2 lazy ─────────────────────────────────────────── */
async function getSwal() {
  return (await import("sweetalert2")).default;
}

const SWAL_THEME = {
  background:         "#111827",
  color:              "#e2e8f0",
  confirmButtonColor: "#4ec4c4",
} as const;

/* ── Tipo público del hook ────────────────────────────────────── */

export interface UseImagesPageReturn {
  /* Navegación */
  currentPath: string;
  folders:     ReturnType<typeof useCloudinaryBrowser>["folders"];
  assets:      ReturnType<typeof useCloudinaryBrowser>["assets"];
  loading:     boolean;
  error:       string | null;
  navigate:    (path: string) => void;
  refetch:     () => void;

  /* Búsqueda */
  query:            string;
  filteredAssets:   CloudinaryAsset[];
  isSearching:      boolean;
  searchInputProps: {
    value:    string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  clearQuery: () => void;

  /* Selección */
  selectedIds:    Set<string>;
  selectionMode:  boolean;
  isSelected:     (publicId: string) => boolean;
  toggleOne:      (publicId: string) => void;
  selectMany:     (publicIds: string[]) => void;
  clearSelection: () => void;
  count:          number;

  /* Movimiento */
  isMoving:   boolean;
  droppingTo: string | null;
  handleDrop: (publicIds: string[], targetPath: string) => Promise<void>;

  /* Detalle */
  selectedAsset:     CloudinaryAsset | null;
  handleOpenDetail:  (asset: CloudinaryAsset) => void;
  handleCloseDetail: () => void;
  handleRenamed:     () => void;
}

/* ── Hook ─────────────────────────────────────────────────────── */

export function useImagesPage(): UseImagesPageReturn {
  /* ── Navegación y datos ── */
  const {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,
  } = useCloudinaryBrowser();

  /* ── Selección múltiple ── */
  const {
    selectedIds,
    selectionMode,
    isSelected,
    toggleOne,
    selectMany,
    clearSelection,
    count,
  } = useAssetSelection();

  /* ── Movimiento de assets ── */
  const { move, isMoving, error: moveError, clearError: clearMoveError } = useMoveAssets();

  /* ── Búsqueda local ── */
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

  /* ── Registro del botón "+ Nuevo" en el topbar ── */
  const { registerNewProductAction } = useDashboardActions();

  useEffect(() => {
    registerNewProductAction(() => {});
  }, [registerNewProductAction]);

  /* ── Asset seleccionado para el modal de detalle ── */
  const [selectedAsset, setSelectedAsset] = useState<CloudinaryAsset | null>(null);

  /* ── Folder destino activo durante un drop ── */
  const [droppingTo, setDroppingTo] = useState<string | null>(null);

  /* ── Handlers de detalle ── */
  const handleOpenDetail  = useCallback((asset: CloudinaryAsset) => setSelectedAsset(asset), []);
  const handleCloseDetail = useCallback(() => setSelectedAsset(null), []);
  const handleRenamed     = useCallback(() => refetch(), [refetch]);

  /* ── Drop handler ── */
  const handleDrop = useCallback(async (publicIds: string[], targetPath: string) => {
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
      return;
    }

    if (moveError) {
      const Swal = await getSwal();
      await Swal.fire({
        title:             "Error al mover",
        text:              moveError,
        icon:              "error",
        confirmButtonText: "Aceptar",
        ...SWAL_THEME,
      });
      clearMoveError();
    }
  }, [currentPath, move, clearSelection, refetch, moveError, clearMoveError]);

  return {
    /* Navegación */
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,

    /* Búsqueda */
    query,
    filteredAssets,
    isSearching,
    searchInputProps,
    clearQuery,

    /* Selección */
    selectedIds,
    selectionMode,
    isSelected,
    toggleOne,
    selectMany,
    clearSelection,
    count,

    /* Movimiento */
    isMoving,
    droppingTo,
    handleDrop,

    /* Detalle */
    selectedAsset,
    handleOpenDetail,
    handleCloseDetail,
    handleRenamed,
  };
}