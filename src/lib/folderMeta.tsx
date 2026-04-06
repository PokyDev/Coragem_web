/**
 * src/lib/folderMeta.tsx
 *
 * Metadatos visuales para carpetas conocidas del browser de Cloudinary.
 * Centraliza íconos SVG y colores de acento por nombre de carpeta.
 *
 * Uso:
 *   const meta = getFolderMeta("Aretes");
 *   // → { icon: <svg…/>, accentColor: "#c47a9e", bgColor: "rgba(196,122,158,0.10)" }
 *
 * Extensión:
 *   Para agregar una carpeta nueva, añadir una entrada en FOLDER_META_MAP
 *   con la clave en minúsculas. No es necesario tocar ningún componente.
 */

import type { ReactNode } from "react";

/* ── Tipos ──────────────────────────────────────────────────────── */

export interface FolderMeta {
  /** Ícono SVG como ReactNode */
  icon:        ReactNode;
  /** Color de acento (borde hover, ícono) */
  accentColor: string;
  /** Fondo del área del ícono */
  bgColor:     string;
}

/* Generación de Backgrounds */

const withOpacity = (hex: string, opacity: number) => {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/* ── Tokens de color (valores hex de los tokens del design system) ─ */

const TEAL     = "#4ec4c4";
const PINK     = "#c47a9e";
const SAND     = "#c49a6c";
const LAVENDER = "#a88ec6"; // elegante / femenino
const CORAL    = "#e58a7a"; // cálido / llamativo
const SKY      = "#7ab6e5"; // fresco / moderno
const OLIVE    = "#9aa86c"; // natural / artesanal

const tealBg     = withOpacity(TEAL, 0.12);
const pinkBg     = withOpacity(PINK, 0.12);
const sandBg     = withOpacity(SAND, 0.14);
const lavenderBg = withOpacity(LAVENDER, 0.12);
const coralBg    = withOpacity(CORAL, 0.12);
const skyBg      = withOpacity(SKY, 0.12);
const oliveBg    = withOpacity(OLIVE, 0.14);

/* ── Íconos SVG ─────────────────────────────────────────────────── */

const IconCalendar = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="3"  y1="9"  x2="21" y2="9"  />
    <line x1="8"  y1="2"  x2="8"  y2="6"  />
    <line x1="16" y1="2"  x2="16" y2="6"  />
  </svg>
);

const IconHoop = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

const IconGrid = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3"  y="3"  width="8" height="8" rx="1.5" />
    <rect x="13" y="3"  width="8" height="8" rx="1.5" />
    <rect x="3"  y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const IconDot = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="12" r="5.5" />
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const IconDiamond = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3L21 9l-9 12L3 9z" />
    <line x1="3" y1="9" x2="21" y2="9" />
  </svg>
);

const IconRing = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
    <ellipse cx="12" cy="13" rx="8"   ry="5"   />
    <ellipse cx="12" cy="13" rx="3.5" ry="2.2" />
    <path d="M8.5 10 Q9.5 5 12 4 Q14.5 5 15.5 10" />
  </svg>
);

const IconChain = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconCrescent = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconBracelet = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {/* Forma principal tipo aro */}
    <circle cx="12" cy="12" r="7.5" />

    {/* Cuentas / detalles */}
    <circle cx="12" cy="4.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="8" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="16" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="19.5" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="16" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="8" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

/* ── Mapa principal ─────────────────────────────────────────────── */

const FOLDER_META_MAP: Record<string, FolderMeta> = {
  // ── Meses — teal para máximo contraste y coherencia con el sistema ──
  enero:      { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  febrero:    { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  marzo:      { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  abril:      { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  mayo:       { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  junio:      { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  julio:      { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  agosto:     { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  septiembre: { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  octubre:    { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  noviembre:  { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },
  diciembre:  { icon: IconCalendar, accentColor: TEAL, bgColor: tealBg },

  // ── Categorías ─────────────────────────────────────────────────
  candongas:  { icon: IconHoop,      accentColor: PINK,     bgColor: pinkBg },
  conjuntos:  { icon: IconGrid,      accentColor: TEAL,     bgColor: tealBg },
  topos:      { icon: IconDot,       accentColor: SAND,     bgColor: sandBg },
  aretes:     { icon: IconDiamond,   accentColor: PINK,     bgColor: pinkBg },
  anillos:    { icon: IconRing,      accentColor: TEAL,     bgColor: tealBg },
  cadenas:    { icon: IconChain,     accentColor: OLIVE,    bgColor: oliveBg },
  earcuff:    { icon: IconCrescent,  accentColor: PINK,     bgColor: pinkBg },
  pulseras:   { icon: IconBracelet,  accentColor: LAVENDER, bgColor: lavenderBg },
};

/* ── Valores neutros (fallback para carpetas no reconocidas) ────── */

const DEFAULT_META: FolderMeta = {
  icon:        null,
  accentColor: "",
  bgColor:     "",
};

/* ── API pública ────────────────────────────────────────────────── */

/**
 * Devuelve los metadatos visuales para una carpeta dado su nombre.
 * La comparación es case-insensitive y tolera espacios al inicio/final.
 *
 * @param name - Nombre de la carpeta (ej. "Aretes", "ENERO", "conjuntos")
 */
export function getFolderMeta(name: string): FolderMeta {
  const key = name.trim().toLowerCase();
  return FOLDER_META_MAP[key] ?? DEFAULT_META;
}