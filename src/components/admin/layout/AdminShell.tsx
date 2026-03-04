"use client";

/**
 * src/components/admin/layout/AdminShell.tsx
 *
 * Layout principal del panel administrativo.
 * Compuesto por:
 *   - AdminSidebar: navegación izquierda con las secciones del panel.
 *   - AdminTopbar: barra superior con avatar / menú de perfil.
 *   - Slot de contenido: children de la página activa.
 *
 * Se renderiza en app/(admin)/admin/dashboard/layout.tsx y demás
 * subrutas del panel que requieran este chrome.
 *
 * Estilos: AdminShell.module.css
 */

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminTopbar }  from "@/components/admin/layout/AdminTopbar";
import styles from "@/components/admin/css/AdminShell.module.css";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />
      <div className={styles.body}>
        <AdminTopbar />
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}