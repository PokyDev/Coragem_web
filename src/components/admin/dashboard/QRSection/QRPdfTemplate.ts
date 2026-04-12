/**
 * src/components/admin/dashboard/QRSection/QRPdfTemplate.ts
 *
 * Construye el PDF de presentación del QR de Coragem con pdf-lib.
 * Retorna un Uint8Array listo para descargar — sin side effects.
 *
 * Paleta: Slate Command (--admin-* tokens) + colores de marca Coragem.
 * Tamaño: A4 vertical (595 × 842 pt).
 *
 * Layout (de arriba a abajo):
 *   ├─ Fondo oscuro full-page  (#0d1520)
 *   ├─ Banda decorativa superior con degradado teal → transparente
 *   ├─ Logotipo "CORAGEM" (Helvetica-Bold, teal)
 *   ├─ Subtítulo de marca
 *   ├─ Separador
 *   ├─ QR centrado sobre fondo blanco con márgen
 *   ├─ URL del sitio
 *   ├─ Frase motivacional (portugués / español)
 *   └─ Banda decorativa inferior (pink)
 */

import { PDFDocument, rgb, StandardFonts, type RGB, type PDFFont } from "pdf-lib";

/* ── Tokens de color (hex → rgb fraccionado) ─────────────────────── */

// Fondos
const C_BG    = rgb(0.051, 0.082, 0.125);   // #0d1520
const C_WHITE = rgb(1,     1,     1    );

// Marca
const C_TEAL      = rgb(0.306, 0.769, 0.769);   // #4ec4c4
const C_PINK      = rgb(0.769, 0.478, 0.620);   // #c47a9e
const C_SAND      = rgb(0.769, 0.604, 0.424);   // #c49a6c

// Texto
const C_TEXT      = rgb(0.886, 0.910, 0.941);   // #e2e8f0
const C_MUTED     = rgb(0.580, 0.639, 0.722);   // #94a3b8
const C_DIM       = rgb(0.290, 0.333, 0.408);   // #4a5568

/* ── Dimensiones A4 ─────────────────────────────────────────────── */

const PAGE_W = 595;
const PAGE_H = 842;

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Simula un degradado vertical dibujando N rectángulos con opacidad
 * decreciente (pdf-lib no soporta gradientes nativos).
 */
function drawFadeRect(
  page: ReturnType<PDFDocument["addPage"]>,
  x: number,
  y: number,
  w: number,
  h: number,
  color: RGB,
  fromOpacity: number,
  toOpacity: number,
  steps = 24,
) {
  const stepH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t       = i / (steps - 1);
    const opacity = fromOpacity + (toOpacity - fromOpacity) * t;
    page.drawRectangle({
      x,
      y: y + h - (i + 1) * stepH,
      width:   w,
      height:  stepH + 0.5, // ligero overlap para evitar gaps
      color,
      opacity,
    });
  }
}

/**
 * Simula character-spacing dibujando cada glifo individualmente.
 * pdf-lib no expone `characterSpacing` en su API de alto nivel.
 *
 * @param extraSpacing - Puntos extra entre cada carácter (equivalente a CSS letter-spacing)
 */
function drawSpacedText(
  page:         ReturnType<PDFDocument["addPage"]>,
  text:         string,
  options: {
    x:          number;
    y:          number;
    size:       number;
    font:       PDFFont;
    color:      RGB;
    opacity?:   number;
    extraSpacing: number;
  },
) {
  const { x, y, size, font, color, opacity, extraSpacing } = options;
  let cursorX = x;

  for (const char of text) {
    page.drawText(char, { x: cursorX, y, size, font, color, opacity });
    cursorX += font.widthOfTextAtSize(char, size) + extraSpacing;
  }
}

/**
 * Calcula el ancho total de un texto con spacing extra entre caracteres.
 * Necesario para centrarlo correctamente cuando se usa drawSpacedText.
 */
function spacedTextWidth(text: string, fontSize: number, font: PDFFont, extraSpacing: number): number {
  let width = 0;
  for (const char of text) {
    width += font.widthOfTextAtSize(char, fontSize) + extraSpacing;
  }
  // El último carácter no lleva trailing spacing
  return width - extraSpacing;
}

function centeredX(
  text: string,
  fontSize: number,
  font: PDFFont,
): number {
  const textW = font.widthOfTextAtSize(text, fontSize);
  return (PAGE_W - textW) / 2;
}

/* ── API pública ─────────────────────────────────────────────────── */

export interface BuildQRPdfOptions {
  /** ArrayBuffer de la imagen PNG del QR generada por qr-code-styling */
  qrPngBuffer: ArrayBuffer;
  /** URL codificada en el QR (para mostrarla en el PDF) */
  qrUrl:       string;
}

/**
 * Genera el PDF de presentación del QR de Coragem.
 * @returns Uint8Array con los bytes del PDF listo para descargar.
 */
export async function buildQRPdf({ qrPngBuffer, qrUrl }: BuildQRPdfOptions): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);

  /* ── Fonts ── */
  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  /* ── Fondo full-page ── */
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C_BG });

  /* ── Banda superior: degradado teal ── */
  drawFadeRect(page, 0, PAGE_H - 120, PAGE_W, 120, C_TEAL, 0.18, 0);

  /* ── Línea de acento superior (teal) ── */
  page.drawRectangle({ x: 0, y: PAGE_H - 4, width: PAGE_W, height: 4, color: C_TEAL });

  /* ── Logotipo CORAGEM ── */
  const logoSize    = 42;
  const logoText    = "CORAGEM";
  const logoSpacing = 6;
  const logoW       = spacedTextWidth(logoText, logoSize, fontBold, logoSpacing);
  const logoX       = (PAGE_W - logoW) / 2;

  drawSpacedText(page, logoText, {
    x:            logoX,
    y:            PAGE_H - 90,
    size:         logoSize,
    font:         fontBold,
    color:        C_TEAL,
    extraSpacing: logoSpacing,
  });

  /* ── Tagline de marca ── */
  const tagline     = "accesorios con caracter";
  const taglineSize = 11;
  const tagSpacing  = 1.5;
  const taglineW    = spacedTextWidth(tagline, taglineSize, fontOblique, tagSpacing);

  drawSpacedText(page, tagline, {
    x:            (PAGE_W - taglineW) / 2,
    y:            PAGE_H - 112,
    size:         taglineSize,
    font:         fontOblique,
    color:        C_SAND,
    extraSpacing: tagSpacing,
  });

  /* ── Separador decorativo ── */
  const sepY   = PAGE_H - 134;
  const sepW   = 60;
  const sepX   = (PAGE_W - sepW) / 2;

  // Línea izquierda (pink)
  page.drawLine({
    start: { x: sepX - 40, y: sepY },
    end:   { x: sepX,      y: sepY },
    thickness: 1,
    color: C_PINK,
    opacity: 0.5,
  });

  // Rombo central — dibujado como figura geométrica (sin texto, evita límites WinAnsi)
  const diamondCx = PAGE_W / 2;
  const diamondCy = sepY;
  const diamondR  = 4; // radio del rombo en puntos

  page.drawLine({ start: { x: diamondCx,            y: diamondCy + diamondR }, end: { x: diamondCx + diamondR, y: diamondCy            }, thickness: 1, color: C_SAND });
  page.drawLine({ start: { x: diamondCx + diamondR, y: diamondCy            }, end: { x: diamondCx,            y: diamondCy - diamondR }, thickness: 1, color: C_SAND });
  page.drawLine({ start: { x: diamondCx,            y: diamondCy - diamondR }, end: { x: diamondCx - diamondR, y: diamondCy            }, thickness: 1, color: C_SAND });
  page.drawLine({ start: { x: diamondCx - diamondR, y: diamondCy            }, end: { x: diamondCx,            y: diamondCy + diamondR }, thickness: 1, color: C_SAND });

  // Línea derecha (teal)
  page.drawLine({
    start: { x: sepX + sepW,      y: sepY },
    end:   { x: sepX + sepW + 40, y: sepY },
    thickness: 1,
    color: C_TEAL,
    opacity: 0.5,
  });

  /* ── Card del QR ── */
  const QR_SIZE     = 220;
  const CARD_PAD    = 20;
  const cardW       = QR_SIZE + CARD_PAD * 2;
  const cardH       = QR_SIZE + CARD_PAD * 2;
  const cardX       = (PAGE_W - cardW) / 2;
  const cardY       = PAGE_H - 390;

  // Sombra de la card (capa oscura desplazada)
  page.drawRectangle({
    x:       cardX + 4,
    y:       cardY - 4,
    width:   cardW,
    height:  cardH,
    color:   rgb(0, 0, 0),
    opacity: 0.35,
  });

  // Fondo blanco de la card
  page.drawRectangle({
    x:      cardX,
    y:      cardY,
    width:  cardW,
    height: cardH,
    color:  C_WHITE,
  });

  /* ── Imagen del QR ── */
  const qrImage = await doc.embedPng(qrPngBuffer);
  page.drawImage(qrImage, {
    x:      cardX + CARD_PAD,
    y:      cardY + CARD_PAD,
    width:  QR_SIZE,
    height: QR_SIZE,
  });

  /* ── URL del sitio ── */
  const urlText = qrUrl.replace("https://", "");
  const urlSize = 13;
  page.drawText(urlText, {
    x:    centeredX(urlText, urlSize, fontBold),
    y:    cardY - 30,
    size: urlSize,
    font: fontBold,
    color: C_TEAL,
  });

  /* ── Mensaje motivacional ── */
  const motto1     = "Tenha coragem de se expressar.";
  const motto1Size = 16;
  page.drawText(motto1, {
    x:    centeredX(motto1, motto1Size, fontOblique),
    y:    cardY - 72,
    size: motto1Size,
    font: fontOblique,
    color: C_TEXT,
  });

  const motto2     = "La bisutería que te da carácter.";
  const motto2Size = 11;
  page.drawText(motto2, {
    x:    centeredX(motto2, motto2Size, fontRegular),
    y:    cardY - 94,
    size: motto2Size,
    font: fontRegular,
    color: C_MUTED,
  });

  /* ── Instrucción de uso ── */
  const cta     = "Escanea el codigo y descubre nuestra coleccion";
  const ctaSize = 10;
  page.drawText(cta, {
    x:    centeredX(cta, ctaSize, fontRegular),
    y:    cardY - 120,
    size: ctaSize,
    font: fontRegular,
    color: C_DIM,
  });

  /* ── Puntos decorativos (izq y der de la URL) ── */
  for (let i = 0; i < 3; i++) {
    // Izquierda (pink)
    page.drawCircle({
      x:      80 + i * 14,
      y:      cardY - 30,
      size:   2.5,
      color:  C_PINK,
      opacity: 0.4 - i * 0.1,
    });
    // Derecha (teal)
    page.drawCircle({
      x:      PAGE_W - 80 - i * 14,
      y:      cardY - 30,
      size:   2.5,
      color:  C_TEAL,
      opacity: 0.4 - i * 0.1,
    });
  }

  /* ── Banda inferior ── */
  drawFadeRect(page, 0, 0, PAGE_W, 80, C_PINK, 0, 0.12);

  // Línea de acento inferior (pink)
  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: 3, color: C_PINK });

  // Arena (sand) a la derecha
  page.drawRectangle({ x: PAGE_W - 40, y: 0, width: 40, height: 3, color: C_SAND });

  /* ── Footer: texto legal pequeño ── */
  const footer     = `coragem.shop  ·  ${new Date().getFullYear()}`;
  const footerSize = 8;
  page.drawText(footer, {
    x:    centeredX(footer, footerSize, fontRegular),
    y:    14,
    size: footerSize,
    font: fontRegular,
    color: C_DIM,
  });

  return doc.save();
}