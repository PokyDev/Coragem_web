"use client";

/**
 * src/components/admin/auth/PatternCard.tsx
 *
 * Tarjeta de autenticación por patrón de desbloqueo.
 *
 * Extraída de app/(admin)/admin/page.tsx para permitir que el page
 * orqueste múltiples tarjetas en secuencia.
 *
 * Props:
 *   onPatternSuccess — se invoca cuando el patrón es válido (≥ MIN_NODES).
 *   onPatternReset   — se invoca cuando el patrón se resetea a idle.
 */

import { useEffect, useRef } from "react";
import { usePatternLock } from "@/hooks/admin/usePatternLock";
import { PatternLock }    from "@/components/admin/auth/PatternLock";

interface PatternCardProps {
  onPatternSuccess: () => void;
  onPatternReset:   () => void;
}

export function PatternCard({ onPatternSuccess, onPatternReset }: PatternCardProps) {
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

  /*
   * Elevar eventos de ciclo de vida al page.
   * Usamos refs para evitar que las callbacks queden en closures viejos.
   */
  const onSuccessRef = useRef(onPatternSuccess);
  const onResetRef   = useRef(onPatternReset);

  useEffect(() => { onSuccessRef.current = onPatternSuccess; }, [onPatternSuccess]);
  useEffect(() => { onResetRef.current   = onPatternReset;   }, [onPatternReset]);

  useEffect(() => {
    if (state === "success") {
      onSuccessRef.current();
    }
    if (state === "idle") {
      onResetRef.current();
    }
  }, [state]);

  return (
    <div className="pc-card">
      {/* Marca */}
      <div className="pc-brand">
        <span className="pc-brand__logo">CORA<span>GEM</span></span>
        <span className="pc-brand__sub">Panel Administrativo</span>
      </div>

      <div className="pc-divider" />

      <p className="pc-label">Autenticación por patrón</p>

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
      <div className={`pc-status pc-status--${state}`}>
        {state === "idle"    && <span className="pc-status__dot" />}
        {state === "error"   && <span className="pc-status__icon">✕</span>}
        {state === "success" && <span className="pc-status__icon pc-status__icon--ok">✓</span>}
        <span>{statusMsg}</span>
      </div>

      { /* <p className="pc-hint">Mantén el click y arrastra para conectar los puntos</p> */}

      <style>{`
        /* ── Card ── */
        .pc-card {
          width: 100%;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 20px;
          padding: 1.5rem 2rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: var(--admin-shadow-card);
        }

        /* ── Marca ── */
        .pc-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 1rem;
        }
        .pc-brand__logo {
          font-family: var(--font-jost), sans-serif;
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--admin-text);
        }
        .pc-brand__logo span { color: var(--admin-accent); }
        .pc-brand__sub {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.58rem;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--admin-text-dim);
        }

        /* ── Divider decorativo ── */
        .pc-divider {
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

        /* ── Label ── */
        .pc-label {
          font-family: var(--font-cormorant), serif;
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--admin-text);
          letter-spacing: 0.02em;
          margin-bottom: 1rem;
        }

        /* ── Estado ── */
        .pc-status {
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
        .pc-status--idle    { color: var(--admin-text-muted); }
        .pc-status--drawing { color: var(--admin-accent);     }
        .pc-status--success { color: var(--admin-accent);     }
        .pc-status--error   { color: var(--admin-danger);     }

        .pc-status__dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: var(--admin-text-dim);
          flex-shrink: 0;
        }
        .pc-status__icon {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--admin-danger);
        }
        .pc-status__icon--ok { color: var(--admin-accent); }

        /* ── Hint ── */
        .pc-hint {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.62rem;
          color: var(--admin-text-dim);
          letter-spacing: 0.05em;
          text-align: center;
        }
      `}</style>
    </div>
  );
}