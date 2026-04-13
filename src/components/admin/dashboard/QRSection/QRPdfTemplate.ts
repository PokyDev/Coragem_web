/**
 * src/components/admin/dashboard/QRSection/QRPdfTemplate.ts
 *
 * PDF minimalista: fondo oscuro Slate Command + QR centrado
 * en card blanca con esquinas redondeadas.
 *
 * Técnica de border-radius: rectángulo blanco + 4 círculos del color
 * del fondo cubriendo las esquinas internas (pdf-lib no tiene drawRoundedRect).
 */

import { PDFDocument, rgb } from "pdf-lib";

/* ── Tokens de color ─────────────────────────────────────────────── */

const C_BG    = rgb(0.051, 0.082, 0.125); // #0d1520
const C_WHITE = rgb(1, 1, 1);

/* ── Dimensiones A4 ─────────────────────────────────────────────── */

const PAGE_W = 595;
const PAGE_H = 842;

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Simula border-radius en un rectángulo dibujando círculos del color
 * del fondo sobre las 4 esquinas internas del rect.
 *
 * @param page   - Página PDF
 * @param x      - X izquierdo del rect
 * @param y      - Y inferior del rect (origen pdf-lib = bottom-left)
 * @param w      - Ancho del rect
 * @param h      - Alto del rect
 * @param r      - Radio de la esquina
 * @param bgColor - Color del fondo exterior (para "recortar" la esquina)
 */
function maskCorners(
  page:    ReturnType<PDFDocument["addPage"]>,
  x:       number,
  y:       number,
  w:       number,
  h:       number,
  r:       number,
  bgColor: Parameters<typeof rgb>[0] extends number ? ReturnType<typeof rgb> : never,
) {
  // Esquina inferior-izquierda
  page.drawCircle({ x: x + r,     y: y + r,     size: r, color: bgColor });
  // Esquina inferior-derecha
  page.drawCircle({ x: x + w - r, y: y + r,     size: r, color: bgColor });
  // Esquina superior-izquierda
  page.drawCircle({ x: x + r,     y: y + h - r, size: r, color: bgColor });
  // Esquina superior-derecha
  page.drawCircle({ x: x + w - r, y: y + h - r, size: r, color: bgColor });
}

/* ── API pública ─────────────────────────────────────────────────── */

export interface BuildQRPdfOptions {
  /** ArrayBuffer de la imagen PNG del QR generada por qr-code-styling */
  qrPngBuffer: ArrayBuffer;
  /** URL codificada en el QR (no se usa visualmente, reservado para uso futuro) */
  qrUrl: string;
}

export async function buildQRPdf({ qrPngBuffer }: BuildQRPdfOptions): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);

  /* ── Fondo ── */
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C_BG });

  /* ── Dimensiones de la card ── */
  const QR_SIZE  = 220;  // tamaño de la imagen QR dentro de la card
  const CARD_PAD = 20;   // padding interior de la card
  const CARD_R   = 16;   // radio de las esquinas
  const CARD_W   = QR_SIZE + CARD_PAD * 2;
  const CARD_H   = QR_SIZE + CARD_PAD * 2;
  const CARD_X   = (PAGE_W - CARD_W) / 2;
  const CARD_Y   = (PAGE_H - CARD_H) / 2;  // centrado vertical

  /* ── Sombra sutil ── */
  page.drawRectangle({
    x:       CARD_X + 4,
    y:       CARD_Y - 4,
    width:   CARD_W,
    height:  CARD_H,
    color:   rgb(0, 0, 0),
    opacity: 0.30,
  });

  /* ── Card blanca ── */
  page.drawRectangle({
    x:      CARD_X,
    y:      CARD_Y,
    width:  CARD_W,
    height: CARD_H,
    color:  C_WHITE,
  });

  /* ── Esquinas redondeadas (mask con color del fondo) ── */
  maskCorners(page, CARD_X, CARD_Y, CARD_W, CARD_H, CARD_R, C_BG);

  /* ── Imagen QR ── */
  const qrImage = await doc.embedPng(qrPngBuffer);
  page.drawImage(qrImage, {
    x:      CARD_X + CARD_PAD,
    y:      CARD_Y + CARD_PAD,
    width:  QR_SIZE,
    height: QR_SIZE,
  });

  return doc.save();
}