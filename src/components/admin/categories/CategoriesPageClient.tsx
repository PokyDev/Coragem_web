"use client";

/**
 * src/components/admin/categories/CategoriesPageClient.tsx
 *
 * Gestión de categorías y colores desde una misma pestaña.
 * Panel izquierdo: categorías (lista vertical, edición inline).
 * Panel derecho:   colores (grid 3 columnas, edición inline con picker).
 */

import { useState, useCallback, useEffect } from "react";
import type { CatalogCategory, CatalogColor } from "@/types/catalog";
import { useCatalog }         from "@/hooks/shared/useCatalog";
import { useCategoryActions } from "@/hooks/admin/categories/useCategoryActions";
import { useColorActions }    from "@/hooks/admin/categories/useColorActions";
import { CategoryCard }       from "@/components/admin/categories/CategoryCard";
import { NewCategoryCard }    from "@/components/admin/categories/NewCategoryCard";
import { ColorCard }          from "@/components/admin/categories/ColorCard";
import { NewColorCard }       from "@/components/admin/categories/NewColorCard";
import styles from "./CategoriesPage.module.css";

/* ── SweetAlert lazy ─────────────────────────────────────────── */

async function getSwal() {
  const Swal = (await import("sweetalert2")).default;
  return Swal;
}

const SWAL_BASE = {
  background: "#111827",
  color:      "#e2e8f0",
} as const;

/* ── Component ───────────────────────────────────────────────── */

export default function CategoriesPageClient() {
  /* ── Datos iniciales ── */
  const { categories: initialCategories, colors: initialColors, loading } = useCatalog();

  /* ── Estado local — categorías ── */
  const [categories,   setCategories]   = useState<CatalogCategory[]>([]);
  const [isAddingCat,  setIsAddingCat]  = useState(false);

  /* ── Estado local — colores ── */
  const [colors,        setColors]        = useState<CatalogColor[]>([]);
  const [isAddingColor, setIsAddingColor] = useState(false);

  /* ── Hidratación única desde caché/API ── */
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!hydrated && !loading) {
      setCategories(initialCategories);
      setColors(initialColors);
      setHydrated(true);
    }
  }, [hydrated, loading, initialCategories, initialColors]);

  /* ── Acciones CRUD ── */
  const catActions   = useCategoryActions();
  const colorActions = useColorActions();

  /* ────────────────────────────────────────────────────────────
     Handlers — Categorías
  ─────────────────────────────────────────────────────────── */

  const handleCreateCategory = useCallback(async (name: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title:             "¿Crear categoría?",
      html:              `<span style="color:#94a3b8">Se creará la categoría <strong style="color:#e2e8f0">${name}</strong>.</span>`,
      icon:              "question",
      showCancelButton:  true,
      confirmButtonText: "Sí, crear",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const created = await catActions.create(name);

    if (!created) {
      await Swal.fire({
        title:             "Error al crear",
        text:              catActions.error ?? "No se pudo crear la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      catActions.clearError();
      return;
    }

    setCategories((prev) => [...prev, created]);
    setIsAddingCat(false);

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
  }, [catActions]);

  const handleUpdateCategory = useCallback(async (id: string, newName: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title:             "¿Cambiar nombre?",
      html:              `<span style="color:#94a3b8">El nuevo nombre será <strong style="color:#e2e8f0">${newName}</strong>.</span>`,
      icon:              "question",
      showCancelButton:  true,
      confirmButtonText: "Sí, cambiar",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const updated = await catActions.update(id, newName);

    if (!updated) {
      await Swal.fire({
        title:             "Error al actualizar",
        text:              catActions.error ?? "No se pudo actualizar la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      catActions.clearError();
      return;
    }

    setCategories((prev) =>
      prev.map((c) => c.id === id ? { ...c, name: updated.name, slug: updated.slug } : c)
    );
  }, [catActions]);

  const handleDeleteCategory = useCallback(async (category: CatalogCategory) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title:             "¿Eliminar categoría?",
      html:              `<span style="color:#94a3b8">Se eliminará permanentemente <strong style="color:#e2e8f0">${category.name}</strong>.</span>`,
      icon:              "warning",
      showCancelButton:  true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const ok = await catActions.remove(category.id);

    if (!ok) {
      await Swal.fire({
        title:             "Error al eliminar",
        text:              catActions.error ?? "No se pudo eliminar la categoría",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      catActions.clearError();
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
  }, [catActions]);

  /* ────────────────────────────────────────────────────────────
     Handlers — Colores
  ─────────────────────────────────────────────────────────── */

  const handleCreateColor = useCallback(async (name: string, hex: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Crear color?",
      html: `
        <div style="display:flex;align-items:center;gap:0.75rem;justify-content:center;margin-top:0.25rem">
          <span style="display:inline-block;width:1.5rem;height:1.5rem;border-radius:50%;background:${hex};border:2px solid rgba(255,255,255,0.15);flex-shrink:0"></span>
          <span style="color:#94a3b8">Se creará el color <strong style="color:#e2e8f0">${name}</strong> (${hex}).</span>
        </div>`,
      icon:              "question",
      showCancelButton:  true,
      confirmButtonText: "Sí, crear",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const created = await colorActions.create(name, hex);

    if (!created) {
      await Swal.fire({
        title:             "Error al crear",
        text:              colorActions.error ?? "No se pudo crear el color",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      colorActions.clearError();
      return;
    }

    setColors((prev) => [...prev, created]);
    setIsAddingColor(false);

    await Swal.fire({
      title:             "Color creado",
      text:              `"${created.name}" fue añadido al catálogo.`,
      icon:              "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#4ec4c4",
      timer:             2000,
      timerProgressBar:  true,
      ...SWAL_BASE,
    });
  }, [colorActions]);

  const handleUpdateColor = useCallback(async (id: string, newName: string, newHex: string) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Guardar cambios?",
      html: `
        <div style="display:flex;align-items:center;gap:0.75rem;justify-content:center;margin-top:0.25rem">
          <span style="display:inline-block;width:1.5rem;height:1.5rem;border-radius:50%;background:${newHex};border:2px solid rgba(255,255,255,0.15);flex-shrink:0"></span>
          <span style="color:#94a3b8">Nuevo nombre: <strong style="color:#e2e8f0">${newName}</strong> · ${newHex}</span>
        </div>`,
      icon:              "question",
      showCancelButton:  true,
      confirmButtonText: "Sí, guardar",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#4ec4c4",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const updated = await colorActions.update(id, newName, newHex);

    if (!updated) {
      await Swal.fire({
        title:             "Error al actualizar",
        text:              colorActions.error ?? "No se pudo actualizar el color",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      colorActions.clearError();
      return;
    }

    setColors((prev) =>
      prev.map((c) => c.id === id ? { ...c, name: updated.name, slug: updated.slug, hex: updated.hex } : c)
    );
  }, [colorActions]);

  const handleDeleteColor = useCallback(async (color: CatalogColor) => {
    const Swal = await getSwal();

    const { isConfirmed } = await Swal.fire({
      title: "¿Eliminar color?",
      html: `
        <div style="display:flex;align-items:center;gap:0.75rem;justify-content:center;margin-top:0.25rem">
          <span style="display:inline-block;width:1.5rem;height:1.5rem;border-radius:50%;background:${color.hex};border:2px solid rgba(255,255,255,0.15);flex-shrink:0"></span>
          <span style="color:#94a3b8">Se eliminará permanentemente <strong style="color:#e2e8f0">${color.name}</strong>.</span>
        </div>`,
      icon:              "warning",
      showCancelButton:  true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText:  "Cancelar",
      confirmButtonColor: "#c47a9e",
      cancelButtonColor:  "#1e2d3d",
      ...SWAL_BASE,
    });

    if (!isConfirmed) return;

    const ok = await colorActions.remove(color.id);

    if (!ok) {
      await Swal.fire({
        title:             "Error al eliminar",
        text:              colorActions.error ?? "No se pudo eliminar el color",
        icon:              "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#4ec4c4",
        ...SWAL_BASE,
      });
      colorActions.clearError();
      return;
    }

    setColors((prev) => prev.filter((c) => c.id !== color.id));

    await Swal.fire({
      title:             "Color eliminado",
      text:              `"${color.name}" fue eliminado del catálogo.`,
      icon:              "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#4ec4c4",
      timer:             2000,
      timerProgressBar:  true,
      ...SWAL_BASE,
    });
  }, [colorActions]);

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

        {/* ── Panel Categorías ─────────────────────────────────── */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span className={styles.panelIcon}>◎</span>
              <span className={styles.panelName}>Categorías</span>
              <span className={styles.panelCount}>{categories.length}</span>
            </div>
            <button
              className={styles.btnAdd}
              onClick={() => setIsAddingCat(true)}
              disabled={isAddingCat || catActions.isLoading}
            >
              Nueva
            </button>
          </div>

          {catActions.error && (
            <p className={styles.apiError}>⚠ {catActions.error}</p>
          )}

          <div className={styles.panelBody}>
            {isAddingCat && (
              <NewCategoryCard
                isLoading={catActions.isLoading}
                onCreate={handleCreateCategory}
                onCancel={() => setIsAddingCat(false)}
              />
            )}

            {categories.length === 0 && !isAddingCat ? (
              <div className={styles.emptyPanel}>
                <p className={styles.emptyPanelTitle}>Sin categorías</p>
                <p className={styles.emptyPanelDesc}>Crea la primera usando el botón Nueva.</p>
              </div>
            ) : (
              categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isLoading={catActions.isLoading}
                  onUpdate={handleUpdateCategory}
                  onDelete={handleDeleteCategory}
                />
              ))
            )}
          </div>
        </section>

        {/* ── Panel Colores ─────────────────────────────────────── */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <span className={styles.panelIcon}>◑</span>
              <span className={styles.panelName}>Colores</span>
              <span className={styles.panelCount}>{colors.length}</span>
            </div>
            <button
              className={styles.btnAdd}
              onClick={() => setIsAddingColor(true)}
              disabled={isAddingColor || colorActions.isLoading}
            >
              Nuevo
            </button>
          </div>

          {colorActions.error && (
            <p className={styles.apiError}>⚠ {colorActions.error}</p>
          )}

          <div className={styles.panelBody}>
            {isAddingColor && (
              <NewColorCard
                isLoading={colorActions.isLoading}
                onCreate={handleCreateColor}
                onCancel={() => setIsAddingColor(false)}
              />
            )}

            {colors.length === 0 && !isAddingColor ? (
              <div className={styles.emptyPanel}>
                <p className={styles.emptyPanelTitle}>Sin colores</p>
                <p className={styles.emptyPanelDesc}>Crea el primero usando el botón Nuevo.</p>
              </div>
            ) : (
              <div className={styles.colorsGrid}>
                {colors.map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    isLoading={colorActions.isLoading}
                    onUpdate={handleUpdateColor}
                    onDelete={handleDeleteColor}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}