"use client";

import { useState, useRef } from "react";

/* ─── Icons ──────────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
  );
}

function RhodiumIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */
export function LandingHeader() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <section style={{
        margin: "1.75rem auto 0",
        maxWidth: "1100px",
        padding: "0 1.5rem",
      }}>

        {/* ── Main Header Card ─────────────────────────────────────── */}
        <div style={{
          borderRadius: "20px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-card)",
          overflow: "hidden",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}>

          {/* Top row: Rhodium info + Payment info */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0",
          }}
            className="header-info-grid"
          >
            {/* ── Rhodium Info ── */}
            <div style={{
              padding: "1.75rem 2rem",
              borderRight: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              transition: "border-color 0.3s ease",
            }}
              className="header-info-cell"
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}>
                <span style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(78,196,196,0.15) 0%, rgba(196,122,158,0.15) 100%)",
                  border: "1px solid rgba(78,196,196,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--coragem-teal)",
                  flexShrink: 0,
                }}>
                  <RhodiumIcon />
                </span>
                <span style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  Bisutería en Rodio
                </span>
              </div>
              <p style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.82rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: "340px",
              }}>
                El <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>Rodio</strong> es
                un metal precioso de la familia del platino, conocido por su extraordinaria
                resistencia a la corrosión y su brillo plateado intenso. Nuestras piezas están
                bañadas en rodio, garantizando que conserven su apariencia inmaculada con el tiempo.
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Hipoalergénico", "Anti-oxidante", "Alta durabilidad"].map((tag) => (
                  <span key={tag} style={{
                    fontSize: "0.68rem",
                    fontFamily: "var(--font-jost), sans-serif",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "999px",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                    backgroundColor: "transparent",
                    transition: "border-color 0.3s ease",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Payment Info ── */}
            <div style={{
              padding: "1.75rem 2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
              }}>
                <span style={{
                  width: "2rem",
                  height: "2rem",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(196,122,158,0.15) 0%, rgba(196,154,108,0.15) 100%)",
                  border: "1px solid rgba(196,122,158,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--coragem-pink)",
                  flexShrink: 0,
                }}>
                  <TruckIcon />
                </span>
                <span style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--coragem-pink)",
                }}>
                  Pago contra entrega
                </span>
              </div>
              <p style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.82rem",
                lineHeight: 1.7,
                color: "var(--text-secondary)",
                maxWidth: "340px",
              }}>
                No necesitas pagar por adelantado. Recibes tu pedido en la dirección que elijas
                y <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>pagas al momento de la entrega</strong>.
                Así de simple y sin riesgo.
              </p>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.875rem",
                borderRadius: "10px",
                backgroundColor: "rgba(196,122,158,0.07)",
                border: "1px solid rgba(196,122,158,0.2)",
                width: "fit-content",
              }}>
                <span style={{ fontSize: "0.95rem" }}>💳</span>
                <span style={{
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.75rem",
                  fontWeight: 500,
                  color: "var(--coragem-pink)",
                  letterSpacing: "0.04em",
                }}>
                  Efectivo · Transferencia · Nequi
                </span>
              </div>
            </div>
          </div>

          {/* ── Divider interno ── */}
          <div style={{
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%)",
            margin: "0 1.5rem",
            transition: "background 0.3s ease",
          }} />

          {/* ── Search Row ── */}
          <div style={{
            padding: "1.25rem 1.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}>
            {/* Search wrapper with animated border */}
            <div
              className={`search-wrapper${searchFocused ? " search-focused" : ""}`}
              style={{
                flex: 1,
                position: "relative",
                borderRadius: "12px",
              }}
              onClick={() => inputRef.current?.focus()}
            >
              {/* Animated gradient border layer */}
              <div
                className={`search-border-anim${searchFocused ? " active" : ""}`}
                aria-hidden="true"
              />

              {/* Input container */}
              <div style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0 1rem",
                height: "44px",
                borderRadius: "11px",
                backgroundColor: "var(--bg)",
                border: searchFocused ? "1.5px solid transparent" : "1.5px solid var(--border)",
                transition: searchFocused
                  ? "background-color 0.3s ease, border-color 0.1s ease"
                  : "background-color 0.3s ease, border-color 0.3s ease",
                margin: searchFocused ? "1.5px" : "0",
                cursor: "text",
              }}>
                <span style={{
                  color: searchFocused ? "var(--coragem-teal)" : "var(--text-secondary)",
                  transition: "color 0.2s ease",
                  flexShrink: 0,
                }}>
                  <SearchIcon />
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Buscar productos…"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    letterSpacing: "0.02em",
                  }}
                />
                {searchValue && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); setSearchValue(""); }}
                    style={{
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      padding: 0,
                      flexShrink: 0,
                    }}
                    aria-label="Limpiar búsqueda"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter button */}
            <button
              aria-label="Filtros"
              style={{
                height: "44px",
                padding: "0 1.125rem",
                borderRadius: "12px",
                border: "1.5px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.8rem",
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "all 0.2s ease",
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                const btn = e.currentTarget;
                btn.style.borderColor = "var(--coragem-teal)";
                btn.style.color = "var(--coragem-teal)";
                btn.style.backgroundColor = "rgba(78,196,196,0.07)";
              }}
              onMouseLeave={(e) => {
                const btn = e.currentTarget;
                btn.style.borderColor = "var(--border)";
                btn.style.color = "var(--text-secondary)";
                btn.style.backgroundColor = "var(--bg)";
              }}
            >
              <FilterIcon />
              <span className="filter-label">Filtros</span>
            </button>
          </div>
        </div>

        {/* ── Section Divider ─────────────────────────────────────────── */}
        <div style={{
          marginTop: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(90deg, transparent 0%, var(--border) 100%)",
          }} />
          <span style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "0.8rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            whiteSpace: "nowrap",
          }}>
            Colección
          </span>
          <div style={{
            flex: 1,
            height: "1px",
            background: "linear-gradient(90deg, var(--border) 0%, transparent 100%)",
          }} />
        </div>
      </section>

      {/* ── Styles ──────────────────────────────────────────────────── */}
      <style>{`
        /* Animated gradient border for search */
        .search-wrapper {
          position: relative;
        }

        .search-border-anim {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          opacity: 0;
          pointer-events: none;
          z-index: 0;
          /* Gradient border via background */
          background: conic-gradient(
            from 0deg,
            #4ec4c4,
            #c47a9e,
            #c49a6c,
            #4ec4c4
          );
          /* The background-size trick to fake a border */
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask-composite: destination-out;
          padding: 1.5px;
        }

        .search-border-anim.active {
          opacity: 1;
          animation: borderSpin 0.9s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes borderSpin {
          0% {
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 0deg,
              #c49a6c 0deg,
              #4ec4c4 0deg
            );
            opacity: 1;
          }
          /* Sweep clockwise starting from top */
          15% {
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 60deg,
              transparent 60deg
            );
          }
          40% {
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 140deg,
              transparent 140deg
            );
          }
          70% {
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 260deg,
              transparent 260deg
            );
          }
          /* Full circle complete, now fade to bottom underline */
          85% {
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 360deg
            );
            opacity: 1;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: exclude;
            -webkit-mask-composite: destination-out;
            padding: 1.5px;
          }
          100% {
            opacity: 0;
            background: conic-gradient(
              from -90deg,
              #4ec4c4 0deg,
              #c47a9e 360deg
            );
          }
        }

        /* After animation ends, show just a bottom teal border via the input container */
        .search-wrapper .search-border-anim.active ~ div {
          border-bottom-color: var(--coragem-teal) !important;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .header-info-grid {
            grid-template-columns: 1fr !important;
          }
          .header-info-cell {
            border-right: none !important;
            border-bottom: 1px solid var(--border);
          }
          .filter-label {
            display: none;
          }
        }
      `}</style>
    </>
  );
}