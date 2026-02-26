"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      style={{
        color: isActive ? "var(--nav-link-active-color)" : "var(--nav-link-color)",
        textDecoration: "none",
        fontSize: "0.875rem",
        fontFamily: "var(--font-jost), sans-serif",
        fontWeight: isActive ? "500" : "400",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "0.45rem 1rem",
        borderRadius: "6px",
        transition: "background-color 0.2s ease, color 0.2s ease",
        position: "relative",
        whiteSpace: "nowrap",
        // Underline decorativo para el ítem activo
        borderBottom: isActive
          ? "1.5px solid var(--nav-link-active-color)"
          : "1.5px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            "var(--nav-link-hover-bg)";
          (e.currentTarget as HTMLAnchorElement).style.color =
            "var(--nav-link-hover-color)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            "transparent";
          (e.currentTarget as HTMLAnchorElement).style.color =
            "var(--nav-link-color)";
        }
      }}
    >
      {label}
    </Link>
  );
}