"use client";

/**
 * app/(admin)/admin/dashboard/page.tsx
 *
 * Orquesta el dashboard: búsqueda (topbar) + filtro por estado (StatsCards)
 * + tabla de productos.
 *
 * Estado local:
 *   stockFilter — "all" | "ok" | "low" | "out"
 *     Controlado por las StatsCards (click para activar/desactivar).
 *     Se combina con la búsqueda del topbar antes de pasarlo a la tabla.
 */

import { useMemo, useState, useCallback } from "react";
import type { StockFilter }           from "@/types/admin";
import { StatsCards }             from "@/components/admin/dashboard/StatsCards";
import { ProductsTable }          from "@/components/admin/dashboard/ProductsTable";
import { useDashboardSearch }     from "@/components/admin/layout/AdminShell";
import { computeStats, filterProductRows } from "@/lib/dashboard";
import products from "@/data/products.json";
import styles   from "./css/DashboardPage.module.css";

export default function DashboardPage() {
  const { searchQuery } = useDashboardSearch();
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  /* Toggle: click en la misma tarjeta activa → deselecciona */
  const handleStockFilter = useCallback((next: StockFilter) => {
    setStockFilter((prev) => (prev === next ? "all" : next));
  }, []);

  /* Stats: siempre sobre el total completo */
  const stats = useMemo(() => computeStats(products), []);

  /* Filas: búsqueda + filtro de estado */
  const filteredRows = useMemo(() => {
    const bySearch = filterProductRows(products, searchQuery);
    if (stockFilter === "all") return bySearch;
    return bySearch.filter((p) => p.stockStatus === stockFilter);
  }, [searchQuery, stockFilter]);

  return (
    <div className={styles.root}>
      <StatsCards
        stats={stats}
        activeFilter={stockFilter}
        onFilterChange={handleStockFilter}
      />
      <ProductsTable
        products={filteredRows}
        searchQuery={searchQuery}
        stockFilter={stockFilter}
      />
    </div>
  );
}