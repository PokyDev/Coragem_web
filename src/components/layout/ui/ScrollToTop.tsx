"use client";

import { useEffect, useState } from "react";

interface ScrollToTopProps {
  /** "fixed" → botón posicionado fixed (desktop)
   *  "inline" → botón renderizado en el flujo normal del documento (mobile/sobre el footer) */
  variant?: "fixed" | "inline";
}

export function ScrollToTop({ variant = "fixed" }: ScrollToTopProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ── Inline variant (aparece sobre el footer, centrado) ── */
  if (variant === "inline") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "1.25rem 0",
          opacity: show ? 1 : 0,
          pointerEvents: show ? "auto" : "none",
          transform: show ? "translateY(0)" : "translateY(8px)",
          transition:
            "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <button
          onClick={scrollToTop}
          aria-label="Volver al inicio de la página"
          style={{
            width: "2.75rem",
            height: "2.75rem",
            borderRadius: "50%",
            border: "1.5px solid var(--border)",
            background: "var(--bg-card)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            boxShadow: "0 2px 12px rgba(78, 196, 196, 0.10)",
            transition:
              "border-color 0.25s ease, background 0.25s ease, transform 0.25s ease",
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
            el.style.transform = "translateY(0) scale(1)";
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
      </div>
    );
  }

  /* ── Fixed variant (desktop, bottom-left) ── */
  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver al inicio de la página"
      style={{
        width: "2.75rem",
        height: "2.75rem",
        borderRadius: "50%",
        border: "1.5px solid var(--border)",
        background: "var(--bg-card)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition:
          "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.25s ease, background 0.25s ease",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        opacity: show ? 1 : 0,
        pointerEvents: show ? "auto" : "none",
        transform: show ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)",
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
        el.style.transform = show ? "translateY(0) scale(1)" : "translateY(8px) scale(0.85)";
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
  );
}