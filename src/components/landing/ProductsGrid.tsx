"use client";

import Image from "next/image";
import Link from "next/link";
import products from "@/data/products.json";

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
      {/* Dark overlay */}
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
      {/* Diagonal band */}
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
          background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
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

/* ─── Single Product Card ───────────────────────────────────────── */
function ProductCard({
  product,
  index,
}: {
  product: (typeof products)[0];
  index: number;
}) {
  const outOfStock = product.stock === 0;

  return (
    <Link
      href={`/products/${product.id}`}
      style={{
        display: "block",
        textDecoration: "none",
        animationDelay: `${index * 0.07}s`,
      }}
      className="product-card-link"
    >
      <article
        className="product-card"
        style={{
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
        {/* ── Image wrapper ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            backgroundColor: "var(--bg)",
            overflow: "hidden",
          }}
        >
          <Image
            src={`/images/products/${product.image}`}
            alt={product.name}
            fill
            sizes="(max-width: 600px) 50vw, 25vw"
            style={{
              objectFit: "cover",
              transition: "transform 0.45s cubic-bezier(0.4,0,0.2,1)",
            }}
            className="product-img"
          />

          {/* No-stock overlay */}
          {outOfStock && <NoStockRibbon />}
        </div>

        {/* ── Info ── */}
        <div
          style={{
            padding: "0.9rem 1rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
          }}
        >
          {/* Name */}
          <h3
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.25,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            }}
            className="product-name"
          >
            {product.name}
          </h3>

          {/* Price row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "0.15rem",
            }}
          >
            <span
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

            {/* Stock indicator */}
            {!outOfStock ? (
              <span
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

/* ─── Main Grid Component ───────────────────────────────────────── */
export function ProductsGrid() {
  return (
    <section
      style={{
        margin: "2rem auto 0",
        maxWidth: "1100px",
        padding: "0 1.5rem 4rem",
      }}
    >
      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.25rem",
        }}
        className="products-grid"
      >
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* Card hover */
        .product-card-link:hover .product-card {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(78, 196, 196, 0.12), 0 2px 8px rgba(0,0,0,0.06);
          border-color: rgba(78, 196, 196, 0.3);
        }
        /* Image zoom on hover */
        .product-card-link:hover .product-img {
          transform: scale(1.05);
        }
        /* Name color on hover */
        .product-card-link:hover .product-name {
          color: var(--coragem-teal);
        }

        /* Responsive: 2 cols on tablet */
        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.875rem !important;
          }
        }
        /* Responsive: 2 cols on mobile too */
        @media (max-width: 480px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.625rem !important;
          }
        }
      `}</style>
    </section>
  );
}