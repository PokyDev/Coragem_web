/**
 * src/components/admin/dashboard/QRSection/QRPdfTemplate.ts
 *
 * Construye el PDF de presentación del QR de Coragem con pdf-lib.
 * Retorna un Uint8Array listo para descargar — sin side effects.
 *
 * Layout replicado del widget QR (Slate Command):
 *   ├─ Fondo oscuro full-page  (#0d1520)
 *   ├─ Barra superior: gradiente teal → pink (4 pt)
 *   ├─ Header centrado
 *   │    ├─ Eyebrow "accesorios con carácter" (teal, espaciado)
 *   │    ├─ Logotipo "CORAGEM" (bold, espaciado, blanco)
 *   │    ├─ Tagline PT (oblicua, muted)
 *   │    └─ Tagline ES (regular, dim)
 *   ├─ Separador: línea pink · rombo sand · línea teal
 *   ├─ Dots decorativos teal/pink + label "Escanea el código"
 *   ├─ Card blanca del QR con esquinas teal (border-radius simulado)
 *   ├─ Divider: líneas + dot teal central
 *   ├─ URL "coragem.shop" (teal, bold) + subtexto
 *   └─ Footer: "CORAGEM" izq · año der · barra inferior pink
 *
 * Paleta: Slate Command (--admin-* tokens) + colores de marca Coragem.
 * Tamaño: A4 vertical (595 × 842 pt).
 */

import { PDFDocument, rgb, StandardFonts, type RGB, type PDFFont } from "pdf-lib";

/* ── Tokens de color ─────────────────────────────────────────────── */

const C_BG    = rgb(0.051, 0.082, 0.125);   // #0d1520  — fondo base
const C_CARD  = rgb(0.067, 0.094, 0.141);   // #111827  — bg-card (no usado en PDF, reservado)
const C_WHITE = rgb(1,     1,     1    );

const C_TEAL  = rgb(0.306, 0.769, 0.769);   // #4ec4c4
const C_PINK  = rgb(0.769, 0.478, 0.620);   // #c47a9e
const C_SAND  = rgb(0.769, 0.604, 0.424);   // #c49a6c

const C_TEXT  = rgb(0.886, 0.910, 0.941);   // #e2e8f0  — admin-text
const C_MUTED = rgb(0.580, 0.639, 0.722);   // #94a3b8  — admin-text-muted
const C_DIM   = rgb(0.290, 0.333, 0.408);   // #4a5568  — admin-text-dim

const C_BORDER = rgb(0.118, 0.227, 0.373);  // #1e3a5f  — admin-border

/* ── Dimensiones A4 ─────────────────────────────────────────────── */

const PAGE_W = 595;
const PAGE_H = 842;
const CX     = PAGE_W / 2;  // centro horizontal

/* ── Helpers ─────────────────────────────────────────────────────── */

/**
 * Simula degradado vertical dibujando N rectángulos con opacidad
 * interpolada (pdf-lib no soporta gradientes nativos).
 */
function drawFadeRect(
  page:        ReturnType<PDFDocument["addPage"]>,
  x:           number,
  y:           number,
  w:           number,
  h:           number,
  color:       RGB,
  fromOpacity: number,
  toOpacity:   number,
  steps = 28,
) {
  const stepH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t       = i / (steps - 1);
    const opacity = fromOpacity + (toOpacity - fromOpacity) * t;
    page.drawRectangle({
      x,
      y:       y + h - (i + 1) * stepH,
      width:   w,
      height:  stepH + 0.5,
      color,
      opacity,
    });
  }
}

/**
 * Dibuja texto con letter-spacing manual (pdf-lib no lo soporta nativamente).
 * Devuelve el ancho total consumido.
 */
function drawSpacedText(
  page: ReturnType<PDFDocument["addPage"]>,
  text: string,
  opts: {
    x:            number;
    y:            number;
    size:         number;
    font:         PDFFont;
    color:        RGB;
    opacity?:     number;
    extraSpacing: number;
  },
): number {
  const { x, y, size, font, color, opacity = 1, extraSpacing } = opts;
  let cursorX = x;
  for (const char of text) {
    page.drawText(char, { x: cursorX, y, size, font, color, opacity });
    cursorX += font.widthOfTextAtSize(char, size) + extraSpacing;
  }
  return cursorX - x - extraSpacing; // ancho total sin trailing spacing
}

/**
 * Calcula el ancho total de un texto con spacing extra.
 */
function spacedWidth(
  text:         string,
  size:         number,
  font:         PDFFont,
  extraSpacing: number,
): number {
  let w = 0;
  for (const char of text) {
    w += font.widthOfTextAtSize(char, size) + extraSpacing;
  }
  return w - extraSpacing;
}

/** X de inicio para centrar texto normal (sin spacing extra). */
function centeredX(text: string, size: number, font: PDFFont): number {
  return (PAGE_W - font.widthOfTextAtSize(text, size)) / 2;
}

/** X de inicio para centrar texto con spacing extra. */
function centeredSpacedX(
  text:         string,
  size:         number,
  font:         PDFFont,
  extraSpacing: number,
): number {
  return (PAGE_W - spacedWidth(text, size, font, extraSpacing)) / 2;
}

/**
 * Dibuja las 4 esquinas del marco teal sobre la card del QR.
 * Replica el efecto `.cq-corner` del widget CSS.
 *
 * @param page  - Página PDF
 * @param cx    - Centro horizontal de la card
 * @param cardY - Coordenada Y inferior de la card (pdf-lib: origen en bottom-left)
 * @param cardW - Ancho total de la card
 * @param cardH - Alto total de la card
 * @param size  - Longitud de cada brazo de la esquina (px)
 * @param thick - Grosor de línea
 */
function drawCardCorners(
  page:  ReturnType<PDFDocument["addPage"]>,
  cx:    number,
  cardY: number,
  cardW: number,
  cardH: number,
  size  = 18,
  thick = 2,
) {
  const x0 = cx - cardW / 2;  // borde izquierdo
  const x1 = cx + cardW / 2;  // borde derecho
  const y0 = cardY;            // borde inferior
  const y1 = cardY + cardH;   // borde superior

  const color = C_TEAL;
  const offset = 0; // alineado exactamente con el borde de la card

  // ── Esquina superior-izquierda ──
  // horizontal
  page.drawLine({ start: { x: x0 - offset,        y: y1 + offset }, end: { x: x0 + size, y: y1 + offset }, thickness: thick, color });
  // vertical
  page.drawLine({ start: { x: x0 - offset,        y: y1 + offset }, end: { x: x0 - offset, y: y1 - size  }, thickness: thick, color });

  // ── Esquina superior-derecha ──
  page.drawLine({ start: { x: x1 + offset,        y: y1 + offset }, end: { x: x1 - size, y: y1 + offset }, thickness: thick, color });
  page.drawLine({ start: { x: x1 + offset,        y: y1 + offset }, end: { x: x1 + offset, y: y1 - size  }, thickness: thick, color });

  // ── Esquina inferior-izquierda ──
  page.drawLine({ start: { x: x0 - offset,        y: y0 - offset }, end: { x: x0 + size, y: y0 - offset }, thickness: thick, color });
  page.drawLine({ start: { x: x0 - offset,        y: y0 - offset }, end: { x: x0 - offset, y: y0 + size  }, thickness: thick, color });

  // ── Esquina inferior-derecha ──
  page.drawLine({ start: { x: x1 + offset,        y: y0 - offset }, end: { x: x1 - size, y: y0 - offset }, thickness: thick, color });
  page.drawLine({ start: { x: x1 + offset,        y: y0 - offset }, end: { x: x1 + offset, y: y0 + size  }, thickness: thick, color });
}

/**
 * Dibuja un rombo (◆) centrado en (cx, cy) con radio r.
 * Replica el separador del widget.
 */
function drawDiamond(
  page:  ReturnType<PDFDocument["addPage"]>,
  cx:    number,
  cy:    number,
  r:     number,
  color: RGB,
  thick  = 1,
  opacity = 0.9,
) {
  const segs: [{ x: number; y: number }, { x: number; y: number }][] = [
    [{ x: cx,     y: cy + r }, { x: cx + r, y: cy     }],
    [{ x: cx + r, y: cy     }, { x: cx,     y: cy - r }],
    [{ x: cx,     y: cy - r }, { x: cx - r, y: cy     }],
    [{ x: cx - r, y: cy     }, { x: cx,     y: cy + r }],
  ];
  for (const [start, end] of segs) {
    page.drawLine({ start, end, thickness: thick, color, opacity });
  }
}

/* ── API pública ─────────────────────────────────────────────────── */

export interface BuildQRPdfOptions {
  /** ArrayBuffer de la imagen PNG del QR generada por qr-code-styling */
  qrPngBuffer: ArrayBuffer;
  /** URL codificada en el QR (para mostrarla en el PDF) */
  qrUrl: string;
}

export async function buildQRPdf({ qrPngBuffer, qrUrl }: BuildQRPdfOptions): Promise<Uint8Array> {
  const doc  = await PDFDocument.create();
  const page = doc.addPage([PAGE_W, PAGE_H]);

  /* ── Fonts ── */
  const fontBold    = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  /* ══════════════════════════════════════════════════════════════
   *  FONDO
   * ══════════════════════════════════════════════════════════════ */

  page.drawRectangle({ x: 0, y: 0, width: PAGE_W, height: PAGE_H, color: C_BG });

  /* ══════════════════════════════════════════════════════════════
   *  BARRA SUPERIOR — gradiente teal → pink
   *  Replica: .cq-top-bar { background: linear-gradient(90deg, teal, pink) }
   * ══════════════════════════════════════════════════════════════ */

  const TOP_BAR_H = 4;

  // Mitad izquierda: teal opaco → transparente (de izquierda a derecha)
  const BAR_STEPS = 32;
  const halfW     = PAGE_W / 2;
  const stepW     = halfW / BAR_STEPS;

  for (let i = 0; i < BAR_STEPS; i++) {
    const t       = i / (BAR_STEPS - 1);
    const opacity = 1 - t * 0.15; // casi opaco en todo el tramo izquierdo
    page.drawRectangle({
      x:      i * stepW,
      y:      PAGE_H - TOP_BAR_H,
      width:  stepW + 0.5,
      height: TOP_BAR_H,
      color:  C_TEAL,
      opacity,
    });
  }

  // Mitad derecha: pink aparece de centro hacia la derecha
  for (let i = 0; i < BAR_STEPS; i++) {
    const t       = i / (BAR_STEPS - 1);
    const opacity = 0.3 + t * 0.7; // va de translúcido a opaco
    page.drawRectangle({
      x:      halfW + i * stepW,
      y:      PAGE_H - TOP_BAR_H,
      width:  stepW + 0.5,
      height: TOP_BAR_H,
      color:  C_PINK,
      opacity,
    });
  }

  /* ══════════════════════════════════════════════════════════════
   *  HALO SUPERIOR — degradado teal suave detrás del header
   *  Replica: el fondo oscuro del .cq-header
   * ══════════════════════════════════════════════════════════════ */

  drawFadeRect(page, 0, PAGE_H - 140, PAGE_W, 140, C_TEAL, 0.07, 0, 20);

  /* ══════════════════════════════════════════════════════════════
   *  HEADER
   * ══════════════════════════════════════════════════════════════ */

  // ── Eyebrow: "accesorios con carácter" ──
  // Replica: .cq-eyebrow { letter-spacing: 0.28em; color: teal; font-size: 10px }
  const EYEBROW_TEXT    = "accesorios con caracter";
  const EYEBROW_SIZE    = 8.5;
  const EYEBROW_SPACING = 2.0;
  const eyebrowX = centeredSpacedX(EYEBROW_TEXT, EYEBROW_SIZE, fontRegular, EYEBROW_SPACING);

  drawSpacedText(page, EYEBROW_TEXT, {
    x:            eyebrowX,
    y:            PAGE_H - 44,
    size:         EYEBROW_SIZE,
    font:         fontRegular,
    color:        C_TEAL,
    extraSpacing: EYEBROW_SPACING,
  });

  // ── Logotipo: "CORAGEM" ──
  // Replica: .cq-brand { font-size: 48px; font-weight: 300; letter-spacing: 0.18em; color: #e2e8f0 }
  // Helvetica-Bold con spacing generoso simula el peso ligero + espaciado amplio de Cormorant
  const LOGO_TEXT    = "CORAGEM";
  const LOGO_SIZE    = 38;
  const LOGO_SPACING = 7;
  const logoX = centeredSpacedX(LOGO_TEXT, LOGO_SIZE, fontBold, LOGO_SPACING);

  drawSpacedText(page, LOGO_TEXT, {
    x:            logoX,
    y:            PAGE_H - 88,
    size:         LOGO_SIZE,
    font:         fontBold,
    color:        C_TEXT,
    extraSpacing: LOGO_SPACING,
  });

  // ── Tagline portugués ──
  // Replica: .cq-tagline-pt { font-style: italic; font-size: 14px; color: #94a3b8 }
  const TAGLINE_PT      = "Tenha coragem de se expressar.";
  const TAGLINE_PT_SIZE = 12;
  page.drawText(TAGLINE_PT, {
    x:    centeredX(TAGLINE_PT, TAGLINE_PT_SIZE, fontOblique),
    y:    PAGE_H - 110,
    size: TAGLINE_PT_SIZE,
    font: fontOblique,
    color: C_MUTED,
  });

  // ── Tagline español ──
  // Replica: .cq-tagline-es { font-size: 11px; color: #4a5568 }
  const TAGLINE_ES      = "La bisuteria que te da caracter.";
  const TAGLINE_ES_SIZE = 9.5;
  page.drawText(TAGLINE_ES, {
    x:    centeredX(TAGLINE_ES, TAGLINE_ES_SIZE, fontRegular),
    y:    PAGE_H - 128,
    size: TAGLINE_ES_SIZE,
    font: fontRegular,
    color: C_DIM,
  });

  // ── Línea separadora del header (border-bottom) ──
  // Replica: .cq-header { border-bottom: 1px solid rgba(30,58,95,0.6) }
  page.drawLine({
    start:     { x: 48, y: PAGE_H - 144 },
    end:       { x: PAGE_W - 48, y: PAGE_H - 144 },
    thickness: 0.5,
    color:     C_BORDER,
    opacity:   0.6,
  });

  /* ══════════════════════════════════════════════════════════════
   *  BODY — zona central
   * ══════════════════════════════════════════════════════════════ */

  // Posición base del contenido del body (empieza debajo del header border)
  const BODY_TOP = PAGE_H - 160;  // Y superior del primer elemento del body

  /* ── Dots decorativos + label "Escanea el código" ──
   * Replica: .cq-accent-dots teal izq · .cq-scan-hint · dots pink der
   * Formato: ●●● · ESCANEA EL CODIGO · ●●● */

  const SCAN_LABEL      = "escanea el codigo";
  const SCAN_LABEL_SIZE = 8;
  const SCAN_SPACING    = 1.8;
  const scanLabelW      = spacedWidth(SCAN_LABEL, SCAN_LABEL_SIZE, fontRegular, SCAN_SPACING);

  // Margen entre dots y texto
  const DOT_R         = 2.2;
  const DOT_GAP       = 8;
  const DOTS_SECTION_W = DOT_R * 2 * 3 + DOT_GAP * 2; // 3 dots con gaps
  const TOTAL_SCAN_W  = DOTS_SECTION_W * 2 + 20 + scanLabelW; // dots·dots · label · dots·dots
  const scanStartX    = (PAGE_W - TOTAL_SCAN_W) / 2;
  const scanY         = BODY_TOP - 14;

  // Dots teal izquierdos (opacidad creciente: 0.4, 0.7, 1.0)
  const tealOpacities = [0.4, 0.7, 1.0];
  for (let i = 0; i < 3; i++) {
    page.drawCircle({
      x:       scanStartX + DOT_R + i * (DOT_R * 2 + DOT_GAP),
      y:       scanY,
      size:    DOT_R,
      color:   C_TEAL,
      opacity: tealOpacities[i],
    });
  }

  // Label "escanea el código"
  const scanTextX = scanStartX + DOTS_SECTION_W + 10;
  drawSpacedText(page, SCAN_LABEL, {
    x:            scanTextX,
    y:            scanY - 3.5,
    size:         SCAN_LABEL_SIZE,
    font:         fontRegular,
    color:        C_DIM,
    extraSpacing: SCAN_SPACING,
  });

  // Dots pink derechos (opacidad decreciente: 1.0, 0.7, 0.4)
  const pinkStartX    = scanTextX + scanLabelW + 10;
  const pinkOpacities = [1.0, 0.7, 0.4];
  for (let i = 0; i < 3; i++) {
    page.drawCircle({
      x:       pinkStartX + DOT_R + i * (DOT_R * 2 + DOT_GAP),
      y:       scanY,
      size:    DOT_R,
      color:   C_PINK,
      opacity: pinkOpacities[i],
    });
  }

  /* ── Card del QR ──
   * Replica: .cq-qr-frame { background: #fff; border-radius: 14px; padding: 16px }
   * + .cq-corner (esquinas teal superpuestas) */

  const QR_SIZE     = 200;   // tamaño de la imagen QR dentro de la card
  const CARD_PAD    = 16;    // padding de la card (réplica del widget: padding: 12px)
  const CARD_W      = QR_SIZE + CARD_PAD * 2;
  const CARD_H      = QR_SIZE + CARD_PAD * 2;
  const CARD_X      = CX - CARD_W / 2;
  const CARD_Y      = BODY_TOP - 44 - CARD_H;  // debajo del row de dots + gap

  // Sombra sutil (simula box-shadow: 0 2px 16px rgba(0,0,0,0.18))
  page.drawRectangle({
    x:       CARD_X + 3,
    y:       CARD_Y - 3,
    width:   CARD_W,
    height:  CARD_H,
    color:   rgb(0, 0, 0),
    opacity: 0.22,
  });

  // Card blanca
  page.drawRectangle({
    x:      CARD_X,
    y:      CARD_Y,
    width:  CARD_W,
    height: CARD_H,
    color:  C_WHITE,
  });

  // Esquinas teal (reemplaza el border-radius visual del widget)
  drawCardCorners(page, CX, CARD_Y, CARD_W, CARD_H, 18, 2);

  /* ── Imagen QR ── */
  const qrImage = await doc.embedPng(qrPngBuffer);
  page.drawImage(qrImage, {
    x:      CARD_X + CARD_PAD,
    y:      CARD_Y + CARD_PAD,
    width:  QR_SIZE,
    height: QR_SIZE,
  });

  /* ── Divider: líneas + dot teal ──
   * Replica: .cq-divider { línea — dot — línea } */

  const DIVIDER_Y   = CARD_Y - 24;
  const DIVIDER_W   = 120;  // longitud total de las líneas
  const dividerX0   = CX - DIVIDER_W / 2;
  const dividerX1   = CX + DIVIDER_W / 2;

  page.drawLine({
    start:     { x: dividerX0, y: DIVIDER_Y },
    end:       { x: CX - 6,   y: DIVIDER_Y },
    thickness: 0.5,
    color:     C_BORDER,
    opacity:   0.8,
  });

  page.drawCircle({
    x:       CX,
    y:       DIVIDER_Y,
    size:    2.5,
    color:   C_TEAL,
    opacity: 0.5,
  });

  page.drawLine({
    start:     { x: CX + 6,    y: DIVIDER_Y },
    end:       { x: dividerX1, y: DIVIDER_Y },
    thickness: 0.5,
    color:     C_BORDER,
    opacity:   0.8,
  });

  /* ── URL del sitio ──
   * Replica: .cq-url { color: teal; font-size: 16px; font-weight: 600; letter-spacing: 0.08em }
   * + .cq-url-sub { color: dim; font-size: 10px; letter-spacing: 0.14em } */

  const urlDisplay    = qrUrl.replace("https://", "");
  const URL_SIZE      = 14;
  const URL_SPACING   = 1.0;
  const urlX          = centeredSpacedX(urlDisplay, URL_SIZE, fontBold, URL_SPACING);

  const URL_Y = DIVIDER_Y - 20;

  drawSpacedText(page, urlDisplay, {
    x:            urlX,
    y:            URL_Y,
    size:         URL_SIZE,
    font:         fontBold,
    color:        C_TEAL,
    extraSpacing: URL_SPACING,
  });

  const URL_SUB_TEXT    = "descubre la coleccion";
  const URL_SUB_SIZE    = 8;
  const URL_SUB_SPACING = 1.4;
  const urlSubX         = centeredSpacedX(URL_SUB_TEXT, URL_SUB_SIZE, fontRegular, URL_SUB_SPACING);

  drawSpacedText(page, URL_SUB_TEXT, {
    x:            urlSubX,
    y:            URL_Y - 16,
    size:         URL_SUB_SIZE,
    font:         fontRegular,
    color:        C_DIM,
    extraSpacing: URL_SUB_SPACING,
  });

  /* ══════════════════════════════════════════════════════════════
   *  SEPARADOR HEADER (réplica del .cq-header interior):
   *  línea pink · rombo sand · línea teal
   *  (posicionado entre header y el área de scan, visible si hay espacio)
   * ══════════════════════════════════════════════════════════════ */

  const SEP_Y  = BODY_TOP - 0;
  const SEP_W  = 56;
  const sepX0  = CX - SEP_W / 2;
  const sepX1  = CX + SEP_W / 2;

  page.drawLine({
    start:     { x: sepX0 - 36, y: SEP_Y },
    end:       { x: sepX0,      y: SEP_Y },
    thickness: 0.8,
    color:     C_PINK,
    opacity:   0.45,
  });

  drawDiamond(page, CX, SEP_Y, 3.5, C_SAND, 1, 0.9);

  page.drawLine({
    start:     { x: sepX1,      y: SEP_Y },
    end:       { x: sepX1 + 36, y: SEP_Y },
    thickness: 0.8,
    color:     C_TEAL,
    opacity:   0.45,
  });

  /* ══════════════════════════════════════════════════════════════
   *  HALO INFERIOR — degradado pink suave
   * ══════════════════════════════════════════════════════════════ */

  drawFadeRect(page, 0, 0, PAGE_W, 90, C_PINK, 0, 0.10, 20);

  /* ══════════════════════════════════════════════════════════════
   *  FOOTER
   *  Replica: .cq-footer { "CORAGEM" izq · año der · border-top }
   * ══════════════════════════════════════════════════════════════ */

  const FOOTER_Y      = 28;
  const FOOTER_BORDER = 56;

  // Línea divisoria del footer
  page.drawLine({
    start:     { x: FOOTER_BORDER,            y: FOOTER_Y + 20 },
    end:       { x: PAGE_W - FOOTER_BORDER,   y: FOOTER_Y + 20 },
    thickness: 0.5,
    color:     C_BORDER,
    opacity:   0.5,
  });

  // "CORAGEM" con el "GEM" en teal (réplica de .cq-footer-brand span { color: teal })
  const FOOTER_BRAND_SIZE    = 10;
  const FOOTER_BRAND_SPACING = 1.8;
  const FOOTER_X             = FOOTER_BORDER;

  drawSpacedText(page, "CORA", {
    x:            FOOTER_X,
    y:            FOOTER_Y,
    size:         FOOTER_BRAND_SIZE,
    font:         fontBold,
    color:        C_TEXT,
    extraSpacing: FOOTER_BRAND_SPACING,
  });

  const coraW = spacedWidth("CORA", FOOTER_BRAND_SIZE, fontBold, FOOTER_BRAND_SPACING);

  drawSpacedText(page, "GEM", {
    x:            FOOTER_X + coraW + FOOTER_BRAND_SPACING,
    y:            FOOTER_Y,
    size:         FOOTER_BRAND_SIZE,
    font:         fontBold,
    color:        C_TEAL,
    extraSpacing: FOOTER_BRAND_SPACING,
  });

  // Año (derecha)
  const yearText = `${new Date().getFullYear()}`;
  const yearSize = 9;
  const yearX    = PAGE_W - FOOTER_BORDER - fontRegular.widthOfTextAtSize(yearText, yearSize);

  page.drawText(yearText, {
    x:    yearX,
    y:    FOOTER_Y,
    size: yearSize,
    font: fontRegular,
    color: C_DIM,
  });

  /* ── Barra inferior: pink + sand (réplica de .cq-top-bar invertida) ── */

  const BOT_BAR_H = 3;

  // Pink de izquierda a casi-todo
  page.drawRectangle({
    x:      0,
    y:      0,
    width:  PAGE_W - 36,
    height: BOT_BAR_H,
    color:  C_PINK,
  });

  // Acento sand en el extremo derecho
  page.drawRectangle({
    x:      PAGE_W - 36,
    y:      0,
    width:  36,
    height: BOT_BAR_H,
    color:  C_SAND,
  });

  return doc.save();
}