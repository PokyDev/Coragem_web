import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Imágenes" };

export default function ImagesPage() {
  return (
    <DevelopmentState
      icon="⊞"
      title="Imágenes"
      description="Sube, reordena y edita las imágenes de cada producto. El editor visual permite recortar y ajustar encuadres antes de publicar."
    />
  );
}