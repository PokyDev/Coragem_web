"use client";

/**
 * src/components/admin/layout/AdminSidebar.tsx
 */

import Link         from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLogout } from "@/hooks/admin/auth/useAdminLogout";
import styles from "./AdminShell.module.css";
import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";

interface NavItem    { href: string; label: string; icon: string; }
interface NavSection { label: string; items: NavItem[]; }

const NAV: NavSection[] = [
  {
    label: "Principal",
    items: [
      { href: "/admin/dashboard",           label: "Dashboard",    icon: "▦" },
      { href: "/admin/dashboard/products",  label: "Productos",    icon: "◈" },
      { href: "/admin/dashboard/inventory", label: "Inventario",   icon: "≡" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/admin/dashboard/images",     label: "Imágenes",    icon: "⊞" },
      { href: "/admin/dashboard/categories", label: "Categorías",  icon: "◎" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/dashboard/settings", label: "Configuración", icon: "⊙" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout   = useAdminLogout();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className={styles.sidebar}>

      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarBrand}>
          CORA<span>GEM</span>
        </span>
        <span className={styles.sidebarRole}>Panel Administrativo</span>
      </div>

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
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <ThemeToggle variant="admin" size="2.25rem" />
        <button
          onClick={logout}
          className={styles.navItemLogout}
          type="button"
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}