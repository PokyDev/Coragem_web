"use client";

import { useState, useEffect } from "react";
import { NavLink } from "@/components/layout/NavLink";
import { MobileMenu } from "@/components/layout/MobileMenu";

const NAV_LINKS = [
  { href: "/",         label: "Inicio"    },
  { href: "/products", label: "Productos" },
  { href: "/contact",  label: "Contacto"  },
  { href: "/warranty", label: "Garantía"  },
] as const;

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      /* Consideramos "en el top" si el scroll es menor a 10px */
      const isAtTop = currentScrollY < 10;
      setAtTop(isAtTop);

      if (isAtTop) {
        /* Siempre visible en el top */
        setVisible(true);
      } else if (currentScrollY > lastScrollY) {
        /* Scrolling hacia abajo → ocultar */
        setVisible(false);
      }
      /* Scrolling hacia arriba → no hacer nada; el botón scroll-to-top
         lleva al usuario al top donde el navbar reaparece automáticamente */

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingLeft: "1.75rem",
          paddingRight: "2rem",
          backgroundColor: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          /* Animación de entrada/salida */
          transform: visible ? "translateY(0)" : "translateY(-100%)",
          opacity: visible ? 1 : 0,
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, border-color 0.3s ease",
          pointerEvents: visible ? "auto" : "none",
        }}
      >
        {/* ── Logo / Nombre ── */}
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "var(--nav-link-color)",
              letterSpacing: "0.02em",
              transition: "color 0.3s ease",
            }}
          >
            Coragem
          </span>
        </div>

        {/* ── Desktop nav (> 700px) ── */}
        <nav
          aria-label="Navegación principal"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
          className="desktop-nav"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        {/* ── Hamburger button (≤ 700px) ── */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
          className="hamburger-btn"
          style={{
            width: "2.5rem",
            height: "2.5rem",
            borderRadius: "8px",
            border: "1.5px solid var(--nav-border)",
            background: "transparent",
            cursor: "pointer",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--nav-link-color)",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--coragem-teal)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--coragem-teal)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(78, 196, 196, 0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--nav-border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--nav-link-color)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6"  x2="21" y2="6"  />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* ── Mobile sidebar ── */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 700px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}