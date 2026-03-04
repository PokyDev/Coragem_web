import type { Metadata } from "next";
import { AdminThemeProvider } from "@/components/admin/layout/AdminThemeProvider";

export const metadata: Metadata = {
  title: {
    template: "%s — Coragem Admin",
    default: "Panel Administrativo — Coragem",
  },
  robots: { index: false, follow: false },
};

/**
 * AdminLayout (Server Component)
 *
 * - NO hereda Navbar, Footer ni FloatingControls del sitio público.
 * - El tema (dark/light) es independiente del sitio público y se
 *   gestiona mediante useAdminTheme (localStorage + data-admin-theme).
 * - AdminThemeProvider es el Client Component que aplica el atributo
 *   al wrapper .admin, manteniendo este layout como Server Component.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}