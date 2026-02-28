"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
  mobile?: boolean;
}

export function NavLink({ href, label, mobile = false }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (mobile) {
    return (
      <>
        <Link
          href={href}
          data-active={isActive}
          className="navlink-mobile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
            fontSize: "1rem",
            fontFamily: "var(--font-jost), sans-serif",
            fontWeight: isActive ? "500" : "400",
            letterSpacing: "0.1em",
            textTransform: "uppercase" as const,
            padding: "0.875rem 1rem",
            borderRadius: "8px",

            /* Estado activo via CSS variable para evitar conflicto con :hover */
            color: isActive ? "var(--coragem-pink)" : "var(--nav-link-color)",
            borderLeft: isActive
              ? "2.5px solid var(--coragem-pink)"
              : "2.5px solid transparent",
            backgroundColor: isActive
              ? "rgba(196, 122, 158, 0.08)"
              : "transparent",
          }}
        >
          {label}
        </Link>

        <style>{`
          .navlink-mobile {
            transition: background-color 0.2s ease, color 0.2s ease, border-left-color 0.2s ease;
          }

          /* Hover solo cuando NO está activo */
          .navlink-mobile:not([data-active="true"]):hover {
            background-color: var(--nav-link-hover-bg) !important;
            color: var(--coragem-teal) !important;
            border-left-color: var(--coragem-teal) !important;
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Link
        href={href}
        data-active={isActive}
        className="navlink-desktop"
        style={{
          textDecoration: "none",
          fontSize: "0.875rem",
          fontFamily: "var(--font-jost), sans-serif",
          fontWeight: isActive ? "500" : "400",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
          padding: "0.45rem 1rem",
          borderRadius: "6px",
          position: "relative" as const,
          whiteSpace: "nowrap" as const,

          color: isActive
            ? "var(--nav-link-active-color)"
            : "var(--nav-link-color)",
          borderBottom: isActive
            ? "1.5px solid var(--nav-link-active-color)"
            : "1.5px solid transparent",
        }}
      >
        {label}
      </Link>

      <style>{`
        .navlink-desktop {
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        /* Hover solo cuando NO está activo */
        .navlink-desktop:not([data-active="true"]):hover {
          background-color: var(--nav-link-hover-bg) !important;
          color: var(--nav-link-hover-color) !important;
        }
      `}</style>
    </>
  );
}