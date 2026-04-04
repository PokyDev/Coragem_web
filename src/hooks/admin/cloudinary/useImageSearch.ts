"use client";

/**
 * src/hooks/admin/useImageSearch.ts
 *
 * Encapsula la lógica de búsqueda de assets de Cloudinary.
 *
 * Hoy — búsqueda local:
 *   Filtra el array `assets` recibido por displayName en el folder actual.
 *   Sin llamadas de red adicionales.
 *
 * Futuro — búsqueda global:
 *   Cuando se implemente el endpoint (ej. GET /api/admin/cloudinary/search?q=…),
 *   pasar `mode="global"` activará el fetch en lugar del filtro local.
 *   La interfaz de retorno es idéntica en ambos modos, por lo que ImagesPage
 *   no necesitará cambios al hacer el switch.
 *
 * Uso actual:
 *   const { query, filteredAssets, inputProps, clearQuery } = useImageSearch({
 *     assets,
 *     mode: "local",
 *   });
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import type { CloudinaryAsset } from "./useCloudinaryImages";

/* ─── Tipos ─────────────────────────────────────────────────────── */

export type ImageSearchMode = "local" | "global";

interface UseImageSearchOptions {
  /** Assets del folder actual — fuente de datos para búsqueda local. */
  assets: CloudinaryAsset[];
  /**
   * Modo de búsqueda.
   * - "local"  → filtra `assets` en memoria (actual).
   * - "global" → reservado para búsqueda vía endpoint (futuro).
   */
  mode?: ImageSearchMode;
  /**
   * Se llama cuando la query cambia.
   * Útil para que el padre limpie selecciones al escribir.
   */
  onQueryChange?: () => void;
}

export interface UseImageSearchReturn {
  query:          string;
  filteredAssets: CloudinaryAsset[];
  /** true solo en modo "global" mientras espera respuesta del backend. */
  isSearching:    boolean;
  inputProps: {
    value:    string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  clearQuery: () => void;
}

/* ─── Hook ──────────────────────────────────────────────────────── */

export function useImageSearch({
  assets,
  mode = "local",
  onQueryChange,
}: UseImageSearchOptions): UseImageSearchReturn {
  const [query, setQuery] = useState("");

  /* Limpiar query cuando cambia el array de assets (navegación de carpeta).
   * Se compara la referencia — useCloudinaryBrowser devuelve un array nuevo
   * en cada navigate/refetch, por lo que esto es suficiente. */
  useEffect(() => {
    setQuery("");
  }, [assets]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      onQueryChange?.();
    },
    [onQueryChange],
  );

  const clearQuery = useCallback(() => {
    setQuery("");
    onQueryChange?.();
  }, [onQueryChange]);

  /* ── Búsqueda local ── */
  const localFiltered = useMemo(() => {
    if (mode !== "local") return assets;
    const q = query.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) =>
      a.displayName.toLowerCase().includes(q),
    );
  }, [assets, query, mode]);

  /*
   * ── Búsqueda global (placeholder) ──
   *
   * Cuando mode === "global", aquí irá:
   *   const [globalResults, setGlobalResults] = useState<CloudinaryAsset[]>([]);
   *   useEffect(() => {
   *     if (!query.trim()) { setGlobalResults([]); return; }
   *     setIsSearching(true);
   *     api.get(`/api/admin/cloudinary/search?q=${encodeURIComponent(query)}`)
   *       .then((res) => { setGlobalResults(res.data?.assets ?? []); setIsSearching(false); });
   *   }, [query]);
   *
   * Por ahora cae al mismo array local para no romper nada.
   */

  return {
    query,
    filteredAssets: localFiltered,
    isSearching:    false, // será true durante fetch global
    inputProps: {
      value:    query,
      onChange: handleChange,
    },
    clearQuery,
  };
}