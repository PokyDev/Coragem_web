"use client";

/**
 * src/hooks/admin/categories/useCategoryActions.ts
 *
 * Encapsula las operaciones CRUD de categorías para el panel admin.
 * No tiene caché propio — la lista la gestiona la página que lo consume.
 *
 * Tras cada mutación exitosa invalida el caché de useCatalog exportado
 * para que ProductFormModal y otros consumidores lean datos frescos en
 * su próximo montaje.
 *
 * Endpoints:
 *   POST   /api/admin/categories       → crear
 *   PATCH  /api/admin/categories/:id   → renombrar
 *   DELETE /api/admin/categories/:id   → eliminar
 */

import { useState, useCallback } from "react";
import { api }          from "@/lib/api";
import { catalogCache } from "@/hooks/shared/useCatalog";
import type { CatalogCategory } from "@/types/catalog";

/* ── Tipos de respuesta ────────────────────────────────────────── */

interface CategoryResponse { category: CatalogCategory; }

/* ── Return type ───────────────────────────────────────────────── */

export interface UseCategoryActionsReturn {
  isLoading:  boolean;
  error:      string | null;
  clearError: () => void;
  create:     (name: string) => Promise<CatalogCategory | null>;
  update:     (id: string, name: string) => Promise<CatalogCategory | null>;
  remove:     (id: string) => Promise<boolean>;
}

/* ── Hook ──────────────────────────────────────────────────────── */

export function useCategoryActions(): UseCategoryActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const create = useCallback(async (name: string): Promise<CatalogCategory | null> => {
    setIsLoading(true);
    setError(null);

    const res = await api.post<CategoryResponse>("/api/admin/categories", { name });

    setIsLoading(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Error al crear la categoría");
      return null;
    }

    catalogCache.categories = null;
    return res.data.category;
  }, []);

  const update = useCallback(async (id: string, name: string): Promise<CatalogCategory | null> => {
    setIsLoading(true);
    setError(null);

    const res = await api.patch<CategoryResponse>(`/api/admin/categories/${id}`, { name });

    setIsLoading(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Error al actualizar la categoría");
      return null;
    }

    catalogCache.categories = null;
    return res.data.category;
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const res = await api.delete(`/api/admin/categories/${id}`);

    setIsLoading(false);

    if (res.error) {
      setError(res.error);
      return false;
    }

    catalogCache.categories = null;
    return true;
  }, []);

  return { isLoading, error, clearError, create, update, remove };
}