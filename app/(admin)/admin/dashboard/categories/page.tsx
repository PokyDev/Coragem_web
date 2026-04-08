"use client";

/**
 * app/(admin)/admin/dashboard/categories/page.tsx
 *
 * Pestaña Categorías del panel administrativo.
 *
 * Layout de dos columnas:
 *   Izquierda — gestión de categorías (lista + CRUD inline)
 *   Derecha   — gestión de colores (DevelopmentState por ahora)
 *
 * Estado de la lista: copia local de `categories` para mutaciones
 * optimistas (add / rename / remove) sin necesidad de refetch global.
 * El caché de useCatalog se invalida en cada mutación via useCategoryActions.
 */

import type { Metadata }     from "next";
import { useState, useCallback } from "react";
import type { CatalogCategory }  from "@/types/catalog";
import { useCatalog }            from "@/hooks/shared/useCatalog";
import { useCategoryActions }    from "@/hooks/admin/categories/useCategoryActions";
import { CategoryCard }          from "@/components/admin/categories/CategoryCard";
import { NewCategoryCard }       from "@/components/admin/categories/NewCategoryCard";
import { DevelopmentState }      from "@/components/admin/ui/DevelopmentState";
import styles from "./css/CategoriesPage.module.css";

/* ── SweetAlert lazy ─────────────────────────────────────────── */

async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

const SWAL_BASE = {
  background: "#111827",
  color:      "#e2e8f0",
} as const;

/* ── Metadata (solo funciona en Server Components, pero el export
     es harmless aquí y lo omite Next en client components) ─────── */
export const metadata: Metadata = { title: "Categorías" };

/* ── Component ───────────────────────────────────────────────── */

export default function CategoriesPage() {
  /* ── Datos iniciales desde useCatalog (con caché) ── */
  const { categories: initialCategories, loading } = useCatalog();

  /* ── Copia local mutable para mutaciones optimistas ── */
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [hydrated,   setHydrated]   = useState(false);

  /* Sincronizar la copia local la primera vez que lleguen los datos */
  if (!hydrated && !loading && initialCategories.length >= 0) {
    setCategories(initialCategories);
    setHydrated(true);
  }

  /* ── Estado UI ── */
  const [isAdding, setIsAdding] = useState(false);

  /* ── Acciones CRUD ── */
  const { isLoading, error, clearError, create, update, remove } = useCategoryActions();

  /* ── Crear ─────────────────────────────────────────────────── */
  const handleCreate = useCallback(async (name: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Crear categoría?",
      html:  `<span style="color:#94a3b8">Se creará la categoría <strong style="color:#e2e8f0">${name}</strong>.</span>`,
      icon:  "question",
      showCancelButton:   true,
      confirmButtonText:  "Sí, crear",
      cancelButtonText:   "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const created = await create(name);

    if (!created) {
      await Swal.fire({
        title:             "Error al crear",
        text:              error ?? "No se pudo crear la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      clearError();
      return;
    }

    setCategories((prev) => [...prev, created]);
    setIsAdding(false);

    await Swal.fire({
      title:             "Categoría creada",
      text:              `"${created.name}" fue añadida al catálogo.`,
      icon:              "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#4ec4c4",
      timer:             2000,
      timerProgressBar:  true,
      ...SWAL_BASE,
    });
  }, [create, error, clearError]);

  /* ── Actualizar ────────────────────────────────────────────── */
  const handleUpdate = useCallback(async (id: string, newName: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Cambiar nombre?",
      html:  `<span style="color:#94a3b8">El nuevo nombre será <strong style="color:#e2e8f0">${newName}</strong>.</span>`,
      icon:  "question",
      showCancelButton:   true,
      confirmButtonText:  "Sí, cambiar",
      cancelButtonText:   "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const updated = await update(id, newName);

    if (!updated) {
      await Swal.fire({
        title:             "Error al actualizar",
        text:              error ?? "No se pudo actualizar la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      clearError();
      return;
    }

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: updated.name, slug: updated.slug } : c))
    );
  }, [update, error, clearError]);

  /* ── Eliminar ──────────────────────────────────────────────── */
  const handleDelete = useCallback(async (category: CatalogCategory) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar categoría?",
      html:  `<span style="color:#94a3b8">Se eliminará permanentemente <strong style="color:#e2e8f0">${category.name}</strong>. Los productos asociados no serán eliminados.</span>`,
      icon:  "warning",
      showCancelButton:   true,
      confirmButtonText:  "Sí, eliminar",
      cancelButtonText:   "Cancelar",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const ok = await remove(category.id);

    if (!ok) {
      await Swal.fire({
        title:             "Error al eliminar",
        text:              error ?? "No se pudo eliminar la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      clearError();
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== category.id));

    await Swal.fire({
      title:             "Categoría eliminada",
      text:              `"${category.name}" fue eliminada del catálogo.`,
      icon:              "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#4ec4c4",
      timer:             2000,
      timerProgressBar:  true,
      ...SWAL_BASE,
    });
  }, [remove, error, clearError]);

  /* ── Loading inicial ── */
  if (loading && !hydrated) {
    return (
      <div className={styles.loadingWrap}>
        <span className={styles.loadingText}>Cargando catálogo…</span>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className={styles.root}>
      <div className={styles.grid}>

        {/* ── Columna: Categorías ─────────────────────────── */}
        <section className={styles.panel} aria-label="Gestión de categorías">

          {/* Header */}
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span className={styles.panelIcon} aria-hidden="true">◎</span>
              <span className={styles.panelName}>Categorías</span>
              <span className={styles.panelCount}>{categories.length}</span>
            </div>
            <button
              className={styles.btnAdd}
              type="button"
              onClick={() => setIsAdding(true)}
              disabled={isAdding || isLoading}
              aria-label="Añadir nueva categoría"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5"  y1="12" x2="19" y2="12" />
              </svg>
              Nueva
            </button>
          </div>

          {/* Error de API */}
          {error && (
            <p className={styles.apiError} role="alert">
              ⚠ {error}
            </p>
          )}

          {/* Lista */}
          <div className={styles.panelBody}>

            {/* Tarjeta de nueva categoría — aparece al inicio */}
            {isAdding && (
              <NewCategoryCard
                isLoading={isLoading}
                onCreate={handleCreate}
                onCancel={() => setIsAdding(false)}
              />
            )}

            {categories.length === 0 && !isAdding ? (
              <div className={styles.emptyPanel}>
                <span className={styles.emptyPanelIcon} aria-hidden="true">◎</span>
                <p className={styles.emptyPanelTitle}>Sin categorías</p>
                <p className={styles.emptyPanelDesc}>
                  Pulsa &ldquo;Nueva&rdquo; para crear la primera categoría.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isLoading={isLoading}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))
            )}

          </div>
        </section>

        {/* ── Columna: Colores (en desarrollo) ────────────── */}
        <section className={styles.panel} aria-label="Gestión de colores">
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span className={styles.panelIcon} aria-hidden="true">◑</span>
              <span className={styles.panelName}>Colores</span>
            </div>
          </div>
          <DevelopmentState
            icon="◑"
            title="Colores"
            description="Gestión de la paleta de colores del catálogo. Próximamente."
          />
        </section>

      </div>
    </div>
  );
}