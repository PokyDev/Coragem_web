"use client";

/**
 * src/components/admin/shared/StatsCards.tsx
 *
 * Tarjetas de estadísticas de inventario reutilizables.
 * Usadas en DashboardPage y ProductsPage.
 *
 * Comportamiento:
 *   - Click en una tarjeta de estado (ok/low/out) → activa el filtro.
 *   - Click en la misma tarjeta activa → deselecciona (vuelve a "all").
 *   - Click en "Total" → siempre limpia el filtro.
 *   - Un checkbox en la esquina superior derecha indica el estado seleccionado.
 *   - La tarjeta "Total" no tiene checkbox (no es un filtro de estado).
 */

import type { DashboardStats, StockFilter } from "@/types/admin";
import styles from "./StatsCards.module.css";

/* ─── Checkbox visual ────────────────────────────────────────────── */

function CardCheckbox({ checked }: { checked: boolean }) {
  return (
    <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ""}`} aria-hidden="true">
      {checked && (
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="1.5 5 4 7.5 8.5 2" />
        </svg>
      )}
    </span>
  );
}

/* ─── Stat Card ──────────────────────────────────────────────────── */

interface StatCardProps {
  label:        string;
  value:        number;
  variant:      "neutral" | "ok" | "low" | "out";
  icon:         React.ReactNode;
  isActive?:    boolean;
  isFiltering?: boolean;
  hasFilter?:   boolean;
  onClick?:     () => void;
}

function StatCard({
  label,
  value,
  variant,
  icon,
  isActive    = false,
  isFiltering = false,
  hasFilter   = true,
  onClick,
}: StatCardProps) {
  const dimmed = isFiltering && !isActive;

  return (
    <button
      className={[
        styles.card,
        styles[variant],
        isActive  ? styles.cardActive   : "",
        dimmed    ? styles.cardDimmed   : "",
        onClick   ? styles.cardClickable : "",
      ].filter(Boolean).join(" ")}
      onClick={onClick}
      type="button"
      aria-pressed={hasFilter ? isActive : undefined}
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>{label}</span>
        <div className={styles.cardHeaderRight}>
          <span className={styles.cardIcon} aria-hidden="true">{icon}</span>
          {hasFilter && <CardCheckbox checked={isActive} />}
        </div>
      </div>
      <div className={styles.cardValue}>{value}</div>
      <div className={`${styles.cardBar} ${styles[`bar_${variant}`]}`} />
    </button>
  );
}

/* ─── Grid ───────────────────────────────────────────────────────── */

export interface StatsCardsProps {
  stats:          DashboardStats;
  activeFilter:   StockFilter;
  onFilterChange: (filter: StockFilter) => void;
}

export function StatsCards({ stats, activeFilter, onFilterChange }: StatsCardsProps) {
  const isFiltering = activeFilter !== "all";

  return (
    <div className={styles.grid}>
      {/* Total — limpia el filtro, sin checkbox */}
      <StatCard
        label="Total Productos"
        value={stats.total}
        variant="neutral"
        hasFilter={false}
        isActive={false}
        isFiltering={false}
        onClick={() => onFilterChange("all")}
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        }
      />

      {/* Con Stock */}
      <StatCard
        label="Con Stock"
        value={stats.inStock}
        variant="ok"
        isActive={activeFilter === "ok"}
        isFiltering={isFiltering}
        onClick={() => onFilterChange("ok")}
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        }
      />

      {/* Stock Bajo */}
      <StatCard
        label="Stock Bajo"
        value={stats.lowStock}
        variant="low"
        isActive={activeFilter === "low"}
        isFiltering={isFiltering}
        onClick={() => onFilterChange("low")}
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        }
      />

      {/* Sin Stock */}
      <StatCard
        label="Sin Stock"
        value={stats.outStock}
        variant="out"
        isActive={activeFilter === "out"}
        isFiltering={isFiltering}
        onClick={() => onFilterChange("out")}
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