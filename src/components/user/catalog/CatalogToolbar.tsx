"use client";

/**
 * src/components/user/catalog/CatalogToolbar.tsx
 *
 * Barra de herramientas del catálogo público.
 * Usa el componente compartido SearchInput (variante "catalog")
 * en lugar de tener el input inline.
 */

import { useRef, useState } from "react";
import { SearchInput }      from "@/components/shared/ui/SearchInput";
import { ActiveFilters, SortKey, SORT_OPTIONS } from "@/types/catalog";

interface CatalogToolbarProps {
  filters:  ActiveFilters;
  total:    number;
  onChange: (next: Partial<ActiveFilters>) => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13" height="13" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      style={{
        transition: "transform 0.25s ease",
        transform:  open ? "rotate(180deg)" : "rotate(0deg)",
        flexShrink: 0,
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function CatalogToolbar({ filters, total, onChange }: CatalogToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSort = SORT_OPTIONS.find((o) => o.key === filters.sort) ?? SORT_OPTIONS[0];

  const selectSort = (key: SortKey) => {
    onChange({ sort: key });
    setSortOpen(false);
  };

  return (
    <div
      style={{
        display:    "flex",
        alignItems: "center",
        gap:        "0.75rem",
        marginBottom: "1.5rem",
        position:   "relative",
      }}
      className="catalog-toolbar"
    >
      {/* ── Search ── */}
      <div style={{ flex: 1 }}>
        <SearchInput
          variant="catalog"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          onClear={() => onChange({ search: "" })}
          placeholder="Buscar producto..."
        />
      </div>

      {/* ── Sort Dropdown ── */}
      <div ref={dropdownRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setSortOpen((o) => !o)}
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "0.5rem",
            height:          "2.6rem",
            padding:         "0 0.9rem",
            borderRadius:    "10px",
            border:          "1px solid",
            borderColor:     sortOpen ? "var(--coragem-teal)" : "var(--border)",
            backgroundColor: sortOpen ? "rgba(78,196,196,0.08)" : "var(--bg-card)",
            color:           sortOpen ? "var(--coragem-teal)" : "var(--text-secondary)",
            fontFamily:      "var(--font-jost), sans-serif",
            fontSize:        "0.75rem",
            letterSpacing:   "0.04em",
            cursor:          "pointer",
            transition:      "all 0.25s ease",
            whiteSpace:      "nowrap",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="15" y2="12" />
            <line x1="3" y1="18" x2="9"  y2="18" />
          </svg>
          <span className="sort-label">{currentSort.label}</span>
          <ChevronIcon open={sortOpen} />
        </button>

        {sortOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={() => setSortOpen(false)}
            />
            <div
              style={{
                position:        "absolute",
                top:             "calc(100% + 0.5rem)",
                right:           0,
                zIndex:          20,
                minWidth:        "200px",
                backgroundColor: "var(--bg-card)",
                border:          "1px solid var(--border)",
                borderRadius:    "12px",
                boxShadow:       "0 8px 24px rgba(15,26,42,0.12), 0 2px 6px rgba(0,0,0,0.06)",
                overflow:        "hidden",
                animation:       "dropdownIn 0.2s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {SORT_OPTIONS.map((opt) => {
                const active = opt.key === filters.sort;
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectSort(opt.key)}
                    style={{
                      display:        "flex",
                      alignItems:     "center",
                      justifyContent: "space-between",
                      width:          "100%",
                      padding:        "0.65rem 1rem",
                      border:         "none",
                      background:     active ? "rgba(78,196,196,0.08)" : "transparent",
                      color:          active ? "var(--coragem-teal)" : "var(--text-secondary)",
                      fontFamily:     "var(--font-jost), sans-serif",
                      fontSize:       "0.78rem",
                      letterSpacing:  "0.04em",
                      cursor:         "pointer",
                      textAlign:      "left",
                      transition:     "background 0.15s ease, color 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(78,196,196,0.05)";
                        (e.currentTarget as HTMLButtonElement).style.color      = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color      = "var(--text-secondary)";
                      }
                    }}
                  >
                    {opt.label}
                    {active && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--coragem-teal)" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Results count */}
      <span
        className="results-count"
        style={{
          fontFamily:    "var(--font-jost), sans-serif",
          fontSize:      "0.7rem",
          color:         "var(--text-secondary)",
          letterSpacing: "0.06em",
          whiteSpace:    "nowrap",
          flexShrink:    0,
        }}
      >
        {total} {total === 1 ? "producto" : "productos"}
      </span>

      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 520px) {
          .sort-label    { display: none; }
          .results-count { display: none; }
        }
      `}</style>
    </div>
  );
}