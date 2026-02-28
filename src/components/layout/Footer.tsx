"use client";

import { NavLink } from "@/components/layout/NavLink";

/* ─── Constants ─────────────────────────────────────────────────── */
const NAV_LINKS = [
  { href: "/",         label: "Inicio"    },
  { href: "/products", label: "Productos" },
  { href: "/contact",  label: "Contacto"  },
  /* { href: "/warranty", label: "Garantía"  }, */ // Por ahora no hay una garantia definida.
] as const;

const CURRENT_YEAR = new Date().getFullYear();

/* ─── Instagram Icon (official gradient colors) ──────────────────── */
function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="url(#ig-gradient-footer)"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="ig-gradient-footer" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f09433" />
          <stop offset="25%"  stopColor="#e6683c" />
          <stop offset="50%"  stopColor="#dc2743" />
          <stop offset="75%"  stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="#dc2743" stroke="none" />
    </svg>
  );
}

/* ─── Gradient Divider ───────────────────────────────────────────── */
function GradientDivider() {
  return (
    <div
      style={{
        height: "1px",
        background:
          "linear-gradient(90deg, transparent 0%, var(--coragem-teal) 35%, var(--coragem-pink) 65%, transparent 100%)",
        opacity: 0.35,
      }}
    />
  );
}

/* ─── Section Label ──────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-jost), sans-serif",
        fontSize: "0.6rem",
        fontWeight: 500,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--text-secondary)",
        marginBottom: "0.75rem",
      }}
    >
      {children}
    </p>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-card)",
        borderTop: "1px solid var(--border)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <GradientDivider />

      {/* ── 1st Section: Social + Navigation + Brand ── */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.5rem",
        }}
        className="footer-top"
      >
        {/* ── Left: Social block ── */}
        <div className="footer-col">
          <SectionLabel>Síguenos</SectionLabel>
          <a
            href="https://www.instagram.com/coragem_accesorios"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram de Coragem Accesorios"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.8rem",
              fontWeight: 400,
              letterSpacing: "0.04em",
              padding: "0.4rem 0.75rem 0.4rem 0.55rem",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              transition:
                "color 0.25s ease, border-color 0.25s ease, background-color 0.25s ease, transform 0.25s ease",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "var(--text-primary)";
              el.style.borderColor = "rgba(220, 39, 67, 0.4)";
              el.style.backgroundColor = "rgba(220, 39, 67, 0.05)";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLAnchorElement;
              el.style.color = "var(--text-secondary)";
              el.style.borderColor = "var(--border)";
              el.style.backgroundColor = "transparent";
              el.style.transform = "translateY(0)";
            }}
          >
            <InstagramIcon size={17} />
            @coragem_accesorios
          </a>
        </div>

        {/* ── Center: Navigation (horizontal) ── */}
        <div className="footer-col" style={{ textAlign: "center" }}>
          <SectionLabel>Navegación</SectionLabel>
          <nav
            aria-label="Navegación del footer"
            className="footer-nav"
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: "0.2rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </div>

        {/* ── Right: Brand wordmark ── */}
        <div className="footer-col footer-col--right">
          <SectionLabel>Marca</SectionLabel>
          <span
            className="footer-brand-text"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.9rem",
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: "0.04em",
              userSelect: "none",
              display: "block",
              transition: "color 0.3s ease, opacity 0.3s ease",
            }}
          >
            Coragem
          </span>
        </div>
      </div>

      <GradientDivider />

      {/* ── 2nd Section: Copyright + Developer ── */}
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
        className="footer-bottom"
      >
        {/* Copyright */}
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            letterSpacing: "0.04em",
          }}
        >
          Copyright ©&nbsp;Coragem — {CURRENT_YEAR}. Todos los derechos reservados.
        </p>

        {/* Developer credit */}
        <a
          href="https://github.com/PokyDev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Perfil de GitHub del desarrollador PokyDev"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
            letterSpacing: "0.04em",
            transition: "color 0.25s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--coragem-teal)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--text-secondary)";
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ flexShrink: 0, opacity: 0.75 }}
          >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          @PokyDev
        </a>
      </div>

      {/* ── Theme-aware + Responsive styles ── */}
      <style>{`
        /* Brand text: navy con opacidad en claro, teal en oscuro */
        :root .footer-brand-text {
          color: var(--coragem-navy);
          opacity: 0.45;
        }
        .dark .footer-brand-text {
          color: var(--coragem-teal);
          opacity: 0.8;
        }

        /* ── Responsive: columna vertical centrada ≤ 750px ── */
        @media (max-width: 750px) {
          .footer-top {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 2rem !important;
          }
          .footer-col {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-col--right {
            text-align: center !important;
          }
          .footer-bottom {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
            gap: 0.375rem !important;
          }
        }

        /* ── Nav en columna centrada ≤ 400px ── */
        @media (max-width: 400px) {
          .footer-nav {
            flex-direction: column !important;
            gap: 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
}