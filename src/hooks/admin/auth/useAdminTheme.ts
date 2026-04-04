"use client";

/**
 * useAdminTheme
 *
 * Maneja el tema del panel administrativo de forma completamente
 * independiente del tema público (next-themes).
 *
 * - Estado persistido en localStorage bajo la clave "coragem-admin-theme".
 * - Valor por defecto: "dark" (Slate Command es dark-first).
 * - No interfiere con la clase `.dark` que gestiona next-themes para el sitio público.
 * - NO toca el DOM — esa responsabilidad es exclusiva de AdminThemeProvider.
 */

import { useCallback, useEffect, useState } from "react";

export type AdminTheme = "dark" | "light";

const STORAGE_KEY = "coragem-admin-theme";
const DEFAULT_THEME: AdminTheme = "dark";

export function useAdminTheme() {
  const [theme, setThemeState] = useState<AdminTheme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  /* ── Leer preferencia guardada al montar ── */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as AdminTheme | null;
    const resolved: AdminTheme =
      stored === "light" || stored === "dark" ? stored : DEFAULT_THEME;
    setThemeState(resolved);
    setMounted(true);
  }, []);

  /* ── Toggle público ── */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next: AdminTheme = prev === "dark" ? "light" : "dark";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme, mounted } as const;
}