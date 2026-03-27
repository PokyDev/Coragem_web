"use client";

/**
 * src/components/admin/layout/AdminShell.tsx
 *
 * Layout principal del panel administrativo.
 * Expone dos contextos para evitar prop-drilling:
 *   - DashboardSearchContext  → búsqueda del topbar hacia DashboardPage
 *   - DashboardActionsContext → acciones del topbar (onNewProduct) hacia DashboardPage
 *
 * Responsivo (breakpoint ≤ 1100px):
 *   - El sidebar se oculta con CSS (display: none).
 *   - AdminTopbar muestra el botón hamburguesa.
 *   - AdminMobileMenu se renderiza en su lugar.
 */

import { useState, useCallback, createContext, useContext } from "react";
import { AdminSidebar }    from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar }     from "@/components/admin/layout/AdminTopbar";
import { AdminMobileMenu } from "@/components/admin/layout/AdminMobileMenu";
import styles from "./AdminShell.module.css";

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
  onNewProduct:             (() => void) | null;
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
  const [searchQuery,  setSearchQuery]  = useState("");
  const [newProductFn, setNewProductFn] = useState<(() => void) | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /* DashboardPage registra su openNewModal aquí al montar */
  const registerNewProductAction = useCallback((fn: () => void) => {
    setNewProductFn(() => fn);
  }, []);

  return (
    <DashboardSearchContext.Provider value={{ searchQuery }}>
      <DashboardActionsContext.Provider
        value={{ onNewProduct: newProductFn, registerNewProductAction }}
      >
        <div className={styles.shell}>
          {/* Sidebar — oculto en ≤ 1100px via CSS */}
          <AdminSidebar />

          <div className={styles.body}>
            <AdminTopbar
              onSearchChange={handleSearchChange}
              onMenuOpen={() => setMobileMenuOpen(true)}
            />
            <main className={styles.main}>
              {children}
            </main>
          </div>
        </div>

        {/* Menú móvil — solo visible cuando mobileMenuOpen = true */}
        <AdminMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      </DashboardActionsContext.Provider>
    </DashboardSearchContext.Provider>
  );
}