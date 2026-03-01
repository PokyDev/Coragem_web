"use client";

import { Category, Color, ActiveFilters } from "@/types/catalog";

interface CatalogAsideProps {
  categories: Category[];
  colors: Color[];
  filters: ActiveFilters;
  priceRange: { min: number; max: number };
  onChange: (next: Partial<ActiveFilters>) => void;
}

/* ─── Section header ─────────────────────────────────────────────── */
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.6rem",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: "0.875rem",
        }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

/* ─── Pill toggle ────────────────────────────────────────────────── */
function PillToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.35rem 0.8rem",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: active ? "var(--coragem-teal)" : "var(--border)",
        backgroundColor: active
          ? "rgba(78, 196, 196, 0.12)"
          : "transparent",
        color: active ? "var(--coragem-teal)" : "var(--text-secondary)",
        fontFamily: "var(--font-jost), sans-serif",
        fontSize: "0.72rem",
        fontWeight: active ? 500 : 400,
        letterSpacing: "0.06em",
        cursor: "pointer",
        transition: "all 0.22s ease",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

/* ─── Color swatch ───────────────────────────────────────────────── */
function ColorSwatch({
  color,
  active,
  onClick,
}: {
  color: Color;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={color.label}
      aria-label={color.label}
      style={{
        width: "1.75rem",
        height: "1.75rem",
        borderRadius: "50%",
        border: active
          ? "2.5px solid var(--coragem-teal)"
          : "2px solid var(--border)",
        backgroundColor: color.hex,
        cursor: "pointer",
        transition: "transform 0.2s ease, border-color 0.2s ease",
        transform: active ? "scale(1.18)" : "scale(1)",
        outline: "none",
        boxShadow: active
          ? "0 0 0 3px rgba(78,196,196,0.2)"
          : "none",
      }}
    />
  );
}

/* ─── Price Range Slider ─────────────────────────────────────────── */
function PriceRange({
  min,
  max,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChangeMin: (v: number) => void;
  onChangeMax: (v: number) => void;
}) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(v);

  return (
    <div>
      {/* Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            color: "var(--coragem-teal)",
            fontWeight: 500,
          }}
        >
          {fmt(valueMin)}
        </span>
        <span
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            color: "var(--coragem-pink)",
            fontWeight: 500,
          }}
        >
          {fmt(valueMax)}
        </span>
      </div>

      {/* Min slider */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="range"
          min={min}
          max={max}
          step={1000}
          value={valueMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < valueMax) onChangeMin(v);
          }}
          className="price-slider"
          style={{ width: "100%", accentColor: "var(--coragem-teal)" }}
        />
      </div>

      {/* Max slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={1000}
        value={valueMax}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (v > valueMin) onChangeMax(v);
        }}
        className="price-slider"
        style={{ width: "100%", accentColor: "var(--coragem-pink)" }}
      />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function CatalogAside({
  categories,
  colors,
  filters,
  priceRange,
  onChange,
}: CatalogAsideProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceMin > priceRange.min ||
    filters.priceMax < priceRange.max;

  const toggleCategory = (id: string) => {
    const next = filters.categories.includes(id)
      ? filters.categories.filter((c) => c !== id)
      : [...filters.categories, id];
    onChange({ categories: next });
  };

  const toggleColor = (id: string) => {
    const next = filters.colors.includes(id)
      ? filters.colors.filter((c) => c !== id)
      : [...filters.colors, id];
    onChange({ colors: next });
  };

  const clearAll = () =>
    onChange({
      categories: [],
      colors: [],
      priceMin: priceRange.min,
      priceMax: priceRange.max,
    });

  return (
    <aside
      style={{
        width: "220px",
        flexShrink: 0,
        position: "sticky",
        top: "88px",
        alignSelf: "flex-start",
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "1.5rem",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
      className="catalog-aside"
    >
      {/* Aside header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Filtros
        </span>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--coragem-pink)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "opacity 0.2s ease",
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Gradient divider */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
          opacity: 0.25,
          marginBottom: "1.5rem",
        }}
      />

      {/* Categories */}
      <FilterSection title="Categoría">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.4rem",
          }}
        >
          {categories.map((cat) => (
            <PillToggle
              key={cat.id}
              label={cat.label}
              active={filters.categories.includes(cat.id)}
              onClick={() => toggleCategory(cat.id)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Colors */}
      <FilterSection title="Color">
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          {colors.map((color) => (
            <ColorSwatch
              key={color.id}
              color={color}
              active={filters.colors.includes(color.id)}
              onClick={() => toggleColor(color.id)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Rango de precio">
        <PriceRange
          min={priceRange.min}
          max={priceRange.max}
          valueMin={filters.priceMin}
          valueMax={filters.priceMax}
          onChangeMin={(v) => onChange({ priceMin: v })}
          onChangeMax={(v) => onChange({ priceMax: v })}
        />
      </FilterSection>

      {/* Responsive styles */}
      <style>{`
        .price-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 999px;
          background: var(--border);
          outline: none;
          cursor: pointer;
        }
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </aside>
  );
}