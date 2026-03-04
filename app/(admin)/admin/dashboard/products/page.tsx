import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage() {
  return (
    <DevelopmentState
      icon="◈"
      title="Productos"
      description="Crea, edita y elimina los productos del catálogo. Controla nombre, precio, categoría e imágenes desde aquí."
    />
  );
}