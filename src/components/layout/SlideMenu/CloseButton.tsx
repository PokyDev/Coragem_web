"use client";

/**
 * src/components/layout/SlideMenu/CloseButton.tsx
 *
 * Botón de cierre reutilizable para los panels de SlideMenu.
 * Usa tokens de la variante correspondiente (public / admin).
 */

import styles from "./CloseButton.module.css";

interface CloseButtonProps {
  onClose:  () => void;
  variant?: "public" | "admin";
}

export function CloseButton({ onClose, variant = "public" }: CloseButtonProps) {
  return (
    <button
      onClick={onClose}
      aria-label="Cerrar menú"
      type="button"
      className={[styles.btn, styles[`btn--${variant}`]].join(" ")}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="18" y1="6"  x2="6"  y2="18" />
        <line x1="6"  y1="6"  x2="18" y2="18" />
      </svg>
    </button>
  );
}