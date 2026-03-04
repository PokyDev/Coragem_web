import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriesPage() {
  return (
    <DevelopmentState
      icon="◎"
      title="Categorías"
      description="Administra las categorías del catálogo: Earcuff, Anillo, Dije, Cadena, Topos, Candongas y Conjuntos."
    />
  );
}