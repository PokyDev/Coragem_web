"use client";

import { useEffect } from "react";
import { NavLink } from "@/components/layout/NavLink";
import { BrandIcon } from "@/components/layout/ui/BrandIcon";
import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "/",         label: "Inicio"    },
  { href: "/products", label: "Productos" },
  { href: "/contact",  label: "Contacto"  },
  /* { href: "/warranty", label: "Garantía"  }, */ // Por ahora no hay una garantia definida.
] as const;

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  /* Bloquear scroll del body cuando el menú está abierto */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 150,
          backgroundColor: "rgba(15, 26, 42, 0.55)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isOpen ? "visible" : "hidden",
          transition:
            "opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.35s",
        }}
        aria-hidden="true"
      />

      {/* ── Sidebar panel ── */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 200,
          width: "50%",
          minWidth: "240px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-card)",
          borderLeft: "1px solid",
          borderColor: "var(--border)",
          boxShadow: isOpen ? "-12px 0 40px rgba(15, 26, 42, 0.22)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition:
            "transform 0.38s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.38s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* ── Header del panel ── */}
        <div
          style={{
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 1.5rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.3rem",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Menú
          </span>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "50%",
              border: "1.5px solid var(--border)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--coragem-pink)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--coragem-pink)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "var(--border)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "var(--text-secondary)";
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Links ── */}
        <nav
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "1.5rem 1.25rem",
            gap: "0.375rem",
          }}
        >
          {NAV_LINKS.map((link, i) => (
            <div
              key={link.href}
              onClick={onClose}
              style={{
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? "translateX(0)" : "translateX(20px)",
                transition: `opacity 0.35s ease ${0.08 + i * 0.06}s, transform 0.35s ease ${0.08 + i * 0.06}s`,
              }}
            >
              <NavLink href={link.href} label={link.label} mobile />
            </div>
          ))}
        </nav>

        {/* ── Footer del panel: decoración + BrandIcon + ThemeToggle ── */}
        <div
          style={{
            padding: "1.25rem 1.5rem 1.5rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* BrandIcon + ThemeToggle en fila */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <BrandIcon size={44} />
            <ThemeToggle />
          </div>

          {/* Línea decorativa */}
          <div
            style={{
              height: "2px",
              borderRadius: "2px",
              background:
                "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
              opacity: 0.6,
            }}
          />

          {/* Label */}
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.72rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
            }}
          >
            Bisutería en Rodio
          </p>
        </div>
      </aside>
    </>
  );
}