"use client";

/**
 * AdminThemeProvider
 *
 * Client Component responsable de:
 *   1. Leer el tema admin desde localStorage via useAdminTheme.
 *   2. Aplicar data-admin-theme al wrapper .admin en el DOM.
 *   3. Exponer el contexto del tema para que cualquier componente
 *      hijo (ej. ThemeToggle variant="admin") pueda consumirlo.
 *
 * Al ser un Client Component, permite mantener AdminLayout como
 * Server Component y recibir metadata export sin conflictos.
 */

import { createContext, useContext, useRef, useEffect } from "react";
import { useAdminTheme, type AdminTheme } from "@/hooks/admin/useAdminTheme";

/* ─── Contexto ───────────────────────────────────────────────────── */
interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
  mounted: boolean;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
  mounted: false,
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

  /* Aplicar data-admin-theme directamente al wrapper .admin */
  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.setAttribute("data-admin-theme", theme);
    }
  }, [theme]);

  return (
    <AdminThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      <div
        ref={wrapperRef}
        className="admin"
        /*
         * data-admin-theme="dark" como valor inicial SSR.
         * El useEffect lo sobreescribirá con la preferencia
         * guardada en cuanto el componente se monte en el cliente.
         */
        data-admin-theme="dark"
      >
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}