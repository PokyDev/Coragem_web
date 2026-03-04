"use client";

/**
 * src/components/admin/layout/AdminFloatingControls.tsx
 *
 * Controles flotantes globales del panel administrativo.
 * Se renderiza dentro de AdminThemeProvider, por lo que aparece
 * en TODAS las rutas /admin/* sin necesidad de incluirlo por página.
 *
 * Por ahora expone únicamente el ThemeToggle (variant="admin").
 * Cuando el dashboard y sus layouts propios estén implementados,
 * este componente se puede enriquecer con más controles (ej. notificaciones).
 *
 * Posición: fixed, esquina inferior derecha — simétrico al sitio público
 * que usa la esquina inferior izquierda para FloatingControls.
 */

import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";

export function AdminFloatingControls() {
  return (
    <div
      aria-label="Controles del panel administrativo"
      style={{
        position: "fixed",
        bottom: "1.25rem",
        right: "1.25rem",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
      }}
    >
      <ThemeToggle variant="admin" size="2.75rem" />
    </div>
  );
}