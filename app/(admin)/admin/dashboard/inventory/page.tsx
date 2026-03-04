import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Inventario" };

export default function InventoryPage() {
  return (
    <DevelopmentState
      icon="≡"
      title="Inventario"
      description="Consulta y actualiza el stock de cada producto. Los artículos con stock en cero se ocultarán automáticamente del catálogo público."
    />
  );
}