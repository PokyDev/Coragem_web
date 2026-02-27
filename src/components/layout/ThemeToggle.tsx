"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { BrandIcon } from "@/components/layout/BrandIcon";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => setMounted(true), []);

  /* Mostrar botón scroll-to-top cuando el usuario no está en el top */
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.25rem",
        left: "1.25rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.875rem",
        zIndex: 50,
      }}
    >
      {/* ── Botón scroll-to-top ── */}
      <button
        onClick={scrollToTop}
        aria-label="Volver al inicio de la página"
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "1.5px solid",
          borderColor: "var(--border)",
          background: "var(--bg-card)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.25s ease, background 0.25s ease",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? "auto" : "none",
          transform: showScrollTop ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
          boxShadow: "0 2px 12px rgba(78, 196, 196, 0.10)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = "var(--coragem-teal)";
          el.style.background = "rgba(78, 196, 196, 0.12)";
          el.style.transform = "translateY(-2px) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = "var(--border)";
          el.style.background = "var(--bg-card)";
          el.style.transform = showScrollTop ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--coragem-teal)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* ── Ícono de marca ── */}
      <BrandIcon size={52} />

      {/* ── Botón cambio de tema ── */}
      <button
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
        style={{
          width: "2.75rem",
          height: "2.75rem",
          borderRadius: "50%",
          border: "1.5px solid",
          borderColor: isDark ? "var(--coragem-teal)" : "var(--coragem-pink)",
          background: isDark
            ? "rgba(78, 196, 196, 0.08)"
            : "rgba(196, 122, 158, 0.08)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = "scale(1.1)";
          el.style.background = isDark
            ? "rgba(78, 196, 196, 0.2)"
            : "rgba(196, 122, 158, 0.2)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.transform = "scale(1)";
          el.style.background = isDark
            ? "rgba(78, 196, 196, 0.08)"
            : "rgba(196, 122, 158, 0.08)";
        }}
      >
        {isDark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="var(--coragem-teal)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="var(--coragem-pink)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
}