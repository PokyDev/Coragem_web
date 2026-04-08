"use client";

/**
 * src/hooks/admin/categories/useColorActions.ts
 *
 * Encapsula las operaciones CRUD de colores para el panel admin.
 * No tiene caché propio — la lista la gestiona la página que lo consume.
 *
 * Tras cada mutación exitosa invalida el caché de useCatalog exportado
 * para que ProductFormModal y otros consumidores lean datos frescos en
 * su próximo montaje.
 *
 * Endpoints:
 *   POST   /api/admin/colors       → crear
 *   PATCH  /api/admin/colors/:id   → renombrar / cambiar hex
 *   DELETE /api/admin/colors/:id   → eliminar
 */

import { useState, useCallback } from "react";
import { api }          from "@/lib/api";
import { catalogCache } from "@/hooks/shared/useCatalog";
import type { CatalogColor } from "@/types/catalog";

/* ── Tipos de respuesta ────────────────────────────────────────── */

interface ColorResponse { color: CatalogColor; }

/* ── Return type ───────────────────────────────────────────────── */

export interface UseColorActionsReturn {
  isLoading:  boolean;
  error:      string | null;
  clearError: () => void;
  create:     (name: string, hex: string) => Promise<CatalogColor | null>;
  update:     (id: string, name: string, hex: string) => Promise<CatalogColor | null>;
  remove:     (id: string) => Promise<boolean>;
}

/* ── Hook ──────────────────────────────────────────────────────── */

export function useColorActions(): UseColorActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const create = useCallback(async (name: string, hex: string): Promise<CatalogColor | null> => {
    setIsLoading(true);
    setError(null);

    const res = await api.post<ColorResponse>("/api/admin/colors", { name, hex });

    setIsLoading(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Error al crear el color");
      return null;
    }

    catalogCache.colors = null;
    return res.data.color;
  }, []);

  const update = useCallback(async (id: string, name: string, hex: string): Promise<CatalogColor | null> => {
    setIsLoading(true);
    setError(null);

    const res = await api.patch<ColorResponse>(`/api/admin/colors/${id}`, { name, hex });

    setIsLoading(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Error al actualizar el color");
      return null;
    }

    catalogCache.colors = null;
    return res.data.color;
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const res = await api.delete(`/api/admin/colors/${id}`);

    setIsLoading(false);

    if (res.error) {
      setError(res.error);
      return false;
    }

    catalogCache.colors = null;
    return true;
  }, []);

  return { isLoading, error, clearError, create, update, remove };
}