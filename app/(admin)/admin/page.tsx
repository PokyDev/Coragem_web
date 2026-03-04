"use client";

/**
 * app/(admin)/admin/page.tsx
 *
 * Placeholder informativo para la ruta /admin.
 * Autenticación pendiente de implementar.
 * Reemplazar este componente cuando se integre el sistema de auth.
 *
 * Incluye un ThemeToggle flotante (variant="admin") en la esquina
 * inferior izquierda, coherente con el patrón de FloatingControls
 * del sitio público.
 */

import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";

export default function AdminPage() {
  return (
    <div className="admin-placeholder">
      {/* ── Glow de fondo ── */}
      <div className="admin-placeholder__glow" aria-hidden="true" />

      {/* ── Panel central ── */}
      <div className="admin-placeholder__card">
        {/* Logo / marca */}
        <div className="admin-placeholder__brand">
          <span className="admin-placeholder__brand-text">
            CORA<span>GEM</span>
          </span>
          <span className="admin-placeholder__brand-sub">Panel Administrativo</span>
        </div>

        {/* Divisor decorativo */}
        <div className="admin-placeholder__divider" aria-hidden="true" />

        {/* Icono de estado */}
        <div className="admin-placeholder__icon-wrap" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--admin-accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Mensaje */}
        <h1 className="admin-placeholder__title">Acceso restringido</h1>
        <p className="admin-placeholder__body">
          El sistema de autenticación para este panel está en desarrollo.
          Próximamente podrás iniciar sesión con tus credenciales de administrador.
        </p>

        {/* Chip de estado */}
        <div className="admin-placeholder__badge">
          <span className="admin-placeholder__badge-dot" aria-hidden="true" />
          Autenticación · En desarrollo
        </div>
      </div>

      {/* ── ThemeToggle flotante (mismo patrón que FloatingControls público) ── */}
      <div className="admin-placeholder__floating">
        <ThemeToggle variant="admin" />
      </div>

      {/* ── Footer ── */}
      <p className="admin-placeholder__footer">
        Coragem Accessories &mdash; {new Date().getFullYear()}
      </p>

      <style>{`
        .admin-placeholder {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.25rem 3rem;
          background-color: var(--admin-bg);
          position: relative;
          overflow: hidden;
          /* Transición suave al cambiar de tema */
          transition: background-color 0.3s ease;
        }

        .admin-placeholder__glow {
          position: absolute;
          top: 50%;
          left: 50%;
          translate: -50% -50%;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(78, 196, 196, 0.07) 0%,
            transparent 70%
          );
          pointer-events: none;
          transition: background 0.3s ease;
        }

        .admin-placeholder__card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 380px;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow:
            0 0 0 1px rgba(78, 196, 196, 0.06),
            0 24px 56px rgba(0, 0, 0, 0.18);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .admin-placeholder__brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          margin-bottom: 1.5rem;
        }

        .admin-placeholder__brand-text {
          font-family: var(--font-jost), sans-serif;
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--admin-text);
          transition: color 0.3s ease;
        }

        .admin-placeholder__brand-text span {
          color: var(--admin-accent);
        }

        .admin-placeholder__brand-sub {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--admin-text-dim);
          transition: color 0.3s ease;
        }

        .admin-placeholder__divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--admin-border) 30%,
            rgba(78, 196, 196, 0.3) 50%,
            var(--admin-border) 70%,
            transparent 100%
          );
          margin-bottom: 1.75rem;
          transition: background 0.3s ease;
        }

        .admin-placeholder__icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: rgba(78, 196, 196, 0.08);
          border: 1px solid rgba(78, 196, 196, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.25rem;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .admin-placeholder__title {
          font-family: var(--font-cormorant), serif;
          font-size: 1.5rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--admin-text);
          text-align: center;
          margin-bottom: 0.65rem;
          transition: color 0.3s ease;
        }

        .admin-placeholder__body {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.78rem;
          line-height: 1.7;
          color: var(--admin-text-muted);
          text-align: center;
          max-width: 280px;
          margin-bottom: 1.75rem;
          transition: color 0.3s ease;
        }

        .admin-placeholder__badge {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.85rem;
          border-radius: 6px;
          background: var(--stock-low-bg);
          color: var(--admin-warning);
          font-family: var(--font-jost), sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.3s ease, color 0.3s ease;
        }

        .admin-placeholder__badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--admin-warning);
          flex-shrink: 0;
          transition: background 0.3s ease;
        }

        /* ThemeToggle flotante — esquina inferior izquierda */
        .admin-placeholder__floating {
          position: fixed;
          bottom: 1.25rem;
          left: 1.25rem;
          z-index: 50;
        }

        .admin-placeholder__footer {
          position: relative;
          z-index: 1;
          margin-top: 2rem;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.1em;
          color: var(--admin-text-dim);
          text-transform: uppercase;
          transition: color 0.3s ease;
        }
      `}</style>
    </div>
  );
}