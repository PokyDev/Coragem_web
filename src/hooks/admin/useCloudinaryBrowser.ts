"use client";

/**
 * src/hooks/admin/useCloudinaryBrowser.ts
 *
 * Orquesta la navegación por la jerarquía de carpetas de Cloudinary.
 *
 * - Persiste la última carpeta visitada en localStorage.
 * - Al montar, restaura esa carpeta; si no existe, arranca desde la raíz.
 * - Expone carpetas, assets, estado de carga y helpers de navegación.
 *
 * Lógica de carga:
 *   - Siempre carga las sub-carpetas del path actual.
 *   - Solo carga assets si currentPath no está vacío (en la raíz no hay assets).
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { CloudinaryAsset } from './useCloudinaryImages';

export interface CloudinaryFolder {
  name: string;
  path: string;
}

interface FoldersResponse {
  folders: CloudinaryFolder[];
}

interface AssetsResponse {
  assets: CloudinaryAsset[];
}

export interface UseCloudinaryBrowserReturn {
  /** Path de la carpeta actualmente visible. Vacío = raíz. */
  currentPath: string;
  folders:     CloudinaryFolder[];
  assets:      CloudinaryAsset[];
  loading:     boolean;
  error:       string | null;
  /** Navega a una carpeta hija */
  navigate:    (path: string) => void;
  /** Sube un nivel en la jerarquía */
  goUp:        () => void;
  /** Vuelve a la raíz */
  goRoot:      () => void;
  /** Fuerza recarga del contenido actual (útil tras rename) */
  refetch:     () => void;
}

const STORAGE_KEY = 'coragem:cloudinary:lastPath';

function readStoredPath(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function storePath(path: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, path);
  } catch {
    // localStorage no disponible (SSR, modo privado estricto) — se ignora
  }
}

export function useCloudinaryBrowser(): UseCloudinaryBrowserReturn {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [folders,     setFolders]     = useState<CloudinaryFolder[]>([]);
  const [assets,      setAssets]      = useState<CloudinaryAsset[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [tick,        setTick]        = useState(0);

  /* Restaurar último path al montar (solo en cliente) */
  useEffect(() => {
    const stored = readStoredPath();
    setCurrentPath(stored);
  }, []);

  /* Cargar carpetas y assets cada vez que cambia currentPath o tick */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFolders([]);
    setAssets([]);

    const pathParam = currentPath
      ? `?path=${encodeURIComponent(currentPath)}`
      : '';

    const fetchFolders = api.get<FoldersResponse>(
      `/api/admin/cloudinary/folders${pathParam}`,
    );

    const fetchAssets = currentPath
      ? api.get<AssetsResponse>(
          `/api/admin/cloudinary/images?folder=${encodeURIComponent(currentPath)}`,
        )
      : Promise.resolve({ data: { assets: [] }, error: null });

    Promise.all([fetchFolders, fetchAssets]).then(([foldersRes, assetsRes]) => {
      if (cancelled) return;

      if (foldersRes.error) {
        setError(foldersRes.error);
        setLoading(false);
        return;
      }

      if (assetsRes.error) {
        setError(assetsRes.error);
        setLoading(false);
        return;
      }

      setFolders(foldersRes.data?.folders ?? []);
      setAssets(assetsRes.data?.assets   ?? []);
      setLoading(false);
    });

    return () => { cancelled = true; };
  // tick fuerza recarga sin cambiar currentPath
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath, tick]);

  /* Navegar a una carpeta hija */
  const navigate = useCallback((path: string) => {
    storePath(path);
    setCurrentPath(path);
  }, []);

  /* Subir un nivel */
  const goUp = useCallback(() => {
    const parent = currentPath.includes('/')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : '';
    storePath(parent);
    setCurrentPath(parent);
  }, [currentPath]);

  /* Volver a la raíz */
  const goRoot = useCallback(() => {
    storePath('');
    setCurrentPath('');
  }, []);

  /* Forzar recarga */
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    goUp,
    goRoot,
    refetch,
  };
}