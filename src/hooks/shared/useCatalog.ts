"use client";

/**
 * src/hooks/shared/useCatalog.ts
 *
 * Fetcha categorías y colores desde la API una sola vez por sesión.
 * Usa un caché en módulo (singleton) para que múltiples componentes
 * que monten este hook no disparen requests duplicados.
 *
 * Endpoints:
 *   GET /api/categories  → { categories: Category[] }
 *   GET /api/colors      → { colors: Color[] }
 */

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { CatalogCategory, CatalogColor } from "@/types/catalog";

/* ── Caché en módulo — persiste entre montajes ─────────────────── */

interface CatalogCache {
  categories: CatalogCategory[] | null;
  colors:     CatalogColor[]    | null;
}

const cache: CatalogCache = { categories: null, colors: null };

/* ── Tipos de respuesta ────────────────────────────────────────── */

interface CategoriesResponse { categories: CatalogCategory[]; }
interface ColorsResponse     { colors:     CatalogColor[];    }

/* ── Return type ───────────────────────────────────────────────── */

export interface UseCatalogReturn {
  categories: CatalogCategory[];
  colors:     CatalogColor[];
  loading:    boolean;
  error:      string | null;
}

/* ── Hook ──────────────────────────────────────────────────────── */

export function useCatalog(): UseCatalogReturn {
  const [categories, setCategories] = useState<CatalogCategory[]>(cache.categories ?? []);
  const [colors,     setColors]     = useState<CatalogColor[]>(cache.colors ?? []);
  const [loading,    setLoading]    = useState(!cache.categories || !cache.colors);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    // Ambos ya están en caché — nada que hacer
    if (cache.categories && cache.colors) return;

    let cancelled = false;

    async function fetchCatalog() {
      setLoading(true);
      setError(null);

      const [catsRes, colsRes] = await Promise.all([
        cache.categories ? null : api.get<CategoriesResponse>("/api/categories"),
        cache.colors     ? null : api.get<ColorsResponse>("/api/colors"),
      ]);

      if (cancelled) return;

      if (catsRes && (catsRes.error || !catsRes.data)) {
        setError(catsRes.error ?? "Error al cargar categorías");
        setLoading(false);
        return;
      }

      if (colsRes && (colsRes.error || !colsRes.data)) {
        setError(colsRes.error ?? "Error al cargar colores");
        setLoading(false);
        return;
      }

      if (catsRes?.data) {
        cache.categories = catsRes.data.categories;
        setCategories(catsRes.data.categories);
      }

      if (colsRes?.data) {
        cache.colors = colsRes.data.colors;
        setColors(colsRes.data.colors);
      }

      setLoading(false);
    }

    fetchCatalog();
    return () => { cancelled = true; };
  }, []);

  return { categories, colors, loading, error };
}