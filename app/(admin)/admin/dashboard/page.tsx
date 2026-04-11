"use client";

/**
 * app/(admin)/admin/dashboard/page.tsx
 *
 * Dashboard principal del panel administrativo.
 * Muestra tres widgets:
 *   1. TopProducts  — 5 productos más vendidos
 *   2. VisitStats   — gráfica de visitas con toggle diario/semanal/mensual
 *   3. QRSection    — QR del sitio con descarga PNG
 *
 * Los datos se obtienen de hooks con mocks por ahora.
 * Ver cada hook para instrucciones de integración con el backend.
 */

import { TopProducts } from "@/components/admin/dashboard/TopProducts/TopProducts";
import { VisitStats }  from "@/components/admin/dashboard/VisitStats/VisitStats";
import { QRSection }   from "@/components/admin/dashboard/QRSection/QRSection";
import { useTopProducts } from "@/hooks/admin/dashboard/useTopProducts";
import { useVisitStats }  from "@/hooks/admin/dashboard/useVisitStats";
import styles from "./css/DashboardPage.module.css";

export default function DashboardPage() {
  const { products, loading: loadingProducts } = useTopProducts();
  const { stats,    loading: loadingStats }    = useVisitStats();

  return (
    <div className={styles.root}>
      {/* ── Top 5 productos más vendidos ── */}
      <TopProducts products={products} loading={loadingProducts} />

      {/* ── Fila inferior: visitas + QR ── */}
      <div className={styles.bottomRow}>
        <VisitStats stats={stats} loading={loadingStats} />
        <QRSection />
      </div>
    </div>
  );
}