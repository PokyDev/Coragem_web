"use client";

/**
 * app/(admin)/admin/dashboard/products/page.tsx
 *
 * Pestaña Productos del panel administrativo.
 *
 * Muestra todos los productos como tarjetas verticales con imagen grande,
 * info del producto y controles de movimiento de inventario (Compra / Venta — WIP).
 * Incluye las mismas StatsCards del dashboard para filtrar por estado de stock.
 *
 * Integra las mismas acciones de CRUD que el Dashboard:
 *   · Crear    — botón "+ Nuevo Producto" en el AdminTopbar
 *   · Editar   — botón en cada ProductCard → abre ProductFormModal
 *   · Eliminar — botón en cada ProductCard → confirmación SweetAlert2
 */

import { useMemo, useState, useCallback, useEffect } from "react";
import type { StockFilter, ProductRow, ProductModalState } from "@/types/admin";
import { StatsCards }       from "@/components/admin/shared/StatsCards";
import { ProductCard }      from "@/components/admin/products/ProductCard";
import { ProductFormModal } from "@/components/admin/dashboard/ProductFormModal";
import {
  useDashboardSearch,
  useDashboardActions,
} from "@/components/admin/layout/AdminShell";
import { computeStats, filterProductRows } from "@/lib/dashboard";
import { useProducts }  from "@/hooks/shared/useProducts";
import { api }          from "@/lib/api";
import styles from "./css/ProductsPage.module.css";

async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

export default function ProductsPage() {
  const { searchQuery }              = useDashboardSearch();
  const { registerNewProductAction } = useDashboardActions();

  const { products: allProducts, loading, error, refetch } = useProducts({ adminMode: true });

  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [modalState,  setModalState]  = useState<ProductModalState>({
    isOpen: false, product: null,
  });

  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});

  // Actualizar stock en memoria sin refetch global
  const handleStockChange = useCallback((productId: string, newStock: number) => {
    setStockOverrides((prev) => ({ ...prev, [productId]: newStock }));
  }, []);

  /* ── Modal handlers ── */
  const openNewModal  = useCallback(() => setModalState({ isOpen: true, product: null }), []);
  const openEditModal = useCallback((product: ProductRow) => setModalState({ isOpen: true, product }), []);
  const closeModal    = useCallback(() => setModalState((prev) => ({ ...prev, isOpen: false })), []);

  useEffect(() => {
    registerNewProductAction(openNewModal);
  }, [registerNewProductAction, openNewModal]);

  /* ── Filtro de stock (toggle: mismo valor → vuelve a "all") ── */
  const handleStockFilter = useCallback((next: StockFilter) => {
    setStockFilter((prev) => (prev === next ? "all" : next));
  }, []);

  const mergedProducts = useMemo(() =>
    allProducts.map((p) =>
      stockOverrides[p.id] !== undefined
        ? { ...p, stock: stockOverrides[p.id] }
        : p
    ),
  [allProducts, stockOverrides]);

  const stats = useMemo(() => computeStats(mergedProducts), [mergedProducts]);

  const filteredRows = useMemo(() => {
    const bySearch = filterProductRows(mergedProducts, searchQuery);
    if (stockFilter === "all") return bySearch;
    return bySearch.filter((p) => p.stockStatus === stockFilter);
  }, [mergedProducts, searchQuery, stockFilter]);

  /* ── Callback post-guardado ── */
  const handleSaved = useCallback(() => {
    setStockOverrides({});
    refetch();
  }, [refetch])

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

    const { error: deleteError } = await api.delete(`/api/admin/products/${product.id}`);

    if (deleteError) {
      await Swal.fire({
        title:              "Error al eliminar",
        text:               deleteError,
        icon:               "error",
        confirmButtonText:  "Aceptar",
        confirmButtonColor: "#4ec4c4",
        background:         "#111827",
        color:              "#e2e8f0",
      });
      return;
    }

    refetch();

    await Swal.fire({
      title:              "Producto eliminado",
      text:               `"${product.name}" fue eliminado del catálogo.`,
      icon:               "success",
      confirmButtonText:  "Aceptar",
      confirmButtonColor: "#4ec4c4",
      timer:              2200,
      timerProgressBar:   true,
      background:         "#111827",
      color:              "#e2e8f0",
    });
  }, [refetch]);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Cargando productos…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorWrap}>
        <span className={styles.errorText}>{error}</span>
      </div>
    );
  }

  return (
    <>
      <div className={styles.root}>

        {/* Tarjetas de estadísticas + filtro de stock */}
        <StatsCards
          stats={stats}
          activeFilter={stockFilter}
          onFilterChange={handleStockFilter}
        />

        {/* Toolbar: conteo + badge de filtros activos */}
        {(searchQuery || stockFilter !== "all") && (
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <span className={styles.resultCount}>
                {filteredRows.length} producto{filteredRows.length !== 1 ? "s" : ""}
              </span>
              {searchQuery && (
                <span className={styles.filterBadge}>
                  Búsqueda: <strong>{searchQuery}</strong>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Lista de tarjetas */}
        {filteredRows.length > 0 ? (
          <div className={styles.cardList}>
            {filteredRows.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                animDelay={index * 0.04}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onStockChange={handleStockChange}
              />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">◈</span>
            <p className={styles.emptyTitle}>Sin resultados</p>
            <p className={styles.emptyDesc}>
              {searchQuery
                ? `Ningún producto coincide con "${searchQuery}".`
                : stockFilter !== "all"
                  ? "No hay productos con ese estado de stock."
                  : "No hay productos en el catálogo aún. Crea uno con el botón de arriba."}
            </p>
          </div>
        )}

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