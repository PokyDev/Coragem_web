'use client';

/**
 * src/components/user/catalog/CatalogClient.tsx
 *
 * Fetcha categorías y colores via useCatalog (caché en módulo, un solo
 * request por sesión). Los productos se obtienen via useProducts.
 * Filtrado y ordenamiento son client-side sobre el resultado completo.
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { CatalogAside       } from '@/components/user/catalog/CatalogAside';
import { CatalogToolbar     } from '@/components/user/catalog/CatalogToolbar';
import { CatalogGrid        } from '@/components/user/catalog/CatalogGrid';
import { MobileFilterDrawer } from '@/components/user/catalog/MobileFilterDrawer';
import { useProducts        } from '@/hooks/shared/useProducts';
import { useCatalog         } from '@/hooks/shared/useCatalog';
import type { ActiveFilters, Product, SortKey } from '@/types/catalog';

const PRICE_MIN = 5000;
const PRICE_MAX = 40000;
const PAGE_SIZE = 24;

const DEFAULT_FILTERS: ActiveFilters = {
  search:     '',
  categories: [],
  colors:     [],
  priceMin:   PRICE_MIN,
  priceMax:   PRICE_MAX,
  sort:       'name_asc',
};

/* ─── Sorting ── */
function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price_asc':  return arr.sort((a, b) => a.price - b.price);
    case 'price_desc': return arr.sort((a, b) => b.price - a.price);
    case 'name_asc':   return arr.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    case 'name_desc':  return arr.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    case 'most_sold':  return arr.sort((a, b) => b.ventas - a.ventas);
    default:           return arr;
  }
}

/* ─── Mobile filter toggle ── */
function MobileFilterToggle({ onClick, hasActive }: { onClick: () => void; hasActive: boolean }) {
  return (
    <button
      onClick={onClick}
      className="mobile-filter-toggle"
      style={{
        display: 'none', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid',
        borderColor:   hasActive ? 'var(--coragem-teal)' : 'var(--border)',
        background:    hasActive ? 'rgba(78,196,196,0.08)' : 'var(--bg-card)',
        color:         hasActive ? 'var(--coragem-teal)' : 'var(--text-secondary)',
        fontFamily:    'var(--font-jost), sans-serif', fontSize: '0.72rem',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        cursor: 'pointer', marginBottom: '1rem', transition: 'all 0.25s ease',
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4"  y1="6"  x2="20" y2="6"  />
        <line x1="8"  y1="12" x2="20" y2="12" />
        <line x1="12" y1="18" x2="20" y2="18" />
      </svg>
      Filtros {hasActive && '•'}
    </button>
  );
}

/* ─── Main Component ── */
export function CatalogClient() {
  const [filters,      setFilters]      = useState<ActiveFilters>(DEFAULT_FILTERS);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const { products: allProducts, loading: productsLoading, error: productsError } = useProducts();
  const { categories, colors } = useCatalog();

  const updateFilters = useCallback(
    (next: Partial<ActiveFilters>) => setFilters((prev) => ({ ...prev, ...next })),
    []
  );
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const filteredProducts = useMemo(() => {
    const query = filters.search.toLowerCase().trim();

    const filtered = allProducts.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query))                   return false;
      if (filters.categories.length > 0 &&
          !filters.categories.includes(p.category.slug))                    return false;
      if (filters.colors.length > 0 &&
          !filters.colors.includes(p.color.slug))                           return false;
      if (p.price < filters.priceMin || p.price > filters.priceMax)         return false;
      return true;
    });

    return sortProducts(filtered, filters.sort);
  }, [allProducts, filters]);

  // Al cambiar filtros, reiniciar cuántos productos se renderizan
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters]);

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // IntersectionObserver: carga más cuando el sentinel entra al viewport
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length     > 0 ||
    filters.priceMin > PRICE_MIN   ||
    filters.priceMax < PRICE_MAX;

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

      <MobileFilterToggle onClick={() => setDrawerOpen(true)} hasActive={hasActiveFilters} />

      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'flex-start' }}>
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
          <CatalogToolbar
            filters={filters}
            total={filteredProducts.length}
            onChange={updateFilters}
          />
          <CatalogGrid
            products={visibleProducts}
            loading={productsLoading}
            error={productsError}
          />

          {/* Sentinel: el IntersectionObserver lo vigila para cargar más */}
          <div ref={sentinelRef} style={{ height: '1px' }} />

          {/* Fin de lista */}
          {!productsLoading && !productsError && !hasMore && filteredProducts.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0 0.5rem', fontFamily: 'var(--font-jost), sans-serif', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.6 }}>
              ✦ &nbsp; Fin del catálogo
            </div>
          )}
        </div>
      </div>

      <style>{`
        .desktop-aside { flex-shrink: 0; }
        @media (max-width: 860px) {
          .desktop-aside        { display: none; }
          .mobile-filter-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}