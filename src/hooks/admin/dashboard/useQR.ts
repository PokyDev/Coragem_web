// src/hooks/admin/dashboard/useQR.ts
"use client";

/**
 * src/hooks/admin/dashboard/useQR.ts
 *
 * Gestiona el QR estilizado del sitio y su descarga como PNG.
 *
 * Usa qr-code-styling (en vez de qrcode.react) para permitir
 * dots redondeados, esquinas suavizadas y logo central.
 *
 * La instancia de QRCodeStyling se crea una sola vez via useRef
 * y se inyecta en el DOM via qrInstance.append(containerRef.current).
 *
 * API pública:
 *   - containerRef  → ref del <div> donde se monta el SVG
 *   - qrUrl         → URL codificada (para mostrar en el label)
 *   - download      → descarga el QR como PNG
 *
 * Integración futura: leer qrUrl desde AppConfig via
 *   GET /api/admin/config/qr-url
 */

import { useEffect, useRef, useCallback } from "react";
import type { RefObject } from "react";
import type QRCodeStylingType from "qr-code-styling";

export interface UseQRReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  qrUrl:        string;
  download:     () => void;
}

const QR_URL = "https://coragem.shop";

const QR_OPTIONS = {
  width:  180,
  height: 180,
  type:   "svg" as const,       // Evitar pixelación en pantallas HiDPI
  data:   QR_URL,
  image:  "/favicon.ico",
  qrOptions: {
    errorCorrectionLevel: "H" as const,
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize:          0.32,
    margin:             6,
    crossOrigin:        "anonymous",
  },
  dotsOptions: {
    type:  "dots" as const,          // círculos puros — diferencia muy visible
    color: "#000000",
  },
  cornersSquareOptions: {
    type:  "extra-rounded" as const, // esquinas de posicionamiento redondeadas
    color: "#000000",
  },
  cornersDotOptions: {
    type:  "dot" as const,           // punto interior circular
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
} as const;

export function useQR(): UseQRReturn {
  const containerRef  = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStylingType | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("qr-code-styling").then((mod) => {
      if (cancelled || !containerRef.current) return;

      const QRCodeStyling = mod.default;
      const instance = new QRCodeStyling(QR_OPTIONS);

      // Limpiar el contenedor antes de inyectar (strict mode / HMR)
      containerRef.current.innerHTML = "";
      instance.append(containerRef.current);
      qrInstanceRef.current = instance;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const download = useCallback(() => {
    qrInstanceRef.current?.download({ name: "coragem-qr", extension: "png" });
  }, []);

  return { containerRef, qrUrl: QR_URL, download };
}