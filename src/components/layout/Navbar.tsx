import Image from "next/image";
import { NavLink } from "@/components/layout/NavLink";

/* Rutas de navegación — agrega o quita aquí según crezca el proyecto */
const NAV_LINKS = [
  { href: "/",         label: "Inicio"    },
  { href: "/products", label: "Productos" },
  { href: "/contact",  label: "Contacto"  },
  { href: "/warranty", label: "Garantía"  },
] as const;

export function Navbar() {
  return (
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
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      {/* Nombre de la empresa */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
         <span
          style={{
            fontFamily: "var(--font-jost), sans-serif",
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

      {/* ── Links de navegación ── */}
      <nav
        aria-label="Navegación principal"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} />
        ))}
      </nav>
    </header>
  );
}