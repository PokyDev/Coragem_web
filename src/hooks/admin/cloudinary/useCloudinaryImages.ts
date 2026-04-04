"use client";

/**
 * src/hooks/admin/useCloudinaryImages.ts
 *
 * Carga la lista de assets de una carpeta específica de Cloudinary.
 * Expone refetch para forzar recarga tras un rename.
 */

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

export interface CloudinaryAsset {
  publicId:    string;
  url:         string;
  secureUrl:   string;
  format:      string;
  width:       number;
  height:      number;
  bytes:       number;
  createdAt:   string;
  folder:      string;
  displayName: string;
}

interface AssetsResponse {
  assets: CloudinaryAsset[];
}

interface UseCloudinaryImagesReturn {
  assets:  CloudinaryAsset[];
  loading: boolean;
  error:   string | null;
  refetch: () => void;
}

/**
 * @param folder - Path completo de la carpeta en Cloudinary (ej. "coragem/products").
 *                 Si está vacío, no realiza ninguna petición.
 */
export function useCloudinaryImages(folder: string): UseCloudinaryImagesReturn {
  const [assets,  setAssets]  = useState<CloudinaryAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tick,    setTick]    = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!folder) {
      setAssets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const encodedFolder = encodeURIComponent(folder);
    api.get<AssetsResponse>(`/api/admin/cloudinary/images?folder=${encodedFolder}`).then((res) => {
      if (cancelled) return;
      if (res.error || !res.data) {
        setError(res.error ?? 'Error al cargar imágenes');
        setAssets([]);
      } else {
        setAssets(res.data.assets);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [folder, tick]);

  return { assets, loading, error, refetch };
}