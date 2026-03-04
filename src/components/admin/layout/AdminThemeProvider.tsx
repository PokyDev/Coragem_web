"use client";

/**
 * src/components/admin/layout/AdminThemeProvider.tsx
 *
 * Client Component responsable de:
 *   1. Leer el tema admin desde localStorage via useAdminTheme.
 *   2. Aplicar data-admin-theme al wrapper .admin en el DOM.
 *   3. Exponer el contexto del tema para que cualquier componente
 *      hijo (ej. ThemeToggle variant="admin") pueda consumirlo.
 *   4. Renderizar AdminFloatingControls — disponible globalmente
 *      en todas las rutas /admin/* sin tocar ninguna página.
 *
 * Transición de tema:
 *   Las CSS custom properties no son animables directamente.
 *   La solución es un overlay de color sólido que hace fade-in
 *   justo antes de que los tokens cambien, y fade-out después.
 *   Esto produce una transición suave tipo "cross-fade" sin
 *   necesidad de animar las variables CSS en sí.
 */

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useAdminTheme, type AdminTheme } from "@/hooks/admin/useAdminTheme";
import { AdminFloatingControls } from "@/components/admin/layout/AdminFloatingControls";

/* ─── Duración de la transición (ms) ────────────────────────────── */
const TRANSITION_MS = 300;

/* ─── Color de fondo por tema (hardcodeado para el overlay) ──────── */
const THEME_BG: Record<AdminTheme, string> = {
  dark:  "#0d1520",
  light: "#f4f6f9",
};

/* ─── Contexto ───────────────────────────────────────────────────── */
interface AdminThemeContextValue {
  theme:       AdminTheme;
  toggleTheme: () => void;
  mounted:     boolean;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme:       "dark",
  toggleTheme: () => {},
  mounted:     false,
});

export function useAdminThemeContext() {
  return useContext(AdminThemeContext);
}

/* ─── Provider ───────────────────────────────────────────────────── */
export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, toggleTheme, mounted } = useAdminTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevTheme  = useRef<AdminTheme | null>(null);

  /*
   * ── Aplicar tema (con o sin transición) ──
   *
   * Primera vez (prevTheme === null): aplica directo, sin overlay.
   * Cambios posteriores: usa el overlay para enmascarar el salto.
   *
   * Por qué overlay y no CSS transition sobre los tokens:
   *   Las CSS custom properties no son interpolables por el browser.
   *   Aunque background-color tenga transition, el valor computado
   *   salta instantáneamente cuando el token cambia. El overlay
   *   tapa ese salto y lo convierte en un cross-fade perceptible.
   *
   * Flujo del overlay:
   *   1. Fade-in con el color del tema que SALE (opacidad 0 → 1).
   *   2. Al llegar a opacidad 1: cambiar data-admin-theme en el DOM.
   *      El salto ocurre aquí, pero el overlay lo está tapando.
   *   3. Fade-out revelando el contenido ya en el nuevo tema.
   */
  useEffect(() => {
    if (!mounted) return;

    const wrapper = wrapperRef.current;
    const overlay = overlayRef.current;
    if (!wrapper || !overlay) return;

    /* Primera aplicación: sin transición */
    if (prevTheme.current === null) {
      wrapper.setAttribute("data-admin-theme", theme);
      prevTheme.current = theme;
      return;
    }

    /* Sin cambio real */
    if (theme === prevTheme.current) return;

    const half    = TRANSITION_MS / 2;
    const exitBg  = THEME_BG[prevTheme.current];

    /* Paso 1: mostrar overlay con el color del tema saliente */
    overlay.style.transition    = "none";
    overlay.style.background    = exitBg;
    overlay.style.opacity       = "0";
    overlay.style.pointerEvents = "all";

    /* Forzar reflow para que la transición de opacidad funcione */
    void overlay.offsetHeight;

    overlay.style.transition = `opacity ${half}ms ease`;
    overlay.style.opacity    = "1";

    /* Paso 2: al llegar a opacidad máxima, cambiar el tema y hacer fade-out */
    const midTimer = setTimeout(() => {
      wrapper.setAttribute("data-admin-theme", theme);
      prevTheme.current = theme;

      overlay.style.transition = `opacity ${half}ms ease`;
      overlay.style.opacity    = "0";

      const endTimer = setTimeout(() => {
        overlay.style.pointerEvents = "none";
      }, half);

      return () => clearTimeout(endTimer);
    }, half);

    return () => clearTimeout(midTimer);
  }, [theme, mounted]);

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      <div
        ref={wrapperRef}
        className="admin"
        data-admin-theme="dark"
        style={{ position: "relative" }}
      >
        {children}

        {/*
         * Overlay de transición.
         * - position fixed + inset 0: cubre toda la viewport,
         *   no solo el contenido del wrapper.
         * - zIndex 9999: por encima de todo, incluido AdminFloatingControls.
         * - Empieza invisible y sin captura de eventos.
         */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          style={{
            position:      "fixed",
            inset:         0,
            opacity:       0,
            pointerEvents: "none",
            zIndex:        9999,
          }}
        />

        <AdminFloatingControls />
      </div>
    </AdminThemeContext.Provider>
  );
}