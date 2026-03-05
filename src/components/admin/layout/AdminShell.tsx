"use client";

/**
 * src/components/admin/layout/AdminShell.tsx
 *
 * Layout principal del panel administrativo.
 * Expone dos contextos para evitar prop-drilling:
 *   - DashboardSearchContext  → búsqueda del topbar hacia DashboardPage
 *   - DashboardActionsContext → acciones del topbar (onNewProduct) hacia DashboardPage
 */

import { useState, useCallback, createContext, useContext } from "react";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar }  from "@/components/admin/layout/AdminTopbar";
import styles from "@/components/admin/css/AdminShell.module.css";

/* ─── Contexto de búsqueda ───────────────────────────────────────── */

interface DashboardSearchContextValue {
  searchQuery: string;
}

const DashboardSearchContext = createContext<DashboardSearchContextValue>({
  searchQuery: "",
});

export function useDashboardSearch() {
  return useContext(DashboardSearchContext);
}

/* ─── Contexto de acciones ───────────────────────────────────────── */

interface DashboardActionsContextValue {
  onNewProduct: (() => void) | null;
  registerNewProductAction: (fn: () => void) => void;
}

const DashboardActionsContext = createContext<DashboardActionsContextValue>({
  onNewProduct:             null,
  registerNewProductAction: () => {},
});

export function useDashboardActions() {
  return useContext(DashboardActionsContext);
}

/* ─── Component ──────────────────────────────────────────────────── */

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [searchQuery,    setSearchQuery]    = useState("");
  const [newProductFn,   setNewProductFn]   = useState<(() => void) | null>(null);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /* DashboardPage registra su openNewModal aquí al montar */
  const registerNewProductAction = useCallback((fn: () => void) => {
    setNewProductFn(() => fn);
  }, []);

  return (
    <DashboardSearchContext.Provider value={{ searchQuery }}>
      <DashboardActionsContext.Provider value={{ onNewProduct: newProductFn, registerNewProductAction }}>
        <div className={styles.shell}>
          <AdminSidebar />
          <div className={styles.body}>
            <AdminTopbar onSearchChange={handleSearchChange} />
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </div>
      </DashboardActionsContext.Provider>
    </DashboardSearchContext.Provider>
  );
}