"use client";

/**
 * app/(admin)/admin/dashboard/products/page.tsx
 *
 * Pestaña Productos del panel administrativo.
 *
 * Muestra todos los productos (incluyendo los sin stock) como tarjetas
 * verticales con imagen grande, info del producto y controles de movimiento
 * de inventario (Compra / Venta — WIP).
 *
 * Integra las mismas acciones de CRUD que el Dashboard:
 *   · Crear  — botón "+ Nuevo Producto" en el AdminTopbar
 *   · Editar — botón en cada ProductCard → abre ProductFormModal
 *   · Eliminar — botón en cada ProductCard → confirmación SweetAlert2
 *
 * La búsqueda se recibe desde AdminShell vía useDashboardSearch().
 * El botón de nuevo producto se registra vía useDashboardActions().
 */

import { useMemo, useState, useCallback, useEffect } from "react";
import type { ProductRow, ProductModalState } from "@/types/admin";
import { ProductCard }      from "@/components/admin/products/ProductCard";
import { ProductFormModal } from "@/components/admin/dashboard/ProductFormModal";
import {
  useDashboardSearch,
  useDashboardActions,
} from "@/components/admin/layout/AdminShell";
import { filterProductRows } from "@/lib/dashboard";
import { useProducts }       from "@/hooks/shared/useProducts";
import { api }               from "@/lib/api";
import styles from "./css/ProductsPage.module.css";

/* ─── SweetAlert2 lazy loader ──────────────────────────────────── */
async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

/* ─── Page Component ────────────────────────────────────────────── */

export default function ProductsPage() {
  const { searchQuery }              = useDashboardSearch();
  const { registerNewProductAction } = useDashboardActions();

  const {
    products: allProducts,
    loading,
    error,
    refetch,
  } = useProducts({ adminMode: true });

  const [modalState, setModalState] = useState<ProductModalState>({
    isOpen: false,
    product: null,
  });

  /* ── Modal handlers ── */
  const openNewModal  = useCallback(() => setModalState({ isOpen: true, product: null }), []);
  const openEditModal = useCallback((product: ProductRow) => setModalState({ isOpen: true, product }), []);
  const closeModal    = useCallback(() => setModalState((prev) => ({ ...prev, isOpen: false })), []);

  /* Registrar openNewModal en el contexto para que AdminTopbar lo dispare */
  useEffect(() => {
    registerNewProductAction(openNewModal);
  }, [registerNewProductAction, openNewModal]);

  /* ── Filtrado por búsqueda ── */
  const filteredRows = useMemo(
    () => filterProductRows(allProducts, searchQuery),
    [allProducts, searchQuery],
  );

  /* ── Callback post-guardado ── */
  const handleSaved = useCallback(() => { refetch(); }, [refetch]);

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

  /* ── States ── */
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

        {/* Toolbar: conteo + badges de filtro activo */}
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
                : "No hay productos en el catálogo aún. Crea uno con el botón de arriba."}
            </p>
          </div>
        )}

      </div>

      {/* Modal reutilizado del dashboard */}
      <ProductFormModal
        isOpen={modalState.isOpen}
        product={modalState.product}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </>
  );
}