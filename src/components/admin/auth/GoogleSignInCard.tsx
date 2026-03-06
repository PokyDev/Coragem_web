"use client";

/**
 * src/components/admin/auth/GoogleSignInCard.tsx
 *
 * Tarjeta de inicio de sesión con Google.
 * Redirige al endpoint OAuth del backend, que se encarga de todo el
 * flujo y al finalizar setea la cookie HttpOnly y redirige al dashboard.
 */

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  return url;
}

function GoogleLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
      <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
      <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
      <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
    </svg>
  );
}

export function GoogleSignInCard() {
  const handleGoogleSignIn = () => {
    window.location.href = `${getApiBase()}/api/auth/google`;
  };

  return (
    <div className="gc-card">
      <div className="gc-logo-wrap" aria-hidden="true">
        <GoogleLogo size={40} />
      </div>

      <div className="gc-copy">
        <p className="gc-title">Verificación de identidad</p>
        <p className="gc-sub">
          Confirma tu acceso con la cuenta de Google autorizada para administrar Coragem.
        </p>
      </div>

      <div className="gc-divider" />

      <button
        onClick={handleGoogleSignIn}
        className="gc-btn"
        type="button"
        aria-label="Continuar con Google"
      >
        <span className="gc-btn__icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
            <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
            <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
            <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
            <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
          </svg>
        </span>
        <span className="gc-btn__label">Continuar con Google</span>
      </button>

      <style>{`
        .gc-card {
          width: 100%;
          background: var(--admin-bg-card);
          border: 1px solid var(--admin-border);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          box-shadow: var(--admin-shadow-card-subtle);
        }
        .gc-logo-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          background: var(--admin-surface);
          border: 1px solid var(--admin-border);
          margin-bottom: 1rem;
          box-shadow: var(--admin-shadow-logo);
        }
        .gc-copy { text-align: center; margin-bottom: 1.1rem; }
        .gc-title {
          font-family: var(--font-cormorant), serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--admin-text);
          letter-spacing: 0.02em;
          margin-bottom: 0.4rem;
        }
        .gc-sub {
          font-family: var(--font-jost), sans-serif;
          font-size: 0.68rem;
          color: var(--admin-text-muted);
          letter-spacing: 0.03em;
          line-height: 1.65;
          max-width: 280px;
          margin: 0 auto;
        }
        .gc-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, var(--admin-border) 25%, rgba(78,196,196,0.2) 50%, var(--admin-border) 75%, transparent 100%);
          margin-bottom: 1.1rem;
        }
        .gc-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.65rem;
          width: 100%;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          border: 1px solid var(--admin-border);
          background: var(--admin-surface);
          cursor: pointer;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.06em;
          color: var(--admin-text);
          transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .gc-btn:hover {
          background: var(--admin-hover-bg);
          border-color: rgba(78, 196, 196, 0.35);
          box-shadow: 0 0 0 1px rgba(78, 196, 196, 0.15);
          transform: translateY(-1px);
        }
        .gc-btn:active { transform: translateY(0); box-shadow: none; }
        .gc-btn__icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .gc-btn__label { flex: 1; text-align: center; }

        /* ── Responsive: ocultar borde en móvil ── */
        @media (max-width: 600px) {
          .gc-card { border-color: transparent; box-shadow: none; }
        }
      `}</style>
    </div>
  );
}