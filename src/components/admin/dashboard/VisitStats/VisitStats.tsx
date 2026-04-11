"use client";

/**
 * src/components/admin/dashboard/VisitStats/VisitStats.tsx
 *
 * Widget de métricas de visitas al sitio público.
 * Muestra:
 *   - Badge de usuarios activos en tiempo real
 *   - Toggle Diario / Semanal / Mensual
 *   - Gráfica de área (recharts, cargado dinámicamente para evitar SSR)
 */

import { useState }  from "react";
import dynamic        from "next/dynamic";
import type { VisitStats as VisitStatsData, VisitRange } from "@/hooks/admin/dashboard/useVisitStats";
import styles from "./VisitStats.module.css";

/*
 * VisitChart usa APIs de browser (window.ResizeObserver vía recharts).
 * Con ssr: false evitamos el error de hidratación en Next.js App Router.
 */
const VisitChart = dynamic(
  () => import("./VisitChart").then((m) => m.VisitChart),
  { ssr: false, loading: () => <div style={{ height: "180px" }} /> }
);

/* ── Opciones de rango ──────────────────────────────────────────── */

const RANGE_OPTIONS: { key: VisitRange; label: string }[] = [
  { key: "daily",   label: "Diario"   },
  { key: "weekly",  label: "Semanal"  },
  { key: "monthly", label: "Mensual"  },
];

/* ── Skeleton ───────────────────────────────────────────────────── */

function VisitStatsSkeleton() {
  return <div className={styles.skeleton} />;
}

/* ── Props ──────────────────────────────────────────────────────── */

interface VisitStatsProps {
  stats:   VisitStatsData | null;
  loading: boolean;
}

/* ── Component ──────────────────────────────────────────────────── */

export function VisitStats({ stats, loading }: VisitStatsProps) {
  const [range, setRange] = useState<VisitRange>("daily");

  const chartData = stats?.[range] ?? [];

  return (
    <section className={styles.section} aria-label="Métricas de visitas al sitio">
      <div className={styles.header}>
        <h2 className={styles.sectionTitle}>Visitas al sitio</h2>
        {stats && (
          <div className={styles.onlineBadge} aria-label={`${stats.currentOnline} usuarios activos`}>
            <span className={styles.onlineDot} aria-hidden="true" />
            {stats.currentOnline} activos ahora
          </div>
        )}
      </div>

      {loading ? (
        <VisitStatsSkeleton />
      ) : (
        <div className={styles.card}>
          {/* Toggle de rango */}
          <div className={styles.rangeToggle} role="group" aria-label="Seleccionar rango de tiempo">
            {RANGE_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`${styles.rangeBtn} ${range === key ? styles.rangeBtnActive : ""}`}
                onClick={() => setRange(key)}
                aria-pressed={range === key}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Gráfica */}
          <div className={styles.chartWrap}>
            <VisitChart data={chartData} />
          </div>
        </div>
      )}
    </section>
  );
}