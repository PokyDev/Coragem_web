"use client";

/**
 * app/(admin)/admin/page.tsx
 *
 * Pantalla de autenticación del panel administrativo.
 *
 * Responsabilidad: orquestar los distintos elementos de la pantalla.
 * - La lógica de interacción vive en usePatternLock.
 * - El grid visual vive en PatternLock.
 * - Los estilos del grid viven en PatternLock.module.css.
 * - Los estilos de la página (card, fondo, brand) están en el <style> de este
 *   archivo porque son exclusivos de esta ruta y no justifican un módulo propio.
 */

import { usePatternLock } from "@/hooks/admin/usePatternLock";
import { PatternLock }    from "@/components/admin/auth/PatternLock";

export default function AdminPage() {
  const {
    pattern,
    state,
    cursor,
    statusMsg,
    nodeCenters,
    wrapperRef,
    svgRef,
    handleWrapperMouseDown,
    handleWrapperMouseMove,
  } = usePatternLock();

  return (
    <div className="ap-root">
      {/* ── Fondo atmosférico ── */}
      <div className="ap-glow ap-glow--1" />
      <div className="ap-glow ap-glow--2" />
      <div className="ap-noise"           />

      {/* ── Card ── */}
      <div className="ap-card">

        {/* Marca */}
        <div className="ap-brand">
          <span className="ap-brand__logo">CORA<span>GEM</span></span>
          <span className="ap-brand__sub">Panel Administrativo</span>
        </div>

        <div className="ap-divider" />

        <p className="ap-label">Autenticación por patrón</p>

        {/* Grid interactivo */}
        <PatternLock
          pattern={pattern}
          state={state}
          cursor={cursor}
          nodeCenters={nodeCenters.current}
          svgRef={svgRef}
          wrapperRef={wrapperRef}
          onMouseDown={handleWrapperMouseDown}
          onMouseMove={handleWrapperMouseMove}
        />

        {/* Feedback de estado */}
        <div className={`ap-status ap-status--${state}`}>
          {state === "idle"    && <span className="ap-status__dot" />}
          {state === "error"   && <span className="ap-status__icon">✕</span>}
          {state === "success" && <span className="ap-status__icon ap-status__icon--ok">✓</span>}
          <span>{statusMsg}</span>
        </div>

        <p className="ap-hint">Mantén el click y arrastra para conectar los puntos</p>

      </div>

      {/* Footer */}
      <p className="ap-footer">Coragem Accessories &mdash; {new Date().getFullYear()}</p>

      {/*
       * Estilos de la página.
       * Solo afectan a ap-root, ap-card, ap-brand, ap-status y ap-hint —
       * elementos exclusivos de esta ruta que no se reutilizan en otro lugar.
       * El grid y sus nodos usan PatternLock.module.css.
       */}
      <style>{`
        .ap-root {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem 3rem;
          background-color: var(--admin-bg);
          position: relative;
          overflow: hidden;
        }

        /* ── Glows de fondo ── */
        .ap-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .ap-glow--1 {
          top: 10%; left: 20%;
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(78,196,196,0.06) 0%, transparent 70%);
        }
        .ap-glow--2 {
          bottom: 5%; right: 15%;
          width: 360px; height: 360px;
          background: radial-gradient(circle, rgba(196,122,158,0.05) 0%, transparent 70%);
        }

        /* ── Ruido de textura ── */
        .ap-noise {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 200px;
        }

        /* ── Card ── */
        .ap-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 20px;
          padding: 1.5rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow:
            0 0 0 1px rgba(78,196,196,0.07),
            0 32px 64px rgba(0,0,0,0.22),
            0 2px 4px rgba(0,0,0,0.12);
        }

        /* ── Marca ── */
        .ap-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 1rem;
        }
        .ap-brand__logo {
          font-family: var(--font-jost), sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--admin-text);
        }
        .ap-brand__logo span { color: var(--admin-accent); }
        .ap-brand__sub {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--admin-text-dim);
        }

        /* ── Divider decorativo ── */
        .ap-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--admin-border) 25%,
            rgba(78,196,196,0.3) 50%,
            var(--admin-border) 75%,
            transparent 100%
          );
          margin-bottom: 1rem;
        }

        /* ── Label de instrucción ── */
        .ap-label {
          font-family: var(--font-cormorant), serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--admin-text);
          letter-spacing: 0.02em;
          margin-bottom: 1rem;
        }

        /* ── Feedback de estado ── */
        .ap-status {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          height: 1.4rem;
          transition: color 0.2s ease;
          margin-bottom: 0.6rem;
        }
        .ap-status--idle    { color: var(--admin-text-muted); }
        .ap-status--drawing { color: var(--admin-accent);     }
        .ap-status--success { color: var(--admin-accent);     }
        .ap-status--error   { color: var(--admin-danger);     }

        .ap-status__dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--admin-text-dim);
          flex-shrink: 0;
        }
        .ap-status__icon {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--admin-danger);
        }
        .ap-status__icon--ok { color: var(--admin-accent); }

        /* ── Hint ── */
        .ap-hint {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.62rem;
          color: var(--admin-text-dim);
          letter-spacing: 0.05em;
          text-align: center;
        }

        /* ── Footer ── */
        .ap-footer {
          position: relative;
          z-index: 1;
          margin-top: 1.5rem;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          color: var(--admin-text-dim);
          text-transform: uppercase;
        }
      `}</style>
    </div>
  );
}