"use client";

/**
 * src/components/admin/dashboard/StatsCards.tsx
 *
 * Cuatro tarjetas de estadísticas: Total, Con Stock, Stock Bajo, Sin Stock.
 * Los valores se calculan a partir de los productos que recibe como prop.
 * Usa los tokens semáforo de Slate Command.
 */

import type { DashboardStats } from "@/types/admin";
import styles from "@/components/admin/css/StatsCards.module.css";

interface StatCardProps {
  label:   string;
  value:   number;
  variant: "neutral" | "ok" | "low" | "out";
  icon:    React.ReactNode;
}

function StatCard({ label, value, variant, icon }: StatCardProps) {
  return (
    <div className={`${styles.card} ${styles[variant]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <span className={styles.cardIcon} aria-hidden="true">{icon}</span>
      </div>
      <div className={styles.cardValue}>{value}</div>
      <div className={`${styles.cardBar} ${styles[`bar_${variant}`]}`} />
    </div>
  );
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className={styles.grid}>
      <StatCard
        label="Total Productos"
        value={stats.total}
        variant="neutral"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        }
      />
      <StatCard
        label="Con Stock"
        value={stats.inStock}
        variant="ok"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      />
      <StatCard
        label="Stock Bajo"
        value={stats.lowStock}
        variant="low"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />
      <StatCard
        label="Sin Stock"
        value={stats.outStock}
        variant="out"
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        }
      />
    </div>
  );
}