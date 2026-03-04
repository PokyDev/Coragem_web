import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <DevelopmentState
      icon="▦"
      title="Dashboard"
      description="Aquí verás un resumen del negocio: estadísticas de productos, niveles de stock y actividad reciente."
    />
  );
}