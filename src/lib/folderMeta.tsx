/**
 * src/lib/folderMeta.ts
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

/* ── Tokens de color (valores hex de los tokens del design system) ─ */

const TEAL  = "#4ec4c4";
const PINK  = "#c47a9e";
const SAND  = "#c49a6c";
const NAVY  = "#1e3a5f";

const tealBg  = "rgba(78,  196, 196, 0.12)";
const pinkBg  = "rgba(196, 122, 158, 0.12)";
const sandBg  = "rgba(196, 154, 108, 0.14)";
const navyBg  = "rgba(30,  58,  95,  0.30)";

/* ── Íconos SVG ─────────────────────────────────────────────────── */
// Cada ícono es un fragmento JSX — viewBox 24×24, stroke="currentColor".

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

/* ── Mapa principal ─────────────────────────────────────────────── */
// Claves siempre en minúsculas — la lookup normaliza el input.

const FOLDER_META_MAP: Record<string, FolderMeta> = {
  // ── Meses ──────────────────────────────────────────────────────
  enero:      { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  febrero:    { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  marzo:      { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  abril:      { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  mayo:       { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  junio:      { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  julio:      { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  agosto:     { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  septiembre: { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  octubre:    { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  noviembre:  { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },
  diciembre:  { icon: IconCalendar, accentColor: NAVY, bgColor: navyBg },

  // ── Categorías ─────────────────────────────────────────────────
  candongas:  { icon: IconHoop,     accentColor: PINK, bgColor: pinkBg },
  conjuntos:  { icon: IconGrid,     accentColor: TEAL, bgColor: tealBg },
  topos:      { icon: IconDot,      accentColor: SAND, bgColor: sandBg },
  aretes:     { icon: IconDiamond,  accentColor: PINK, bgColor: pinkBg },
  anillos:    { icon: IconRing,     accentColor: TEAL, bgColor: tealBg },
  cadenas:    { icon: IconChain,    accentColor: SAND, bgColor: sandBg },
  earcuff:    { icon: IconCrescent, accentColor: PINK, bgColor: pinkBg },
};

/* ── Valores neutros (fallback para carpetas no reconocidas) ────── */

const DEFAULT_META: FolderMeta = {
  icon:        null,   // FolderCard usará su ícono de carpeta genérico
  accentColor: "",     // FolderCard usará sus estilos CSS por defecto
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