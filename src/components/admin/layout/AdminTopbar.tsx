"use client";

/**
 * src/components/admin/layout/AdminTopbar.tsx
 *
 * Barra superior del panel administrativo.
 *
 * Layout base (todas las páginas):
 *   [Título]  ···  [Avatar]
 *
 * Layout extendido (solo /admin/dashboard):
 *   [Título]  [SearchInput]  [+ Nuevo Producto]  [Avatar]
 *
 * La búsqueda en el dashboard es "levantada" mediante el prop
 * onSearchChange, que la página del dashboard consume para filtrar
 * su tabla de productos en tiempo real.
 *
 * Estilos: AdminShell.module.css
 */

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SearchInput }      from "@/components/shared/ui/SearchInput";
import { useProductSearch } from "@/hooks/shared/useProductSearch";
import styles from "@/components/admin/css/AdminShell.module.css";

/* ─── Mapa pathname → título visible ────────────────────────────── */

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

/* ─── Avatar initials ────────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Profile Menu ───────────────────────────────────────────────── */

interface ProfileMenuProps {
  onClose: () => void;
}

function ProfileMenu({ onClose }: ProfileMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    onClose();
    router.push("/admin");
  };

  return (
    <div className={styles.profileMenu} role="menu">
      <div className={styles.profileMenuHeader}>
        <span className={styles.profileMenuName}>Coragem Admin</span>
        <span className={styles.profileMenuEmail}>admin@coragem.co</span>
      </div>

      <div className={styles.profileMenuDivider} />

      <button
        className={styles.profileMenuItem}
        type="button"
        role="menuitem"
        onClick={onClose}
      >
        <span aria-hidden="true">⊙</span>
        Preferencias
      </button>

      <div className={styles.profileMenuDivider} />

      <button
        className={`${styles.profileMenuItem} ${styles.profileMenuItemDanger}`}
        type="button"
        role="menuitem"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────── */

interface AdminTopbarProps {
  userName?:      string;
  /**
   * Callback invocado cuando el usuario escribe en la barra de búsqueda
   * del dashboard. Solo aplica en /admin/dashboard.
   */
  onSearchChange?: (query: string) => void;
}

/* ─── Component ──────────────────────────────────────────────────── */

export function AdminTopbar({
  userName       = "Coragem Admin",
  onSearchChange,
}: AdminTopbarProps) {
  const pathname  = usePathname();
  const pageTitle = resolvePageTitle(pathname);
  const isDashboard = pathname === "/admin/dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef  = useRef<HTMLButtonElement>(null);

  const { query, clearQuery, inputProps } = useProductSearch({
    onChange: onSearchChange,
  });

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current  && !btnRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  /* Cerrar con Escape */
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header className={`${styles.topbar} ${isDashboard ? styles.topbarExpanded : ""}`}>
      {/* Título de la página activa */}
      <h1 className={styles.topbarTitle}>{pageTitle}</h1>

      {/* Barra de búsqueda — solo en /admin/dashboard */}
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

      {/* Extremo derecho */}
      <div className={styles.topbarRight}>
        {/* Botón Nuevo Producto — solo en /admin/dashboard */}
        {isDashboard && (
          <button
            className={styles.btnNewProduct}
            type="button"
            onClick={() => {
              /* TODO: navegar a /admin/dashboard/products/new */
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Producto</span>
          </button>
        )}

        {/* Avatar / Perfil */}
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
            <span className={styles.avatarInitials}>
              {getInitials(userName)}
            </span>
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