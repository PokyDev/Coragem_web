import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s — Coragem Admin",
    default: "Panel Administrativo — Coragem",
  },
  robots: { index: false, follow: false },
};

/**
 * AdminLayout
 *
 * - NO hereda Navbar, Footer ni FloatingControls del sitio público.
 * - Siempre renderiza en dark mode mediante la clase `.admin`.
 * - La clase `.admin` sobreescribe las variables CSS del tema público,
 *   scoped al árbol de admin (ver globals.css sección .admin).
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin">
      {children}
    </div>
  );
}