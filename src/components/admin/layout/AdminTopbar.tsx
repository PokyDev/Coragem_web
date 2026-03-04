"use client";

/**
 * src/components/admin/layout/AdminTopbar.tsx
 *
 * Barra superior del panel administrativo.
 *
 * Extremo izquierdo: título de la página activa, derivado de usePathname().
 * Extremo derecho:   botón de perfil / avatar con menú desplegable.
 *
 * El título se resuelve internamente mediante PAGE_TITLES — no requiere
 * props ni contexto externo. Al agregar nuevas rutas al dashboard basta
 * con añadir su entrada en ese mapa.
 *
 * Estilos: AdminShell.module.css
 */

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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

/**
 * Resuelve el título más específico que coincida con el pathname actual.
 * La coincidencia exacta tiene prioridad; si no hay ninguna, devuelve
 * el fallback "Panel Administrativo".
 */
function resolvePageTitle(pathname: string): string {
  // Coincidencia exacta primero
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Coincidencia por prefijo más largo (para subrutas dinámicas futuras)
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key) && key !== "/admin/dashboard")
    .sort((a, b) => b.length - a.length)[0];

  return match ? PAGE_TITLES[match] : "Panel Administrativo";
}

/* ─── Avatar initials helper ────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Menú de perfil ─────────────────────────────────────────────── */

interface ProfileMenuProps {
  onClose: () => void;
}

function ProfileMenu({ onClose }: ProfileMenuProps) {
  const router = useRouter();

  const handleLogout = () => {
    onClose();
    // TODO: invalidar sesión cuando exista auth real
    router.push("/admin");
  };

  return (
    <div className={styles.profileMenu} role="menu">
      {/* Info del usuario */}
      <div className={styles.profileMenuHeader}>
        <span className={styles.profileMenuName}>Coragem Admin</span>
        <span className={styles.profileMenuEmail}>admin@coragem.co</span>
      </div>

      <div className={styles.profileMenuDivider} />

      {/* Acciones — placeholders */}
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
        { /* <span aria-hidden="true">←</span>  */}
        Cerrar sesión
      </button>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────── */

/* ─── Component ──────────────────────────────────────────────────── */

interface AdminTopbarProps {
  /** Nombre del usuario autenticado — en el futuro vendrá del contexto de sesión */
  userName?: string;
}

export function AdminTopbar({ userName = "Coragem Admin" }: AdminTopbarProps) {
  const pathname = usePathname();
  const pageTitle = resolvePageTitle(pathname);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const btnRef   = useRef<HTMLButtonElement>(null);

  /* Cerrar al hacer click fuera */
  useEffect(() => {
    if (!menuOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current  && !menuRef.current.contains(e.target as Node) &&
        btnRef.current   && !btnRef.current.contains(e.target as Node)
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
    <header className={styles.topbar}>
      {/* Extremo izquierdo — título de la página activa */}
      <h1 className={styles.topbarTitle}>{pageTitle}</h1>

      {/* Extremo derecho — avatar / perfil */}
      <div className={styles.topbarRight}>
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