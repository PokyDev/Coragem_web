"use client";

/**
 * src/hooks/admin/dashboard/useQR.ts
 *
 * Gestiona la URL del QR y la descarga como imagen PNG.
 *
 * Estado actual: URL fija (coragem.shop).
 * Integración futura: leer la URL desde AppConfig via
 *   GET /api/admin/config/qr-url
 * y permitir edición con PATCH /api/admin/config/qr-url.
 * El hook ya recibe `qrUrl` como parámetro para facilitar ese cambio.
 */

import { useCallback } from "react";

export interface UseQRReturn {
  /** URL codificada en el QR */
  qrUrl:    string;
  /** Descarga el canvas SVG/PNG renderizado por la librería QR */
  download: (canvasId: string) => void;
}

/*
 * TODO: cuando AppConfig exponga la URL del QR, recibir el valor
 * dinámico desde el componente padre (ya sea via prop o context)
 * y eliminar esta constante.
 */
const QR_URL = "https://coragem.shop";

export function useQR(): UseQRReturn {
  const download = useCallback((canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
    if (!canvas) return;

    const link      = document.createElement("a");
    link.download   = "coragem-qr.png";
    link.href       = canvas.toDataURL("image/png");
    link.click();
  }, []);

  return { qrUrl: QR_URL, download };
}