"use client";

/**
 * src/components/admin/layout/AdminSidebar.tsx
 *
 * Barra de navegación lateral del panel administrativo.
 *
 * - Marca en la cabecera.
 * - Ítems de navegación agrupados por sección.
 * - Resalta el ítem activo mediante usePathname().
 * - Botón de cierre de sesión en el footer (placeholder por ahora).
 *
 * Estilos: AdminShell.module.css (clases compartidas del shell).
 */

import Link      from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/components/admin/css/AdminShell.module.css";

/* ─── Estructura de la navegación ───────────────────────────────── */

interface NavItem {
  href:  string;
  label: string;
  icon:  string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV: NavSection[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin/dashboard",          label: "Dashboard",   icon: "▦" },
      { href: "/admin/dashboard/products", label: "Productos",   icon: "◈" },
      { href: "/admin/dashboard/inventory",label: "Inventario",  icon: "≡" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/dashboard/images",     label: "Imágenes",   icon: "⊞" },
      { href: "/admin/dashboard/categories", label: "Categorías", icon: "◎" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/dashboard/settings", label: "Configuración", icon: "⊙" },
    ],
  },
];

/* ─── Component ──────────────────────────────────────────────────── */

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const handleLogout = () => {
    // TODO: invalidar sesión cuando exista auth real
    router.push("/admin");
  };

  const isActive = (href: string) => {
    // Dashboard raíz: coincidencia exacta
    if (href === "/admin/dashboard") return pathname === href;
    // Subrutas: prefijo
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>

      {/* ── Header — marca ── */}
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarBrand}>
          CORA<span>GEM</span>
        </span>
        <span className={styles.sidebarRole}>Panel Administrativo</span>
      </div>

      {/* ── Navegación ── */}
      <nav className={styles.sidebarNav} aria-label="Navegación del panel">
        {NAV.map((section) => (
          <div key={section.label}>
            <span className={styles.navSectionLabel}>{section.label}</span>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  styles.navItem,
                  isActive(item.href) ? styles.navItemActive : "",
                ].join(" ").trim()}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer — cerrar sesión ── */}
      <div className={styles.sidebarFooter}>
        <button
          onClick={handleLogout}
          className={styles.navItemLogout}
          type="button"
          aria-label="Cerrar sesión"
        >
          { /* <span className={styles.navIcon} aria-hidden="true">←</span> */}
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}