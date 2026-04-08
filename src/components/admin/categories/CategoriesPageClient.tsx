"use client";

/**
 * Client component para gestión de categorías.
 */

import { useState, useCallback, useEffect } from "react";
import type { CatalogCategory } from "@/types/catalog";
import { useCatalog } from "@/hooks/shared/useCatalog";
import { useCategoryActions } from "@/hooks/admin/categories/useCategoryActions";
import { CategoryCard } from "@/components/admin/categories/CategoryCard";
import { NewCategoryCard } from "@/components/admin/categories/NewCategoryCard";
import { DevelopmentState } from "@/components/admin/ui/DevelopmentState";
import styles from "./css/CategoriesPage.module.css";

/* ── SweetAlert lazy ─────────────────────────────────────────── */

async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

const SWAL_BASE = {
  background: "#111827",
  color: "#e2e8f0",
} as const;

/* ── Component ───────────────────────────────────────────────── */

export default function CategoriesPageClient() {
  /* ── Datos iniciales desde useCatalog ── */
  const { categories: initialCategories, loading } = useCatalog();

  /* ── Estado local ── */
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  /* ── Acciones CRUD ── */
  const { isLoading, error, clearError, create, update, remove } =
    useCategoryActions();

  /* ✅ FIX: sincronización correcta */
  useEffect(() => {
    if (!hydrated && !loading) {
      setCategories(initialCategories);
      setHydrated(true);
    }
  }, [hydrated, loading, initialCategories]);

  /* ── Crear ─────────────────────────────────────────────────── */
  const handleCreate = useCallback(
    async (name: string) => {
      const Swal = await getSwal();

      const { isConfirmed } = await Swal.fire({
        title: "¿Crear categoría?",
        html: `<span style="color:#94a3b8">Se creará la categoría <strong style="color:#e2e8f0">${name}</strong>.</span>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, crear",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4ec4c4",
        cancelButtonColor: "#1e2d3d",
        ...SWAL_BASE,
      });

      if (!isConfirmed) return;

      const created = await create(name);

      if (!created) {
        await Swal.fire({
          title: "Error al crear",
          text: error ?? "No se pudo crear la categoría",
          icon: "error",
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
        title: "Categoría creada",
        text: `"${created.name}" fue añadida al catálogo.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        timer: 2000,
        timerProgressBar: true,
        ...SWAL_BASE,
      });
    },
    [create, error, clearError]
  );

  /* ── Actualizar ────────────────────────────────────────────── */
  const handleUpdate = useCallback(
    async (id: string, newName: string) => {
      const Swal = await getSwal();

      const { isConfirmed } = await Swal.fire({
        title: "¿Cambiar nombre?",
        html: `<span style="color:#94a3b8">El nuevo nombre será <strong style="color:#e2e8f0">${newName}</strong>.</span>`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#4ec4c4",
        cancelButtonColor: "#1e2d3d",
        ...SWAL_BASE,
      });

      if (!isConfirmed) return;

      const updated = await update(id, newName);

      if (!updated) {
        await Swal.fire({
          title: "Error al actualizar",
          text: error ?? "No se pudo actualizar la categoría",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#4ec4c4",
          ...SWAL_BASE,
        });
        clearError();
        return;
      }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? { ...c, name: updated.name, slug: updated.slug }
            : c
        )
      );
    },
    [update, error, clearError]
  );

  /* ── Eliminar ──────────────────────────────────────────────── */
  const handleDelete = useCallback(
    async (category: CatalogCategory) => {
      const Swal = await getSwal();

      const { isConfirmed } = await Swal.fire({
        title: "¿Eliminar categoría?",
        html: `<span style="color:#94a3b8">Se eliminará permanentemente <strong style="color:#e2e8f0">${category.name}</strong>. Los productos asociados no serán eliminados.</span>`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#c47a9e",
        cancelButtonColor: "#1e2d3d",
        ...SWAL_BASE,
      });

      if (!isConfirmed) return;

      const ok = await remove(category.id);

      if (!ok) {
        await Swal.fire({
          title: "Error al eliminar",
          text: error ?? "No se pudo eliminar la categoría",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#4ec4c4",
          ...SWAL_BASE,
        });
        clearError();
        return;
      }

      setCategories((prev) =>
        prev.filter((c) => c.id !== category.id)
      );

      await Swal.fire({
        title: "Categoría eliminada",
        text: `"${category.name}" fue eliminada del catálogo.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        timer: 2000,
        timerProgressBar: true,
        ...SWAL_BASE,
      });
    },
    [remove, error, clearError]
  );

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
        {/* Categorías */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span className={styles.panelIcon}>◎</span>
              <span className={styles.panelName}>Categorías</span>
              <span className={styles.panelCount}>
                {categories.length}
              </span>
            </div>

            <button
              className={styles.btnAdd}
              onClick={() => setIsAdding(true)}
              disabled={isAdding || isLoading}
            >
              Nueva
            </button>
          </div>

          {error && <p className={styles.apiError}>⚠ {error}</p>}

          <div className={styles.panelBody}>
            {isAdding && (
              <NewCategoryCard
                isLoading={isLoading}
                onCreate={handleCreate}
                onCancel={() => setIsAdding(false)}
              />
            )}

            {categories.length === 0 && !isAdding ? (
              <div className={styles.emptyPanel}>
                <p>Sin categorías</p>
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

        {/* Colores */}
        <section className={styles.panel}>
          <DevelopmentState
            icon="◑"
            title="Colores"
            description="Próximamente."
          />
        </section>
      </div>
    </div>
  );
}