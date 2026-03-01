"use client";

import { useEffect, memo, useCallback } from "react";
import { Category, Color, ActiveFilters } from "@/types/catalog";
import { PriceRangeSlider } from "@/components/ui/PriceRangeSlider";

/* ─── Sub-components ──────────────────────────────────────────────── */

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.6rem", fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "0.875rem" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function PillToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", padding: "0.35rem 0.8rem", borderRadius: "999px", border: "1px solid", borderColor: active ? "var(--coragem-teal)" : "var(--border)", backgroundColor: active ? "rgba(78, 196, 196, 0.12)" : "transparent", color: active ? "var(--coragem-teal)" : "var(--text-secondary)", fontFamily: "var(--font-jost), sans-serif", fontSize: "0.72rem", fontWeight: active ? 500 : 400, letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.22s ease", whiteSpace: "nowrap" }}
    >
      {label}
    </button>
  );
}

function ColorSwatch({ color, active, onClick }: { color: Color; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={color.label}
      aria-label={color.label}
      style={{ width: "1.75rem", height: "1.75rem", borderRadius: "50%", border: active ? "2.5px solid var(--coragem-teal)" : "2px solid var(--border)", backgroundColor: color.hex, cursor: "pointer", transition: "transform 0.2s ease, border-color 0.2s ease", transform: active ? "scale(1.18)" : "scale(1)", outline: "none", boxShadow: active ? "0 0 0 3px rgba(78,196,196,0.2)" : "none" }}
    />
  );
}

/* ─── Props ───────────────────────────────────────────────────────── */
interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  colors: Color[];
  filters: ActiveFilters;
  priceRange: { min: number; max: number };
  onChange: (next: Partial<ActiveFilters>) => void;
}

/* ─── Main Component ──────────────────────────────────────────────── */

function MobileFilterDrawerBase({
  isOpen,
  onClose,
  categories,
  colors,
  filters,
  priceRange,
  onChange,
}: MobileFilterDrawerProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceMin > priceRange.min ||
    filters.priceMax < priceRange.max;

  const toggleCategory = useCallback((id: string) => {
    onChange({
      categories: filters.categories.includes(id)
        ? filters.categories.filter((c) => c !== id)
        : [...filters.categories, id],
    });
  }, [filters.categories, onChange]);

  const toggleColor = useCallback((id: string) => {
    onChange({
      colors: filters.colors.includes(id)
        ? filters.colors.filter((c) => c !== id)
        : [...filters.colors, id],
    });
  }, [filters.colors, onChange]);

  const clearAll = useCallback(() =>
    onChange({ categories: [], colors: [], priceMin: priceRange.min, priceMax: priceRange.max }),
  [onChange, priceRange]);

  /*
   * onCommit estable: useCallback evita que PriceRangeSlider reciba una
   * nueva referencia en cada render, lo que anularía la memoización interna
   * del hook useDebouncedPrice.
   */
  const handlePriceCommit = useCallback(
    (min: number, max: number) => onChange({ priceMin: min, priceMax: max }),
    [onChange]
  );

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 150, backgroundColor: "rgba(15, 26, 42, 0.55)", opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? "auto" : "none", visibility: isOpen ? "visible" : "hidden", transition: "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s" }}
      />

      {/* ── Drawer panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de catálogo"
        style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 200, width: "300px", maxWidth: "85vw", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-card)", borderRight: "1px solid var(--border)", boxShadow: isOpen ? "12px 0 40px rgba(15, 26, 42, 0.22)" : "none", transform: isOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.38s cubic-bezier(0.4, 0, 0.2, 1)" }}
      >
        {/* Header */}
        <div style={{ height: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1.5rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1.3rem", fontWeight: 600, background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Filtros
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {hasActiveFilters && (
              <button onClick={clearAll} style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--coragem-pink)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Limpiar
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Cerrar filtros"
              style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", border: "1.5px solid var(--border)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", transition: "all 0.2s ease" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--coragem-pink)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--coragem-pink)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Gradient divider */}
        <div style={{ height: "1px", background: "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)", opacity: 0.25, flexShrink: 0 }} />

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          <FilterSection title="Categoría">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {categories.map((cat, i) => (
                <div key={cat.id} style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "translateX(0)" : "translateX(-16px)", transition: `opacity 0.3s ease ${0.05 + i * 0.04}s, transform 0.3s ease ${0.05 + i * 0.04}s` }}>
                  <PillToggle label={cat.label} active={filters.categories.includes(cat.id)} onClick={() => toggleCategory(cat.id)} />
                </div>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Color">
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              {colors.map((color, i) => (
                <div key={color.id} style={{ opacity: isOpen ? 1 : 0, transform: isOpen ? "translateX(0)" : "translateX(-16px)", transition: `opacity 0.3s ease ${0.12 + i * 0.04}s, transform 0.3s ease ${0.12 + i * 0.04}s` }}>
                  <ColorSwatch color={color} active={filters.colors.includes(color.id)} onClick={() => toggleColor(color.id)} />
                </div>
              ))}
            </div>
          </FilterSection>

          {/* PriceRangeSlider maneja su propio estado local + debounce */}
          <FilterSection title="Rango de precio">
            <PriceRangeSlider
              min={priceRange.min}
              max={priceRange.max}
              valueMin={filters.priceMin}
              valueMax={filters.priceMax}
              onCommit={handlePriceCommit}
            />
          </FilterSection>
        </div>

        {/* Footer */}
        <div style={{ padding: "1rem 1.5rem 1.5rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "999px", border: "none", background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)", color: "#ffffff", fontFamily: "var(--font-jost), sans-serif", fontSize: "0.78rem", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", transition: "opacity 0.2s ease, transform 0.2s ease" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Ver resultados
          </button>
        </div>
      </aside>
    </>
  );
}

/*
 * React.memo con comparación custom:
 * El drawer NO re-renderiza cuando cambian priceMin/priceMax en filters,
 * porque esos valores los gestiona internamente PriceRangeSlider.
 * Solo re-renderiza cuando cambian categorías, colores, isOpen, o las listas
 * de opciones — que son cambios reales que el drawer necesita reflejar.
 */
export const MobileFilterDrawer = memo(
  MobileFilterDrawerBase,
  (prev, next) => {
    if (prev.isOpen !== next.isOpen) return false;
    if (prev.filters.categories !== next.filters.categories) return false;
    if (prev.filters.colors !== next.filters.colors) return false;
    if (prev.onChange !== next.onChange) return false;
    if (prev.onClose !== next.onClose) return false;
    /* priceMin / priceMax se ignoran intencionalmente aquí */
    return true;
  }
);