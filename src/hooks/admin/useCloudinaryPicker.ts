"use client";

/**
 * src/hooks/admin/useCloudinaryPicker.ts
 *
 * Variante de navegación de Cloudinary pensada para el ImagePickerModal.
 *
 * Diferencias respecto a useCloudinaryBrowser:
 *   - Arranca siempre en `initialPath` (por defecto "coragem/products").
 *   - Sin persistencia en localStorage — cada apertura del modal es fresca.
 *   - Se resetea al initialPath cuando `resetOnOpen` cambia a true
 *     (útil para volver al inicio cada vez que el modal se abre).
 *
 * Comparte la lógica de fetch con useCloudinaryBrowser a través de
 * useCloudinaryData, sin duplicar ningún código de red.
 */

import { useState, useCallback, useEffect } from 'react';
import { useCloudinaryData } from './useCloudinaryBrowser';
import type { CloudinaryFolder, UseCloudinaryDataReturn } from './useCloudinaryBrowser';

export interface UseCloudinaryPickerReturn extends UseCloudinaryDataReturn {
  currentPath: string;
  navigate:    (path: string) => void;
  refetch:     () => void;
}

interface UseCloudinaryPickerOptions {
  /** Path de arranque. Por defecto "coragem/products". */
  initialPath?: string;
  /**
   * Cuando cambia a `true`, el hook vuelve a `initialPath` y hace refetch.
   * Pasar `isOpen` del modal aquí garantiza que cada apertura empiece limpia.
   */
  resetOnOpen?: boolean;
}

export function useCloudinaryPicker({
  initialPath = 'coragem/products',
  resetOnOpen = false,
}: UseCloudinaryPickerOptions = {}): UseCloudinaryPickerReturn {
  const [currentPath, setCurrentPath] = useState<string>(initialPath);
  const [tick,        setTick]        = useState(0);

  /* Resetear al initialPath cada vez que el modal se abre */
  useEffect(() => {
    if (resetOnOpen) {
      setCurrentPath(initialPath);
      setTick((t) => t + 1);
    }
  // Solo reaccionar cuando resetOnOpen cambia a true
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetOnOpen]);

  const { folders, assets, loading, error } = useCloudinaryData(currentPath, tick);

  const navigate = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  return {
    currentPath,
    folders,
    assets,
    loading,
    error,
    navigate,
    refetch,
  };
}