// src/components/admin/dashboard/QRSection/QRSection.tsx
"use client";

/**
 * src/components/admin/dashboard/QRSection/QRSection.tsx
 *
 * Muestra el QR estilizado del sitio y permite descargarlo como PDF
 * de presentación con la paleta y marca de Coragem.
 *
 * Delega toda la lógica de generación y descarga a useQR.
 * El hook inyecta el SVG en el <div ref={containerRef}> via
 * qr-code-styling y construye el PDF via QRPdfTemplate + pdf-lib.
 */

import { useQR } from "@/hooks/admin/dashboard/useQR";
import styles from "./QRSection.module.css";

/* ── Ícono de descarga ──────────────────────────────────────────── */

function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ── Ícono de spinner ───────────────────────────────────────────── */

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className={styles.spinner}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────────── */

export function QRSection() {
  const { containerRef, qrUrl, downloadPdf, isGenerating } = useQR();

  return (
    <section className={styles.section} aria-label="Código QR del sitio">
      <h2 className={styles.sectionTitle}>Código QR</h2>

      <div className={styles.card}>
        {/* Marco blanco — la lib inyecta el SVG aquí */}
        <div className={styles.qrFrame}>
          <div ref={containerRef} />
        </div>

        {/* URL codificada */}
        <div style={{ textAlign: "center" }}>
          <p className={styles.urlLabel}>Apunta a</p>
          <p className={styles.urlValue}>{qrUrl}</p>
        </div>

        {/* Descarga PDF */}
        <button
          type="button"
          className={styles.downloadBtn}
          onClick={downloadPdf}
          disabled={isGenerating}
          aria-label="Descargar código QR como PDF"
          aria-busy={isGenerating}
        >
          {isGenerating ? <SpinnerIcon /> : <DownloadIcon />}
          {isGenerating ? "Generando PDF…" : "Descargar PDF"}
        </button>
      </div>
    </section>
  );
}