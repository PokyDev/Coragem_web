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
 * La lógica de fetch está extraída en useCloudinaryData (mismo archivo)
 * para poder reutilizarse en useCloudinaryPicker sin duplicar código.
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

/* ─── Hook primitivo de fetch ────────────────────────────────────────
 * Carga carpetas y assets para un path dado.
 * No tiene opinión sobre navegación ni persistencia — solo fetching.
 * Consumido por useCloudinaryBrowser y useCloudinaryPicker.
 * ─────────────────────────────────────────────────────────────────── */
export interface UseCloudinaryDataReturn {
  folders:  CloudinaryFolder[];
  assets:   CloudinaryAsset[];
  loading:  boolean;
  error:    string | null;
}

export function useCloudinaryData(
  currentPath: string,
  tick: number,
): UseCloudinaryDataReturn {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [assets,  setAssets]  = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

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
  }, [currentPath, tick]);

  return { folders, assets, loading, error };
}

/* ─── Browser público ────────────────────────────────────────────────
 * Navegación completa con persistencia en localStorage.
 * Usado por ImagesPage — sin cambios en su interfaz pública.
 * ─────────────────────────────────────────────────────────────────── */
export interface UseCloudinaryBrowserReturn {
  currentPath: string;
  folders:     CloudinaryFolder[];
  assets:      CloudinaryAsset[];
  loading:     boolean;
  error:       string | null;
  navigate:    (path: string) => void;
  goUp:        () => void;
  goRoot:      () => void;
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
  const [tick,        setTick]        = useState(0);

  /* Restaurar último path al montar (solo en cliente) */
  useEffect(() => {
    const stored = readStoredPath();
    setCurrentPath(stored);
  }, []);

  const { folders, assets, loading, error } = useCloudinaryData(currentPath, tick);

  const navigate = useCallback((path: string) => {
    storePath(path);
    setCurrentPath(path);
  }, []);

  const goUp = useCallback(() => {
    const parent = currentPath.includes('/')
      ? currentPath.substring(0, currentPath.lastIndexOf('/'))
      : '';
    storePath(parent);
    setCurrentPath(parent);
  }, [currentPath]);

  const goRoot = useCallback(() => {
    storePath('');
    setCurrentPath('');
  }, []);

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