"use client";

// Config import
import { INSTAGRAM_URL, buildWhatsAppUrl } from "@/lib/config";

import Image from "next/image";
import { useState } from "react";

/* ─── Instagram Profile Card ─────────────────────────────────────── */
function InstagramCard() {
  const [hoveringProfile, setHoveringProfile] = useState(false);

  const highlights = [
    { label: "✨ Conjuntos .",     image: "conjuntos.jpg"     },
    { label: "✨ Anillos .",       image: "anillos.jpg"       },
    { label: "✨ Cadenas .",       image: "cadenas_dijes.jpg" },
    { label: "✨ Aretes .",        image: "aretes.jpg"        },
  ];

  return (
    <div
      className="ig-card"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "2rem",
        flex: "1 1 420px",
        maxWidth: "520px",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
        opacity: 0,
        animation: "fadeInUp 0.55s ease forwards",
        animationDelay: "0.1s",
      }}
    >
      {/* ── Profile row ── */}
      <div
        className="profile-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        {/* Avatar with hover overlay */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver perfil de Coragem en Instagram"
          onMouseEnter={() => setHoveringProfile(true)}
          onMouseLeave={() => setHoveringProfile(false)}
          style={{
            position: "relative",
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            flexShrink: 0,
            textDecoration: "none",
            display: "block",
          }}
        >
          {/* Instagram gradient ring */}
          <div
            style={{
              position: "absolute",
              inset: "-1px",
              borderRadius: "50%",
              background:
                "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
              zIndex: 0,
              transition: "opacity 0.25s ease",
              opacity: hoveringProfile ? 1 : 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "2px",
              borderRadius: "50%",
              backgroundColor: "var(--bg-card)",
              zIndex: 1,
              transition: "background-color 0.3s ease",
            }}
          />
          <Image
            src="/images/ig_img/profile.jpg"
            alt="Foto de perfil de Coragem Accessories"
            fill
            sizes="96px"
            style={{
              objectFit: "cover",
              borderRadius: "50%",
              zIndex: 2,
              padding: "3px",
              transition: "opacity 0.3s ease",
              opacity: hoveringProfile ? 0.45 : 1,
            }}
          />

          {/* Hover overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: hoveringProfile ? 1 : 0,
              transition: "opacity 0.3s ease",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.58rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#ffffff",
                textAlign: "center",
                lineHeight: 1.3,
                padding: "0 4px",
              }}
            >
              Ver
              <br />
              perfil
            </span>
          </div>
        </a>

        {/* Username + stats */}
        <div style={{ flex: 1 }}>
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "0.02em",
              marginBottom: "0.15rem",
            }}
          >
            coragem_accesorios
          </p>
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.78rem",
              color: "var(--text-secondary)",
              marginBottom: "0.75rem",
            }}
          >
            Coragem Accessories
          </p>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "1.25rem",
            }}
          >
            {[
              { value: "18",   label: "publicaciones" },
              { value: "1144", label: "seguidores"    },
              { value: "372",  label: "seguidos"      },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <p
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    lineHeight: 1.1,
                  }}
                >
                  {stat.value}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.65rem",
                    color: "var(--text-secondary)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bio ── */}
      <div
        style={{
          marginBottom: "1.5rem",
          padding: "0.875rem 1rem",
          borderRadius: "12px",
          backgroundColor: "var(--bg)",
          border: "1px solid var(--border)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "0.5rem",
          }}
        >
          Accesorios
        </p>
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.8rem",
            color: "var(--text-primary)",
            lineHeight: 1.7,
          }}
        >
          ✨ Accesorios que inspiran
          <br />
          ✨ Atrévete a brillar
          <br />
          ✨ Los mejores diseños
          <br />
          📍 Piedecuesta - Bucaramanga
        </p>
      </div>

      {/* ── Gradient divider ── */}
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
          opacity: 0.2,
          marginBottom: "1.25rem",
        }}
      />

      {/* ── Highlights ── */}
      <div
        className="highlights-card"
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {highlights.map((hl, i) => (
          <HighlightBubble key={hl.label} highlight={hl} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Highlight Bubble ───────────────────────────────────────────── */
function HighlightBubble({
  highlight,
  index,
}: {
  highlight: { label: string; image: string };
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.5rem",
        textDecoration: "none",
        opacity: 0,
        animation: "fadeInUp 0.45s ease forwards",
        animationDelay: `${0.25 + index * 0.08}s`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Circle image with gradient ring */}
      <div
        style={{
          position: "relative",
          width: "64px",
          height: "64px",
          borderRadius: "50%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-2.5px",
            borderRadius: "50%",
            background:
              "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            zIndex: 0,
            transition: "opacity 0.25s ease",
            opacity: hovered ? 1 : 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "2px",
            borderRadius: "50%",
            overflow: "hidden",
            zIndex: 1,
          }}
        >
          <Image
            src={`/images/ig_img/${highlight.image}`}
            alt={highlight.label}
            fill
            sizes="64px"
            style={{
              objectFit: "cover",
              transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
              transform: hovered ? "scale(1.1)" : "scale(1)",
            }}
          />
        </div>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.62rem",
          color: hovered ? "var(--text-primary)" : "var(--text-secondary)",
          letterSpacing: "0.04em",
          textAlign: "center",
          transition: "color 0.2s ease",
          whiteSpace: "nowrap",
        }}
      >
        {highlight.label}
      </span>
    </a>
  );
}

/* ─── Social Links Panel ─────────────────────────────────────────── */
function SocialPanel() {
  const [igHovered, setIgHovered] = useState(false);
  const [waHovered, setWaHovered] = useState(false);

  return (
    <div
      style={{
        flex: "1 1 280px",
        maxWidth: "360px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "1.25rem",
        opacity: 0,
        animation: "fadeInUp 0.55s ease forwards",
        animationDelay: "0.2s",
      }}
    >
      {/* Section title */}
      <div>
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.6rem",
            textAlign: "center",
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            marginBottom: "0.5rem",
          }}
        >
          Redes Sociales
        </p>
        <div
          style={{
            height: "1px",
            background:
              "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 40%, transparent 100%)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Instagram Button */}
      <SocialButton
        href={INSTAGRAM_URL}
        hovered={igHovered}
        onHover={setIgHovered}
        accentColor="#dc2743"
        accentBg="rgba(220, 39, 67, 0.07)"
        icon={<InstagramIcon />}
        label="Instagram"
        handle="@coragem_accesorios"
        description="Descubre nuestras últimas colecciones y publicaciones."
        index={0}
      />

      {/* WhatsApp Button */}
      <SocialButton
        href={buildWhatsAppUrl()}
        hovered={waHovered}
        onHover={setWaHovered}
        accentColor="#25D366"
        accentBg="rgba(37, 211, 102, 0.07)"
        icon={<WhatsAppIcon />}
        label="WhatsApp"
        handle="+57 324 657 1248"
        description="Chatea con nosotros directamente para consultas y pedidos."
        index={1}
      />

      {/* Footer note */}
      <div
        style={{
          padding: "1rem",
          borderRadius: "12px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-card)",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          opacity: 0,
          animation: "fadeInUp 0.45s ease forwards",
          animationDelay: "0.55s",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.72rem",
            color: "var(--text-secondary)",
            lineHeight: 1.7,
            letterSpacing: "0.03em",
          }}
        >
          ✦ Respondemos en horario de atención.
          <br />
          ✦ Todos los pedidos se coordinan por mensaje directo.
        </p>
      </div>
    </div>
  );
}

/* ─── Reusable Social Button ─────────────────────────────────────── */
interface SocialButtonProps {
  href: string;
  hovered: boolean;
  onHover: (v: boolean) => void;
  accentColor: string;
  accentBg: string;
  icon: React.ReactNode;
  label: string;
  handle: string;
  description: string;
  index: number;
}

function SocialButton({
  href,
  hovered,
  onHover,
  accentColor,
  accentBg,
  icon,
  label,
  handle,
  description,
  index,
}: SocialButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "1rem",
        padding: "1.1rem 1.25rem",
        borderRadius: "16px",
        border: "1px solid",
        borderColor: hovered ? accentColor : "var(--border)",
        backgroundColor: hovered ? accentBg : "var(--bg-card)",
        textDecoration: "none",
        transition:
          "border-color 0.3s ease, background-color 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 8px 24px ${accentColor}22`
          : "none",
        opacity: 0,
        animation: "fadeInUp 0.45s ease forwards",
        animationDelay: `${0.3 + index * 0.1}s`,
        cursor: "pointer",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          backgroundColor: hovered ? accentColor : "var(--bg)",
          border: `1.5px solid`,
          borderColor: hovered ? accentColor : "var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          color: hovered ? "#ffffff" : accentColor,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            marginBottom: "0.15rem",
            transition: "color 0.2s ease",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.75rem",
            color: hovered ? accentColor : "var(--text-secondary)",
            letterSpacing: "0.03em",
            marginBottom: "0.35rem",
            transition: "color 0.25s ease",
          }}
        >
          {handle}
        </p>
        <p
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.7rem",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            letterSpacing: "0.02em",
          }}
        >
          {description}
        </p>
      </div>

      {/* Arrow */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke={hovered ? accentColor : "var(--text-secondary)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          flexShrink: 0,
          marginTop: "2px",
          transition: "stroke 0.25s ease, transform 0.25s ease",
          transform: hovered ? "translate(2px, -2px)" : "translate(0,0)",
        }}
      >
        <line x1="7" y1="17" x2="17" y2="7" />
        <polyline points="7 7 17 7 17 17" />
      </svg>
    </a>
  );
}

/* ─── Icons ──────────────────────────────────────────────────────── */
function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
export function ContactBody() {
  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "0",
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
        className="contact-layout"
      >
        <InstagramCard />
        <SocialPanel />
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Breakpoint: layout en columna ≤ 1000px ── */
        @media (max-width: 1000px) {
          .contact-layout {
            flex-direction: column !important;
            align-items: center !important;
            gap: 3rem !important;
          }
          .contact-layout > * {
            max-width: 100% !important;
            width: 100% !important;
          }
        }

        /* ── Breakpoint: ig-card profile-row centrado ≤ 500px ── */
        @media (max-width: 500px) {
          .profile-row {
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .profile-row > div {
            align-items: center !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .profile-row > div > div {
            justify-content: center !important;
          }
          .highlights-card {
            justify-content: center !important;
          }
        }
      `}</style>
    </>
  );
}