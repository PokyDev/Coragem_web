"use client";

/**
 * src/components/admin/dashboard/QRSection/QRSection.tsx
 *
 * Muestra el QR del sitio y permite descargarlo como PNG.
 * Usa qrcode.react (QRCodeCanvas) para renderizar en un <canvas>,
 * lo que permite la descarga directa via toDataURL().
 *
 * Instalación requerida:
 *   npm install qrcode.react
 *
 * Integración futura: la qrUrl la proveerá AppConfig del backend.
 * El componente ya la recibe como prop — no hay nada más que cambiar aquí.
 */

import dynamic from "next/dynamic";
import { useQR } from "@/hooks/admin/dashboard/useQR";
import styles from "./QRSection.module.css";

/*
 * QRCodeCanvas accede a document (canvas API).
 * Con ssr: false se evita el error de hidratación.
 */
const QRCodeCanvas = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeCanvas),
  { ssr: false, loading: () => <div style={{ width: 160, height: 160 }} /> }
);

/* ── ID del canvas — usado por useQR para la descarga ── */
const QR_CANVAS_ID = "coragem-qr-canvas";

/* ── Ícono de descarga ──────────────────────────────────────────── */

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────────── */

export function QRSection() {
  const { qrUrl, download } = useQR();

  return (
    <section className={styles.section} aria-label="Código QR del sitio">
      <h2 className={styles.sectionTitle}>Código QR</h2>

      <div className={styles.card}>
        {/* Marco blanco alrededor del QR */}
        <div className={styles.qrFrame}>
          <QRCodeCanvas
            id={QR_CANVAS_ID}
            value={qrUrl}
            size={160}
            level="H"
            marginSize={0}
            fgColor="#000000"
            bgColor="#ffffff"
            imageSettings={{
              src:      "/favicon.ico",
              width:    40,
              height:   40,
              excavate: true,
            }}
          />
        </div>

        {/* URL codificada */}
        <div style={{ textAlign: "center" }}>
          <p className={styles.urlLabel}>Apunta a</p>
          <p className={styles.urlValue}>{qrUrl}</p>
        </div>

        {/* Descarga */}
        <button
          type="button"
          className={styles.downloadBtn}
          onClick={() => download(QR_CANVAS_ID)}
          aria-label="Descargar código QR como imagen PNG"
        >
          <DownloadIcon />
          Descargar QR
        </button>
      </div>
    </section>
  );
}