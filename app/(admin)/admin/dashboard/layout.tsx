import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/layout/AdminShell";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * app/(admin)/admin/dashboard/layout.tsx
 *
 * Layout de las rutas del dashboard.
 * Envuelve todas las páginas bajo /admin/dashboard/* con el
 * chrome del panel: sidebar de navegación + topbar con avatar.
 *
 * AdminShell es un Client Component (necesita usePathname para
 * el estado activo del sidebar), por lo que este layout puede
 * seguir siendo un Server Component sin problemas.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}