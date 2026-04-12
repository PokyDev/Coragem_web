// src/hooks/admin/dashboard/useQR.ts
"use client";

/**
 * src/hooks/admin/dashboard/useQR.ts
 *
 * Gestiona el QR estilizado del sitio y su descarga como PDF de marca.
 *
 * Usa qr-code-styling para renderizar el QR como SVG en el DOM y para
 * exportar el QR como PNG (via getRawData). El PNG se pasa a
 * QRPdfTemplate.buildQRPdf() que construye el PDF con pdf-lib.
 *
 * API pública:
 *   - containerRef   → ref del <div> donde se monta el SVG
 *   - qrUrl          → URL codificada (para mostrar en el label)
 *   - downloadPdf    → genera y descarga el PDF de presentación
 *   - isGenerating   → true mientras se construye el PDF
 *
 * Integración futura: leer qrUrl desde AppConfig via
 *   GET /api/admin/config/qr-url
 */

import { useEffect, useRef, useCallback, useState } from "react";
import type { RefObject } from "react";
import type QRCodeStylingType from "qr-code-styling";

export interface UseQRReturn {
  containerRef:  RefObject<HTMLDivElement | null>;
  qrUrl:         string;
  downloadPdf:   () => Promise<void>;
  isGenerating:  boolean;
}

const QR_URL = "https://coragem.shop";

/** Tamaño del QR exportado como PNG — más alto = mejor calidad en el PDF */
const QR_EXPORT_SIZE = 600;

const QR_OPTIONS = {
  width:  180,
  height: 180,
  type:   "svg" as const,
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
    type:  "dots" as const,
    color: "#000000",
  },
  cornersSquareOptions: {
    type:  "extra-rounded" as const,
    color: "#000000",
  },
  cornersDotOptions: {
    type:  "dot" as const,
    color: "#000000",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
} as const;

export function useQR(): UseQRReturn {
  const containerRef  = useRef<HTMLDivElement | null>(null);
  const qrInstanceRef = useRef<QRCodeStylingType | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ── Montar el QR en el DOM ── */
  useEffect(() => {
    let cancelled = false;

    import("qr-code-styling").then((mod) => {
      if (cancelled || !containerRef.current) return;

      const QRCodeStyling = mod.default;
      const instance = new QRCodeStyling(QR_OPTIONS);

      containerRef.current.innerHTML = "";
      instance.append(containerRef.current);
      qrInstanceRef.current = instance;
    });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Generar y descargar el PDF ── */
  const downloadPdf = useCallback(async () => {
    if (!qrInstanceRef.current || isGenerating) return;

    setIsGenerating(true);

    try {
      // 1. Exportar el QR como PNG de alta resolución
      //    getRawData devuelve un Blob con la imagen del QR en el tamaño indicado.
      const exportInstance = await import("qr-code-styling").then((mod) => {
        const QRCodeStyling = mod.default;
        return new QRCodeStyling({
          ...QR_OPTIONS,
          type:   "canvas" as const, // canvas permite exportar PNG
          width:  QR_EXPORT_SIZE,
          height: QR_EXPORT_SIZE,
        });
      });

      const qrBlob = await exportInstance.getRawData("png");

      if (!qrBlob) {
        throw new Error("No se pudo generar la imagen del QR");
      }

      const qrBuffer = await (qrBlob as Blob).arrayBuffer();

      // 2. Construir el PDF con la plantilla de marca
      const { buildQRPdf } = await import(
        "@/components/admin/dashboard/QRSection/QRPdfTemplate"
      );

      const pdfBytes = await buildQRPdf({ qrPngBuffer: qrBuffer, qrUrl: QR_URL });

      // 3. Descargar el PDF
      //    doc.save() devuelve Uint8Array<ArrayBufferLike>; Blob requiere ArrayBuffer estricto.
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");

      a.href     = url;
      a.download = "coragem-qr.pdf";
      a.click();

      // Liberar la URL temporal tras un tick
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("[useQR] Error al generar el PDF:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return { containerRef, qrUrl: QR_URL, downloadPdf, isGenerating };
}