"use client";

import { useState, useMemo, useCallback } from "react";
import { CatalogAside } from "@/components/user/catalog/CatalogAside";
import { CatalogToolbar } from "@/components/user/catalog/CatalogToolbar";
import { CatalogGrid } from "@/components/user/catalog/CatalogGrid";
import { MobileFilterDrawer } from "@/components/user/catalog/MobileFilterDrawer";
import { LoadMoreButton } from "@/components/shared/ui/LoadMoreButton";
import {
  Product,
  Category,
  Color,
  ActiveFilters,
  SortKey,
} from "@/types/catalog";

interface CatalogClientProps {
  products: Product[];
  categories: Category[];
  colors: Color[];
}

const PRICE_MIN = 0;
const PRICE_MAX = 100000;

const DEFAULT_FILTERS: ActiveFilters = {
  search: "",
  categories: [],
  colors: [],
  priceMin: PRICE_MIN,
  priceMax: PRICE_MAX,
  sort: "most_sold",
};

/* ─── Sorting ────────────────────────────────────────────────────── */
function sortProducts(products: Product[], sort: SortKey): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price_asc":  return sorted.sort((a, b) => a.price - b.price);
    case "price_desc": return sorted.sort((a, b) => b.price - a.price);
    case "name_asc":   return sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
    case "name_desc":  return sorted.sort((a, b) => b.name.localeCompare(a.name, "es"));
    case "most_sold":  return sorted.sort((a, b) => b.ventas - a.ventas);
    default:           return sorted;
  }
}

/* ─── Mobile toggle ──────────────────────────────────────────────── */
function MobileFilterToggle({ onClick, hasActive }: { onClick: () => void; hasActive: boolean }) {
  return (
    <button
      onClick={onClick}
      className="mobile-filter-toggle"
      style={{
        display: "none",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 1rem",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: hasActive ? "var(--coragem-teal)" : "var(--border)",
        background: hasActive ? "rgba(78,196,196,0.08)" : "var(--bg-card)",
        color: hasActive ? "var(--coragem-teal)" : "var(--text-secondary)",
        fontFamily: "var(--font-jost), sans-serif",
        fontSize: "0.72rem",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        marginBottom: "1rem",
        transition: "all 0.25s ease",
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="20" y2="12" />
        <line x1="12" y1="18" x2="20" y2="18" />
      </svg>
      Filtros {hasActive && "•"}
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function CatalogClient({ products, categories, colors }: CatalogClientProps) {
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /*
   * Referencias estables: imprescindible para que React.memo en
   * MobileFilterDrawer pueda hacer su trabajo. Si updateFilters o
   * closeDrawer se recrearan en cada render, el memo siempre fallaría.
   */
  const updateFilters = useCallback(
    (next: Partial<ActiveFilters>) => setFilters((prev) => ({ ...prev, ...next })),
    []
  );

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceMin > PRICE_MIN ||
    filters.priceMax < PRICE_MAX;

  const filteredProducts = useMemo(() => {
    const query = filters.search.toLowerCase().trim();
    const filtered = products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(p.category)) return false;
      if (filters.colors.length > 0 && !filters.colors.includes(p.color)) return false;
      if (p.price < filters.priceMin || p.price > filters.priceMax) return false;
      return true;
    });
    return sortProducts(filtered, filters.sort);
  }, [products, filters]);

  return (
    <>
      <MobileFilterDrawer
        isOpen={drawerOpen}
        onClose={closeDrawer}
        categories={categories}
        colors={colors}
        filters={filters}
        priceRange={{ min: PRICE_MIN, max: PRICE_MAX }}
        onChange={updateFilters}
      />

      <MobileFilterToggle
        onClick={() => setDrawerOpen(true)}
        hasActive={hasActiveFilters}
      />

      <div style={{ display: "flex", gap: "1.75rem", alignItems: "flex-start" }}>
        <div className="desktop-aside">
          <CatalogAside
            categories={categories}
            colors={colors}
            filters={filters}
            priceRange={{ min: PRICE_MIN, max: PRICE_MAX }}
            onChange={updateFilters}
          />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <CatalogToolbar filters={filters} total={filteredProducts.length} onChange={updateFilters} />
          <CatalogGrid products={filteredProducts} />
          <LoadMoreButton variant="catalog" />
        </div>
      </div>

      <style>{`
        .desktop-aside { flex-shrink: 0; }
        @media (max-width: 860px) {
          .desktop-aside { display: none; }
          .mobile-filter-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}