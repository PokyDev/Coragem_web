"use client";

/**
 * src/components/layout/SlideMenu/SlideMenu.tsx
 *
 * Componente genérico de menú deslizante lateral.
 * Usado por MobileMenu (sitio público) y AdminMobileMenu (panel admin).
 *
 * Responsabilidades:
 *   - Backdrop con fade + bloqueo de scroll del body.
 *   - Panel lateral con slide-in/out desde la derecha.
 *   - NO conoce los links ni el contenido: lo recibe via slots (props).
 *
 * Props de estilo:
 *   - variant "public" | "admin" → tokens CSS del tema correspondiente.
 *   - header / nav / footer      → slots de contenido React.
 */

import { useEffect } from "react";
import styles from "./SlideMenu.module.css";

export type SlideMenuVariant = "public" | "admin";

interface SlideMenuProps {
  isOpen:     boolean;
  onClose:    () => void;
  variant?:   SlideMenuVariant;
  header:     React.ReactNode;
  nav:        React.ReactNode;
  footer?:    React.ReactNode;
  ariaLabel?: string;
}

export function SlideMenu({
  isOpen,
  onClose,
  variant = "public",
  header,
  nav,
  footer,
  ariaLabel = "Menú de navegación",
}: SlideMenuProps) {
  /* Bloquear scroll del body mientras el panel está abierto */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={[
          styles.backdrop,
          styles[`backdrop--${variant}`],
          isOpen ? styles.backdropOpen : "",
        ].join(" ")}
      />

      {/* ── Panel lateral ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={[
          styles.panel,
          styles[`panel--${variant}`],
          isOpen ? styles.panelOpen : "",
        ].join(" ")}
      >
        {/* Header slot */}
        <div className={[styles.panelHeader, styles[`panelHeader--${variant}`]].join(" ")}>
          {header}
        </div>

        {/* Nav slot */}
        <nav className={styles.panelNav} aria-label={ariaLabel}>
          {nav}
        </nav>

        {/* Footer slot */}
        {footer && (
          <div className={[styles.panelFooter, styles[`panelFooter--${variant}`]].join(" ")}>
            {footer}
          </div>
        )}
      </aside>
    </>
  );
}