"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import type { StockFilter, ProductRow, ProductModalState } from "@/types/admin";
import { StatsCards }       from "@/components/admin/dashboard/StatsCards";
import { ProductsTable }    from "@/components/admin/dashboard/ProductsTable";
import { ProductFormModal } from "@/components/admin/dashboard/ProductFormModal";
import { useDashboardSearch, useDashboardActions } from "@/components/admin/layout/AdminShell";
import { computeStats, filterProductRows } from "@/lib/dashboard";
import { useProducts } from "@/hooks/shared/useProducts";
import styles from "./css/DashboardPage.module.css";
import { api } from "@/lib/api";

async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

export default function DashboardPage() {
  const { searchQuery }              = useDashboardSearch();
  const { registerNewProductAction } = useDashboardActions();

  // ── Datos reales desde la API ──────────────────────────────────
  const { products: allProducts, loading, error, refetch } = useProducts();

  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [modalState,  setModalState]  = useState<ProductModalState>({
    isOpen: false, product: null,
  });

  /* ── Handlers del modal ── */
  const openNewModal  = useCallback(() => setModalState({ isOpen: true,  product: null }), []);
  const openEditModal = useCallback((product: ProductRow) => setModalState({ isOpen: true, product }), []);
  const closeModal    = useCallback(() => setModalState((prev) => ({ ...prev, isOpen: false })), []);

  useEffect(() => {
    registerNewProductAction(openNewModal);
  }, [registerNewProductAction, openNewModal]);

  /* ── Filtros ── */
  const handleStockFilter = useCallback((next: StockFilter) => {
    setStockFilter((prev) => (prev === next ? "all" : next));
  }, []);

  const stats = useMemo(() => computeStats(allProducts), [allProducts]);

  const filteredRows = useMemo(() => {
    const bySearch = filterProductRows(allProducts, searchQuery);
    if (stockFilter === "all") return bySearch;
    return bySearch.filter((p) => p.stockStatus === stockFilter);
  }, [allProducts, searchQuery, stockFilter]);

  /* ── Callback post-guardado ── */
  const handleSaved = useCallback((mode: "new" | "edit") => {
    refetch();
  }, []);

  /* ── Eliminar con confirmación ── */
  const handleDelete = useCallback(async (product: ProductRow) => {
    const Swal = await getSwal();
    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar producto?",
      html:  `<span style="color:#94a3b8">Se eliminará permanentemente <strong style="color:#e2e8f0">${product.name}</strong>.</span>`,
      icon:  "warning",
      showCancelButton:   true,
      confirmButtonText:  "Sí, eliminar",
      cancelButtonText:   "Cancelar",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      background:         "#111827",
      color:              "#e2e8f0",
    });

    if (!isConfirmed) return;

    const { error } = await api.delete(`/api/admin/products/${product.id}`);

    if (error) {
      await Swal.fire({
        title: "Error al eliminar",
        text:  error,
        icon:  "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        background:         "#111827",
        color:              "#e2e8f0",
      });
      return;
    }

    refetch();

    await Swal.fire({
      title: "Producto eliminado",
      text:  `${product.name} ha sido eliminado del catalogo.`,
      icon:  "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#4ec4c4",
      background:         "#111827",
      color:              "#e2e8f0",
    });
  }, [refetch]);

  // ── Loading / error del dashboard ─────────────────────────────
  if (loading) return (
    <div className={styles.root} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
      <span style={{ color: "var(--admin-text-muted)", fontFamily: "var(--font-jost), sans-serif", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
        Cargando productos…
      </span>
    </div>
  );

  if (error) return (
    <div className={styles.root} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
      <span style={{ color: "var(--admin-danger)", fontFamily: "var(--font-jost), sans-serif", fontSize: "0.85rem" }}>
        {error}
      </span>
    </div>
  );

  return (
    <>
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
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      </div>

      <ProductFormModal
        isOpen={modalState.isOpen}
        product={modalState.product}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </>
  );
}