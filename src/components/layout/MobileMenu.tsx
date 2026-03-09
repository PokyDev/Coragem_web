"use client";

/**
 * src/components/layout/MobileMenu.tsx
 *
 * Menú móvil del sitio público.
 * Wrapper fino sobre SlideMenu — define los slots de contenido
 * con los tokens y componentes del sitio público.
 */

import { NavLink }    from "@/components/layout/NavLink";
import { BrandIcon }  from "@/components/layout/ui/BrandIcon";
import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";
import { SlideMenu }  from "@/components/layout/SlideMenu/SlideMenu";
import { CloseButton } from "@/components/layout/SlideMenu/CloseButton";
import styles from "./MobileMenu.module.css";

const NAV_LINKS = [
  { href: "/",         label: "Inicio"    },
  { href: "/products", label: "Productos" },
  { href: "/contact",  label: "Contacto"  },
] as const;

interface MobileMenuProps {
  isOpen:  boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  /* ── Header slot ── */
  const header = (
    <div className={styles.header}>
      <span className={styles.headerTitle}>Menú</span>
      <CloseButton onClose={onClose} variant="public" />
    </div>
  );

  /* ── Nav slot ── */
  const nav = (
    <>
      {NAV_LINKS.map((link, i) => (
        <div
          key={link.href}
          onClick={onClose}
          style={{
            opacity:    isOpen ? 1 : 0,
            transform:  isOpen ? "translateX(0)" : "translateX(20px)",
            transition: `opacity 0.35s ease ${0.08 + i * 0.06}s, transform 0.35s ease ${0.08 + i * 0.06}s`,
          }}
        >
          <NavLink href={link.href} label={link.label} mobile />
        </div>
      ))}
    </>
  );

  /* ── Footer slot ── */
  const footer = (
    <div className={styles.footer}>
      <div className={styles.footerRow}>
        <BrandIcon size={44} />
        <ThemeToggle />
      </div>
      <div className={styles.footerDivider} />
      <p className={styles.footerLabel}>Bisutería en Rodio</p>
    </div>
  );

  return (
    <SlideMenu
      isOpen={isOpen}
      onClose={onClose}
      variant="public"
      header={header}
      nav={nav}
      footer={footer}
      ariaLabel="Menú de navegación principal"
    />
  );
}