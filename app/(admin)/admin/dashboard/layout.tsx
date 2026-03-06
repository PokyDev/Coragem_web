import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { AdminGuard } from "@/components/admin/layout/AdminGuard";

export const metadata: Metadata = {
  title: "Dashboard",
};

/**
 * app/(admin)/admin/dashboard/layout.tsx
 *
 * AdminGuard verifica GET /api/auth/me en el cliente antes de
 * renderizar el shell. Si no hay sesión redirige a /admin.
 * La ruta /admin (login) queda siempre accesible.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}