import type { Metadata } from "next";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";

export const metadata: Metadata = { title: "Configuración" };

export default function SettingsPage() {
  return (
    <DevelopmentState
      icon="⊙"
      title="Configuración"
      description="Ajusta las preferencias del panel: datos del negocio, credenciales y opciones de seguridad."
    />
  );
}