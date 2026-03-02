"use client";

/* ─── Icons ─────────────────────────────────────────────────────── */
function ArrowDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 6 15 12 9 18" />
    </svg>
  );
}

/* ─── Types ──────────────────────────────────────────────────────── */
type LoadMoreVariant = "catalog" | "landing";

interface LoadMoreButtonProps {
  variant: LoadMoreVariant;
  onClick?: () => void;
}

/* ─── Variant config ─────────────────────────────────────────────── */
const CONFIG = {
  catalog: {
    label: "Ver más productos",
    icon: <ArrowDownIcon />,
    disabled: true,
    className: "load-more-btn load-more-btn--catalog",
  },
  landing: {
    label: "Revisar Catálogo Entero",
    icon: <ArrowRightIcon />,
    disabled: false,
    className: "load-more-btn load-more-btn--landing",
  },
} satisfies Record<LoadMoreVariant, {
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  className: string;
}>;

/* ─── Component ──────────────────────────────────────────────────── */
export function LoadMoreButton({ variant, onClick }: LoadMoreButtonProps) {
  const { label, icon, disabled, className } = CONFIG[variant];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}>
        <button
          disabled={disabled}
          onClick={!disabled ? onClick : undefined}
          title={disabled ? "Próximamente" : undefined}
          className={className}
        >
          <span>{label}</span>
          {icon}
        </button>
      </div>

      <style>{`
        /* ── Base ── */
        .load-more-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.7rem 2rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent;
          font-family: var(--font-jost), sans-serif;
          font-size: 0.78rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease, transform 0.2s ease;
        }

        /* ── Catalog variant: deshabilitado ── */
        .load-more-btn--catalog {
          color: var(--text-secondary);
          cursor: not-allowed;
          opacity: 0.6;
        }

        /* ── Landing variant: habilitado ── */
        .load-more-btn--landing {
          color: var(--coragem-teal);
          border-color: var(--coragem-teal);
          cursor: pointer;
          opacity: 1;
        }

        .load-more-btn--landing:hover {
          background: var(--coragem-teal);
          color: var(--coragem-white);
          border-color: var(--coragem-teal);
          transform: translateY(-1px);
        }

        /* Dark theme: landing hover usa teal con fondo oscuro */
        .dark .load-more-btn--landing {
          color: var(--coragem-teal);
          border-color: rgba(78, 196, 196, 0.5);
        }

        .dark .load-more-btn--landing:hover {
          background: rgba(78, 196, 196, 0.15);
          color: var(--coragem-teal);
          border-color: var(--coragem-teal);
        }
      `}</style>
    </>
  );
}