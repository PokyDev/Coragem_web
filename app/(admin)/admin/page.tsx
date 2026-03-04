import type { Metadata } from "next";
import { AdminLoginCard } from "@/components/admin/auth/AdminLoginCard";

/* ─── SEO ────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Acceso Administrativo — Coragem",
  description: "Panel de administración de Coragem Accessories.",
  robots: { index: false, follow: false },
};

/* ─── Page ───────────────────────────────────────────────────────── */
export default function AdminPage() {
  return <AdminLoginCard />;
}