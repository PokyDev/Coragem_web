"use client";

/**
 * src/hooks/admin/useMoveAssets.ts
 *
 * Encapsula la llamada a PATCH /api/admin/cloudinary/assets/move.
 * Devuelve el número de assets movidos y el error si lo hubiera.
 */

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { CloudinaryAsset } from './useCloudinaryImages';

interface MoveAssetsResponse {
  moved:  number;
  assets: CloudinaryAsset[];
}

export interface UseMoveAssetsReturn {
  move:     (publicIds: string[], targetFolder: string) => Promise<boolean>;
  isMoving: boolean;
  error:    string | null;
  clearError: () => void;
}

export function useMoveAssets(): UseMoveAssetsReturn {
  const [isMoving, setIsMoving] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const move = useCallback(async (
    publicIds:    string[],
    targetFolder: string,
  ): Promise<boolean> => {
    if (publicIds.length === 0) return false;

    setIsMoving(true);
    setError(null);

    const res = await api.patch<MoveAssetsResponse>(
      '/api/admin/cloudinary/assets/move',
      { publicIds, targetFolder },
    );

    setIsMoving(false);

    if (res.error || !res.data) {
      setError(res.error ?? 'Error al mover los assets');
      return false;
    }

    return true;
  }, []);

  return { move, isMoving, error, clearError };
}