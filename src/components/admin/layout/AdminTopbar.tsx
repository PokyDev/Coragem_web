"use client";

/**
 * src/components/admin/layout/AdminTopbar.tsx
 *
 * Barra superior del panel administrativo.
 * El botón "+ Nuevo Producto" invoca onNewProduct del DashboardActionsContext,
 * que es registrado por DashboardPage al montar.
 */

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchInput }       from "@/components/shared/ui/SearchInput";
import { useAdminLogout } from "@/hooks/admin/useAdminLogout";
import { useProductSearch }  from "@/hooks/shared/useProductSearch";
import { useDashboardActions } from "@/components/admin/layout/AdminShell";
import styles from "@/components/admin/css/AdminShell.module.css";

/* ─── Mapa pathname → título ─────────────────────────────────────── */

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard":            "Dashboard",
  "/admin/dashboard/products":   "Productos",
  "/admin/dashboard/inventory":  "Inventario",
  "/admin/dashboard/images":     "Imágenes",
  "/admin/dashboard/categories": "Categorías",
  "/admin/dashboard/settings":   "Configuración",
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key) && key !== "/admin/dashboard")
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_TITLES[match] : "Panel Administrativo";
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

/* ─── Profile Menu ───────────────────────────────────────────────── */

function ProfileMenu({ onClose }: { onClose: () => void }) {
  const logout = useAdminLogout();
  const router = useRouter();
  return (
    <div className={styles.profileMenu} role="menu">
      <div className={styles.profileMenuHeader}>
        <span className={styles.profileMenuName}>Coragem Admin</span>
        <span className={styles.profileMenuEmail}>admin@coragem.co</span>
      </div>
      <div className={styles.profileMenuDivider} />
      <button className={styles.profileMenuItem} type="button" role="menuitem" onClick={onClose}>
        <span aria-hidden="true">⊙</span> Preferencias
      </button>
      <div className={styles.profileMenuDivider} />
      <button
        className={`${styles.profileMenuItem} ${styles.profileMenuItemDanger}`}
        type="button"
        role="menuitem"
        onClick={logout}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────── */

interface AdminTopbarProps {
  userName?:       string;
  onSearchChange?: (query: string) => void;
}

/* ─── Component ──────────────────────────────────────────────────── */

export function AdminTopbar({ userName = "Coragem Admin", onSearchChange }: AdminTopbarProps) {
  const pathname    = usePathname();
  const pageTitle   = resolvePageTitle(pathname);
  const isDashboard = pathname === "/admin/dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);

  const { query, clearQuery, inputProps } = useProductSearch({ onChange: onSearchChange });
  const { onNewProduct } = useDashboardActions();

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`${styles.topbar} ${isDashboard ? styles.topbarExpanded : ""}`}>
      <h1 className={styles.topbarTitle}>{pageTitle}</h1>

      {isDashboard && (
        <div className={styles.topbarSearch}>
          <SearchInput
            variant="admin"
            value={query}
            onChange={inputProps.onChange}
            onClear={clearQuery}
            placeholder="Buscar producto..."
          />
        </div>
      )}

      <div className={styles.topbarRight}>
        {isDashboard && (
          <button
            className={styles.btnNewProduct}
            type="button"
            onClick={() => onNewProduct?.()}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Producto</span>
          </button>
        )}

        <div className={styles.profileWrap}>
          <button
            ref={btnRef}
            className={styles.avatarBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú de perfil"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            type="button"
          >
            <span className={styles.avatarInitials}>{getInitials(userName)}</span>
          </button>

          {menuOpen && (
            <div ref={menuRef} className={styles.profileMenuWrap}>
              <ProfileMenu onClose={() => setMenuOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}