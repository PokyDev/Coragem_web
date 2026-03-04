"use client";

/**
 * ThemeToggle
 *
 * Botón para cambiar entre tema claro y oscuro.
 * Soporta dos variantes con paletas distintas:
 *
 *   - "public"  → usa next-themes (estado global del sitio público).
 *                 Colores: teal (dark) / pink (light) de la marca.
 *
 *   - "admin"   → usa useAdminTheme (estado aislado del panel admin).
 *                 Colores: --admin-accent (dark) / --admin-danger (light)
 *                 del design system Slate Command.
 *
 * El tamaño es configurable via la prop `size` (default "2.75rem").
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAdminThemeContext } from "@/components/admin/layout/AdminThemeProvider";

/* ─── Types ──────────────────────────────────────────────────────── */
export type ThemeToggleVariant = "public" | "admin";

interface ThemeToggleProps {
  variant?: ThemeToggleVariant;
  /** Tamaño del botón (default "2.75rem") */
  size?: string;
}

/* ─── Iconos ─────────────────────────────────────────────────────── */
function SunIcon({ stroke }: { stroke: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon({ stroke }: { stroke: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/* ─── Sub-componente: variante pública ───────────────────────────── */
function PublicThemeToggle({ size }: { size: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div style={{ width: size, height: size }} />;

  const isDark = theme === "dark";
  const accentColor = isDark ? "var(--coragem-teal)" : "var(--coragem-pink)";
  const bgColor = isDark
    ? "rgba(78, 196, 196, 0.08)"
    : "rgba(196, 122, 158, 0.08)";
  const borderColor = isDark ? "var(--coragem-teal)" : "var(--coragem-pink)";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
      className="theme-toggle theme-toggle--public"
      style={
        {
          width: size,
          height: size,
          "--toggle-bg": bgColor,
          "--toggle-border": borderColor,
          "--toggle-bg-hover": isDark
            ? "rgba(78, 196, 196, 0.2)"
            : "rgba(196, 122, 158, 0.2)",
        } as React.CSSProperties
      }
    >
      {isDark ? (
        <SunIcon stroke={accentColor} />
      ) : (
        <MoonIcon stroke={accentColor} />
      )}
    </button>
  );
}

/* ─── Sub-componente: variante admin ─────────────────────────────── */
function AdminThemeToggle({ size }: { size: string }) {
  // Consume el contexto del AdminThemeProvider — garantiza que toggle
  // y provider compartan el mismo estado y que el cambio se refleje en el DOM.
  const { theme, toggleTheme, mounted } = useAdminThemeContext();

  if (!mounted) return <div style={{ width: size, height: size }} />;

  const isDark = theme === "dark";
  const accentColor = isDark ? "var(--admin-accent)" : "var(--admin-danger)";
  const bgColor = isDark
    ? "rgba(78, 196, 196, 0.08)"
    : "rgba(196, 122, 158, 0.08)";
  const borderColor = isDark ? "var(--admin-accent)" : "var(--admin-danger)";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
      className="theme-toggle theme-toggle--admin"
      style={
        {
          width: size,
          height: size,
          "--toggle-bg": bgColor,
          "--toggle-border": borderColor,
          "--toggle-bg-hover": isDark
            ? "rgba(78, 196, 196, 0.2)"
            : "rgba(196, 122, 158, 0.2)",
        } as React.CSSProperties
      }
    >
      {isDark ? (
        <SunIcon stroke={accentColor} />
      ) : (
        <MoonIcon stroke={accentColor} />
      )}
    </button>
  );
}

/* ─── Componente público ─────────────────────────────────────────── */
export function ThemeToggle({
  variant = "public",
  size = "2.75rem",
}: ThemeToggleProps) {
  return (
    <>
      {variant === "admin" ? (
        <AdminThemeToggle size={size} />
      ) : (
        <PublicThemeToggle size={size} />
      )}

      <style>{`
        .theme-toggle {
          border-radius: 50%;
          border: 1.5px solid var(--toggle-border);
          background: var(--toggle-bg);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease, background 0.2s ease;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          flex-shrink: 0;
        }

        .theme-toggle:hover {
          transform: scale(1.1);
          background: var(--toggle-bg-hover) !important;
        }

        .theme-toggle:focus-visible {
          outline: 2px solid var(--toggle-border);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}