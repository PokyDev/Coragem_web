"use client";

/**
 * src/components/admin/layout/AdminShell.tsx
 *
 * Layout principal del panel administrativo.
 * Orquesta AdminSidebar, AdminTopbar y el slot de contenido.
 *
 * Maneja el estado de búsqueda del dashboard:
 *   - AdminTopbar emite onSearchChange cuando el usuario escribe.
 *   - El estado se expone mediante DashboardSearchContext para que
 *     cualquier componente hijo (DashboardPage) lo consuma sin prop-drilling.
 *
 * Estilos: AdminShell.module.css
 */

import { useState, useCallback, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar }  from "@/components/admin/layout/AdminTopbar";
import styles from "@/components/admin/css/AdminShell.module.css";

/* ─── Contexto de búsqueda del dashboard ────────────────────────── */

interface DashboardSearchContextValue {
  searchQuery: string;
}

const DashboardSearchContext = createContext<DashboardSearchContextValue>({
  searchQuery: "",
});

export function useDashboardSearch() {
  return useContext(DashboardSearchContext);
}

/* ─── Component ──────────────────────────────────────────────────── */

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <DashboardSearchContext.Provider value={{ searchQuery }}>
      <div className={styles.shell}>
        <AdminSidebar />
        <div className={styles.body}>
          <AdminTopbar onSearchChange={handleSearchChange} />
          <main className={styles.main}>
            {children}
          </main>
        </div>
      </div>
    </DashboardSearchContext.Provider>
  );
}