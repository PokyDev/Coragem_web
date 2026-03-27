"use client";

/**
 * src/components/admin/layout/AdminMobileMenu.tsx
 *
 * Menú móvil del panel administrativo.
 * Wrapper sobre SlideMenu con los nav items del admin,
 * paleta Slate Command y botón de cierre de sesión en el footer.
 *
 * Se renderiza en AdminShell cuando viewport <= 1100px.
 * Comparte la misma estructura de SlideMenu que el MobileMenu público
 * pero con tokens, tipografía y estilo propios del design system admin.
 */

import Link            from "next/link";
import { usePathname } from "next/navigation";
import { useAdminLogout }  from "@/hooks/admin/useAdminLogout";
import { SlideMenu }       from "@/components/layout/SlideMenu/SlideMenu";
import { CloseButton }     from "@/components/layout/SlideMenu/CloseButton";
import { ThemeToggle }     from "@/components/layout/ui/ThemeToggle";
import styles from "./AdminMobileMenu.module.css";

/* ─── Datos de navegación (misma estructura que AdminSidebar) ────── */

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

/* ─── Props ──────────────────────────────────────────────────────── */

interface AdminMobileMenuProps {
  isOpen:  boolean;
  onClose: () => void;
}

/* ─── Component ──────────────────────────────────────────────────── */

export function AdminMobileMenu({ isOpen, onClose }: AdminMobileMenuProps) {
  const pathname = usePathname();
  const logout   = useAdminLogout();

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  /* ── Header slot ── */
  const header = (
    <div className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.brandName}>
          CORA<span className={styles.brandAccent}>GEM</span>
        </span>
        <span className={styles.brandRole}>Panel Admin</span>
      </div>
      <CloseButton onClose={onClose} variant="admin" />
    </div>
  );

  /* ── Nav slot ── */
  const nav = (
    <>
      {NAV.map((section, si) => (
        <div key={section.label} className={styles.navSection}>
          <span className={styles.navSectionLabel}>{section.label}</span>

          {section.items.map((item, i) => {
            const active = isActive(item.href);
            /* Delay escalonado para la animación de entrada */
            const delay  = 0.06 + (si * 3 + i) * 0.045;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={[
                  styles.navItem,
                  active ? styles.navItemActive : "",
                ].join(" ")}
                style={{
                  opacity:    isOpen ? 1 : 0,
                  transform:  isOpen ? "translateX(0)" : "translateX(20px)",
                  transition: `opacity 0.32s ease ${delay}s, transform 0.32s ease ${delay}s`,
                }}
              >
                <span className={styles.navIcon} aria-hidden="true">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );

  /* ── Footer slot ── */
  const footer = (
    <div className={styles.footer}>
      <div className={styles.footerRow}>
        <ThemeToggle variant="admin" size="2.25rem" />
        <button
          onClick={() => { onClose(); logout(); }}
          className={styles.logoutBtn}
          type="button"
        >
          <span className={styles.logoutIcon} aria-hidden="true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <SlideMenu
      isOpen={isOpen}
      onClose={onClose}
      variant="admin"
      header={header}
      nav={nav}
      footer={footer}
      ariaLabel="Menú de navegación del panel administrativo"
    />
  );
}