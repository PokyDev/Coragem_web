"use client";

/**
 * app/(admin)/admin/page.tsx
 *
 * Pantalla de autenticación del panel administrativo.
 *
 * Orquesta dos tarjetas en secuencia:
 *   1. PatternCard  — grid 3×3 de desbloqueo por patrón (siempre visible).
 *   2. GoogleSignInCard — aparece con fade-in tras un patrón válido (≥ 4 nodos).
 *
 * El estado `showGoogle` vive aquí y se eleva desde PatternCard via
 * el callback `onPatternSuccess`. Los estilos exclusivos de esta ruta
 * (fondo, layout, glows) viven en el <style> inline; los de cada
 * tarjeta viven en sus propios componentes.
 */

import { useState, useCallback } from "react";
import { PatternCard }      from "@/components/admin/auth/PatternCard";
import { GoogleSignInCard } from "@/components/admin/auth/GoogleSignInCard";

export default function AdminPage() {
  const [showGoogle, setShowGoogle] = useState(false);

  const handlePatternSuccess = useCallback(() => {
    setShowGoogle(true);
  }, []);

  const handlePatternReset = useCallback(() => {
    setShowGoogle(false);
  }, []);

  return (
    <div className="ap-root">
      {/* ── Fondo atmosférico ── */}
      <div className="ap-glow ap-glow--1" />
      <div className="ap-glow ap-glow--2" />
      <div className="ap-noise" />

      {/* ── Área central: dos tarjetas apiladas ── */}
      <div className="ap-stack">

        {/* Tarjeta 1: patrón de desbloqueo */}
        <PatternCard
          onPatternSuccess={handlePatternSuccess}
          onPatternReset={handlePatternReset}
        />

        {/* Tarjeta 2: inicio de sesión con Google */}
        <div
          className={`ap-google-wrapper ${showGoogle ? "ap-google-wrapper--visible" : ""}`}
          aria-hidden={!showGoogle}
        >
          <GoogleSignInCard />
        </div>

      </div>

      {/* Footer */}
      <p className="ap-footer">
        Coragem Accessories &mdash; {new Date().getFullYear()}
      </p>

      <style>{`
        /* ── Root ── */
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

        /* ── Glows ── */
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

        /* ── Stack de tarjetas ── */
        .ap-stack {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 1rem;
        }

        /* ── Wrapper de la tarjeta Google con fade ── */
        .ap-google-wrapper {
          opacity: 0;
          pointer-events: none;
          transform: translateY(8px);
          transition:
            opacity    0.4s cubic-bezier(0.4, 0, 0.2, 1),
            transform  0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .ap-google-wrapper--visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
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