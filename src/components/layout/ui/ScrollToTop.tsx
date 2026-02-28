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

  const scrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Liberar el foco del botón inmediatamente para evitar que el estado
    // :focus / :focus-visible quede activo cuando el botón reaparece al volver a hacer scroll.
    e.currentTarget.blur();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const icon = (
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
  );

  // Estilos CSS compartidos entre ambas variantes.
  // El hover/focus se gestiona íntegramente por CSS para evitar
  // que onMouseEnter/onMouseLeave dejen estilos inline pegados.
  const sharedStyles = `
    .stt-btn {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 50%;
      border: 1.5px solid var(--border);
      background: var(--bg-card);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      box-shadow: 0 2px 12px rgba(78, 196, 196, 0.10);
      outline: none;
      transition:
        border-color 0.25s ease,
        background 0.25s ease,
        transform 0.25s ease;
    }

    .stt-btn:hover,
    .stt-btn:focus-visible {
      border-color: var(--coragem-teal);
      background: rgba(78, 196, 196, 0.12);
      transform: translateY(-2px) scale(1.08);
    }
  `;

  /* ── Inline variant (sobre el footer, centrado) ── */
  if (variant === "inline") {
    return (
      <>
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
            className="stt-btn"
          >
            {icon}
          </button>
        </div>

        <style>{sharedStyles}</style>
      </>
    );
  }

  /* ── Fixed variant (desktop, bottom-left) ── */
  return (
    <>
      <button
        onClick={scrollToTop}
        aria-label="Volver al inicio de la página"
        className="stt-btn"
        style={{
          opacity: show ? 1 : 0,
          pointerEvents: show ? "auto" : "none",
          transform: show
            ? "translateY(0) scale(1)"
            : "translateY(8px) scale(0.85)",
          transition:
            "opacity 0.35s cubic-bezier(0.4,0,0.2,1), transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.25s ease, background 0.25s ease",
        }}
      >
        {icon}
      </button>

      <style>{sharedStyles}</style>
    </>
  );
}