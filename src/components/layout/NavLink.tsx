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
      <Link
        href={href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          color: isActive ? "var(--coragem-pink)" : "var(--nav-link-color)",
          textDecoration: "none",
          fontSize: "1rem",
          fontFamily: "var(--font-jost), sans-serif",
          fontWeight: isActive ? "500" : "400",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0.875rem 1rem",
          borderRadius: "8px",
          borderLeft: isActive
            ? "2.5px solid var(--coragem-pink)"
            : "2.5px solid transparent",
          backgroundColor: isActive
            ? "rgba(196, 122, 158, 0.08)"
            : "transparent",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "var(--nav-link-hover-bg)";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--coragem-teal)";
            (e.currentTarget as HTMLAnchorElement).style.borderLeftColor =
              "var(--coragem-teal)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
              "transparent";
            (e.currentTarget as HTMLAnchorElement).style.color =
              "var(--nav-link-color)";
            (e.currentTarget as HTMLAnchorElement).style.borderLeftColor =
              "transparent";
          }
        }}
      >
        {label}
      </Link>
    );
  }

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