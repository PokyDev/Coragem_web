"use client";

/* ─── Icons ──────────────────────────────────────────────────────────── */
function RhodiumAtomIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </svg>
  );
}

function Pill({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="pill-item">
      {/* Versión normal (> 460px): icon + texto en cápsula */}
      <div className="pill-default">
        <span style={{ fontSize: "0.85rem", lineHeight: 1 }}>{icon}</span>
        <span
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            fontWeight: 500,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      </div>

      {/* Versión mobile (≤ 460px): texto + línea decorativa */}
      <div className="pill-mobile">
        <span className="pill-mobile-text">{label}</span>
        <span className="pill-mobile-line" aria-hidden="true" />
      </div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────── */
export function LandingHeader() {
  return (
    <>
      <section
        style={{
          margin: "2.5rem auto 0",
          maxWidth: "1100px",
          padding: "0 1.5rem",
        }}
      >
        {/* ── Material Card ────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            borderRadius: "20px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            overflow: "hidden",
            padding: "2.25rem 2.25rem 2rem",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          {/* Background glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(78,196,196,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "30%",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(196,122,158,0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* ── Header row: icon + label + element badge ─────────── */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              {/* Icon pill */}
              <span
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, rgba(78,196,196,0.15) 0%, rgba(196,122,158,0.15) 100%)",
                  border: "1px solid rgba(78,196,196,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--coragem-teal)",
                  flexShrink: 0,
                }}
              >
                <RhodiumAtomIcon />
              </span>

              {/* Label */}
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.65rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    marginBottom: "0.15rem",
                  }}
                >
                  El material
                </p>
                <h2
                  style={{
                    fontFamily: "var(--font-cormorant), serif",
                    fontSize: "1.4rem",
                    fontWeight: 600,
                    letterSpacing: "0.04em",
                    background:
                      "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.1,
                  }}
                >
                  Rodio
                </h2>
              </div>
            </div>

            {/* Element badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "3.5rem",
                height: "3.5rem",
                borderRadius: "10px",
                border: "1.5px solid var(--border)",
                backgroundColor: "transparent",
                transition: "border-color 0.3s ease",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  lineHeight: 1,
                  background:
                    "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Rh
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.6rem",
                  color: "var(--text-secondary)",
                  letterSpacing: "0.04em",
                }}
              >
                45
              </span>
            </div>
          </div>

          {/* ── Description ──────────────────────────────────────────── */}
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.875rem",
              lineHeight: 1.85,
              color: "var(--text-secondary)",
              maxWidth: "680px",
              marginBottom: "1.5rem",
              textAlign: "justify",
            }}
          >
            El <strong style={{ color: "var(--text-primary)", fontWeight: 500 }}>Rodio</strong> es
            un metal precioso de la familia del platino — uno de los elementos más raros de la
            Tierra. Reconocido por su extraordinaria resistencia a la corrosión y su brillo
            plateado intenso, el baño en rodio transforma cada pieza en una joya que{" "}
            <em style={{ color: "var(--text-primary)", fontStyle: "normal", fontWeight: 500 }}>
              conserva su apariencia inmaculada con el paso del tiempo
            </em>
            .
          </p>

          {/* ── Pills ──────────────────────────────────────────────────── */}
          <div className="pills-container">
            <Pill label="Hipoalergénico" icon="✦" />
            <Pill label="Anti-oxidante" icon="✦" />
            <Pill label="Alta durabilidad" icon="✦" />
            <Pill label="Brillo permanente" icon="✦" />
          </div>
        </div>

        {/* ── Section divider → Colección ──────────────────────────── */}
        <div
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, var(--border) 100%)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "0.8rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            Colección
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "linear-gradient(90deg, var(--border) 0%, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ── Styles ──────────────────────────────────────────────────── */}
      <style>{`
        /* Pills container */
        .pills-container {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        /* Pill item: oculta la versión mobile por defecto */
        .pill-item {
          display: contents;
        }

        .pill-default {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.85rem 0.35rem 0.6rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background-color: transparent;
          transition: border-color 0.3s ease;
        }

        .pill-mobile {
          display: none;
        }

        /* Breakpoint ≤ 460px */
        @media (max-width: 460px) {
          .pills-container {
            flex-direction: column;
            gap: 0;
          }

          .pill-default {
            display: none;
          }

          .pill-mobile {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.55rem 0;
          }

          .pill-mobile-text {
            font-family: var(--font-jost), sans-serif;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-secondary);
            white-space: nowrap;
            flex-shrink: 0;
          }

          .pill-mobile-line {
            flex: 1;
            height: 1px;
            background: linear-gradient(
              90deg,
              var(--coragem-teal) 0%,
              rgba(196, 122, 158, 0.3) 60%,
              transparent 100%
            );
          }
        }

        @media (max-width: 480px) {
          .material-card-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </>
  );
}