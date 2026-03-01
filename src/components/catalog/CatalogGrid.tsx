"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/catalog";

/* ─── Format price ──────────────────────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/* ─── No-Stock ribbon ───────────────────────────────────────────── */
function NoStockRibbon() {
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(15, 26, 42, 0.42)",
          zIndex: 1,
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "22px",
          left: "-34px",
          width: "140px",
          padding: "5px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
          transform: "rotate(-38deg)",
          zIndex: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize: "0.6rem",
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#ffffff",
            whiteSpace: "nowrap",
          }}
        >
          Sin Stock
        </span>
      </div>
    </>
  );
}

/* ─── Product Card ──────────────────────────────────────────────── */
function ProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const outOfStock = product.stock === 0;

  return (
    /*
     * display: flex + height: 100% en el Link garantiza que la tarjeta
     * ocupe toda la altura de su celda en el grid, permitiendo que
     * CSS Grid iguale automáticamente las alturas de cada fila.
     */
    <Link
      href={`/products/${product.id}`}
      style={{
        display: "flex",
        height: "100%",
        textDecoration: "none",
        opacity: 0,
        animation: `fadeInCard 0.45s ease forwards`,
        animationDelay: `${index * 0.06}s`,
      }}
    >
      <article
        className="catalog-card"
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          borderRadius: "16px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--bg-card)",
          overflow: "hidden",
          transition:
            "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s ease",
          cursor: outOfStock ? "default" : "pointer",
          opacity: outOfStock ? 0.82 : 1,
        }}
      >
        {/* Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            backgroundColor: "var(--bg)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={`/images/products/${product.image}`}
            alt={product.name}
            fill
            sizes="(max-width: 400px) 50vw, (max-width: 600px) 50vw, 33vw"
            style={{
              objectFit: "cover",
              transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
            }}
            className="catalog-card-img"
          />
          {outOfStock && <NoStockRibbon />}
        </div>

        {/* Info
            flex: 1 hace que esta sección crezca para llenar el espacio
            disponible, manteniendo el precio alineado al fondo en todas
            las tarjetas de la misma fila. */}
        <div
          className="catalog-card-info"
          style={{
            padding: "0.9rem 1rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            flex: 1,
          }}
        >
          <h3
            className="catalog-card-name"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.25,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
              flex: 1,
            }}
          >
            {product.name}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "0.15rem",
              flexWrap: "wrap",
              gap: "0.2rem",
            }}
          >
            <span
              className="catalog-card-price"
              style={{
                fontFamily: "var(--font-jost), sans-serif",
                fontSize: "0.92rem",
                fontWeight: 500,
                background:
                  "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {formatPrice(product.price)}
            </span>

            {!outOfStock ? (
              <span
                className="catalog-card-stock"
                style={{
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--coragem-teal)",
                  opacity: 0.85,
                }}
              >
                Disponible
              </span>
            ) : (
              <span
                className="catalog-card-stock"
                style={{
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.62rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  opacity: 0.7,
                }}
              >
                Sin stock
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Empty State ────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        gridColumn: "1 / -1",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1rem",
        gap: "1rem",
        opacity: 0,
        animation: "fadeInCard 0.4s ease forwards",
      }}
    >
      <span style={{ fontSize: "2.5rem", lineHeight: 1 }}>✦</span>
      <p
        style={{
          fontFamily: "var(--font-cormorant), serif",
          fontSize: "1.4rem",
          fontWeight: 500,
          color: "var(--text-primary)",
        }}
      >
        Sin resultados
      </p>
      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          letterSpacing: "0.06em",
        }}
      >
        Intenta con otros filtros o un término diferente
      </p>
    </div>
  );
}

/* ─── Main Grid ──────────────────────────────────────────────────── */
export function CatalogGrid({ products }: { products: Product[] }) {
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1.25rem",
          alignItems: "stretch",
        }}
        className="catalog-grid"
      >
        {products.length > 0 ? (
          products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))
        ) : (
          <EmptyState />
        )}
      </div>

      <style>{`
        /* Card hover */
        .catalog-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(78, 196, 196, 0.12), 0 2px 8px rgba(0,0,0,0.06);
          border-color: rgba(78, 196, 196, 0.3) !important;
        }
        .catalog-card:hover .catalog-card-img {
          transform: scale(1.05);
        }
        .catalog-card:hover .catalog-card-name {
          color: var(--coragem-teal);
        }

        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 900px) {
          .catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        /* Responsive: ≤ 400px — tarjetas compactas */
        @media (max-width: 400px) {
          .catalog-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }

          .catalog-card {
            border-radius: 10px !important;
          }

          .catalog-card-info {
            padding: 0.55rem 0.65rem 0.65rem !important;
            gap: 0.25rem !important;
          }

          .catalog-card-name {
            font-size: 0.82rem !important;
            line-height: 1.2 !important;
          }

          .catalog-card-price {
            font-size: 0.75rem !important;
          }

          .catalog-card-stock {
            font-size: 0.52rem !important;
            letter-spacing: 0.06em !important;
          }
        }
      `}</style>
    </>
  );
}