"use client";

/**
 * app/(admin)/admin/dashboard/page.tsx
 *
 * Página principal del dashboard administrativo.
 *
 * Consume el contexto de búsqueda expuesto por AdminShell
 * (vía useDashboardSearch) para filtrar la tabla de productos
 * en tiempo real a medida que el usuario escribe en el topbar.
 *
 * Layout:
 *   ┌──────────────────────────────────────────┐
 *   │  [StatsCards × 4]                        │
 *   ├──────────────────────────────────────────┤
 *   │  [ProductsTable con scroll interno]      │  ← crece para ocupar el espacio restante
 *   └──────────────────────────────────────────┘
 *
 * El main del AdminShell tiene overflow-y: auto, pero la tabla
 * gestiona su propio scroll interno para que la página en sí no scrollee.
 */

import { useMemo }            from "react";
import type { Metadata }      from "next";
import { StatsCards }         from "@/components/admin/dashboard/StatsCards";
import { ProductsTable }      from "@/components/admin/dashboard/ProductsTable";
import { useDashboardSearch } from "@/components/admin/layout/AdminShell";
import { computeStats, filterProductRows } from "@/lib/dashboard";
import products from "@/data/products.json";
import styles   from "./css/DashboardPage.module.css";

export default function DashboardPage() {
  const { searchQuery } = useDashboardSearch();

  /* Stats: siempre sobre el total completo, sin filtrar */
  const stats = useMemo(() => computeStats(products), []);

  /* Filas filtradas por la búsqueda del topbar */
  const filteredRows = useMemo(
    () => filterProductRows(products, searchQuery),
    [searchQuery]
  );

  return (
    <div className={styles.root}>
      {/* ── Tarjetas de estadísticas ── */}
      <StatsCards stats={stats} />

      {/* ── Tabla de productos ── */}
      <ProductsTable products={filteredRows} searchQuery={searchQuery} />
    </div>
  );
}