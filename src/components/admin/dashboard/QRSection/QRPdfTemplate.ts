/**
 * src/components/admin/dashboard/QRSection/QRPdfTemplate.ts
 *
 * PDF minimalista: fondo oscuro Slate Command + QR centrado
 * en card blanca con esquinas redondeadas reales (jspdf roundedRect).
 *
 * Dependencia: jspdf  →  npm install jspdf
 */

import { jsPDF } from "jspdf";

/* ── Tokens de color (RGB 0-255) ─────────────────────────────────── */

const C_BG    = [13,  21,  32 ] as const; // #0d1520
const C_BLACK = [0,   0,   0  ] as const; // sombra
const C_WHITE = [255, 255, 255] as const; // card

/* ── Dimensiones A4 en pt (jspdf default) ───────────────────────── */

const PAGE_W = 595.28;
const PAGE_H = 841.89;

/* ── API pública ─────────────────────────────────────────────────── */

export interface BuildQRPdfOptions {
  /** ArrayBuffer de la imagen PNG del QR generada por qr-code-styling */
  qrPngBuffer: ArrayBuffer;
  /** URL codificada en el QR (reservado para uso futuro) */
  qrUrl: string;
}

export async function buildQRPdf({ qrPngBuffer }: BuildQRPdfOptions): Promise<Uint8Array> {
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });

  /* ── Fondo ── */
  doc.setFillColor(...C_BG);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");

  /* ── Dimensiones de la card ── */
  const QR_SIZE  = 220; // tamaño de la imagen QR dentro de la card
  const CARD_PAD = 20;  // padding interior
  const CARD_R   = 14;  // radio de esquinas
  const CARD_W   = QR_SIZE + CARD_PAD * 2;
  const CARD_H   = QR_SIZE + CARD_PAD * 2;
  const CARD_X   = (PAGE_W - CARD_W) / 2;
  const CARD_Y   = (PAGE_H - CARD_H) / 2; // centrado vertical

  /* ── Sombra sutil ── */
  doc.setFillColor(...C_BLACK);
  doc.setGState(doc.GState({ opacity: 0.25 }));
  doc.roundedRect(CARD_X + 4, CARD_Y + 4, CARD_W, CARD_H, CARD_R, CARD_R, "F");

  /* ── Card blanca con esquinas redondeadas ── */
  doc.setGState(doc.GState({ opacity: 1 }));
  doc.setFillColor(...C_WHITE);
  doc.roundedRect(CARD_X, CARD_Y, CARD_W, CARD_H, CARD_R, CARD_R, "F");

  /* ── Imagen QR ── */
  // addImage acepta un data URL o un ArrayBuffer-backed blob.
  // Convertimos el ArrayBuffer a base64 para máxima compatibilidad.
  const bytes  = new Uint8Array(qrPngBuffer);
  const binary = bytes.reduce((acc, b) => acc + String.fromCharCode(b), "");
  const b64    = `data:image/png;base64,${btoa(binary)}`;

  doc.addImage(b64, "PNG", CARD_X + CARD_PAD, CARD_Y + CARD_PAD, QR_SIZE, QR_SIZE);

  /* ── Serializar ── */
  const arrayBuffer = doc.output("arraybuffer") as ArrayBuffer;
  return new Uint8Array(arrayBuffer);
}