import type { Metadata } from "next";
import { ContactBody } from "@/components/user/contact/ContactBody";

/* ─── SEO ────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: "Contacto — Coragem Accessories",
  description:
    "Contáctanos a través de nuestras redes sociales. Estamos en Instagram y WhatsApp para atenderte.",
};

/* ─── Page: Server Component ─────────────────────────────────────── */
export default function ContactPage() {
  return (
    <main
      style={{
        minHeight: "calc(100dvh - 72px)",
        backgroundColor: "var(--bg)",
        transition: "background-color 0.3s ease",
        paddingBottom: "5rem",
      }}
    >
      {/* ── Page Header ── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2.5rem 1.5rem 0",
        }}
      >
        {/* Decorative top line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent 0%, var(--border) 100%)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
            }}
          >
            Coragem Accessories
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background:
                "linear-gradient(90deg, var(--border) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Title block */}
        <div style={{ marginBottom: "0.75rem" }}>
          <h1
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "0.02em",
              background:
                "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.5rem",
            }}
          >
            Contacto
          </h1>
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              textAlign: "justify",
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              letterSpacing: "0.04em",
              lineHeight: 1.7,
              maxWidth: "520px",
            }}
          >
            Estamos aquí para ayudarte. Encuéntranos en nuestras redes sociales
            o inicia una conversación directamente con nosotros.
          </p>
        </div>

        {/* Bottom divider */}
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 40%, transparent 100%)",
            opacity: 0.3,
            marginBottom: "2.5rem",
          }}
        />
      </section>

      {/* ── Contact body ── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <ContactBody />
      </section>
    </main>
  );
}