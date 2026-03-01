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
    /*
     * height: 100% en el Link asegura que ocupe toda la altura de su celda
     * en el grid, lo que permite que CSS Grid iguale las alturas de la fila.
     */
    <Link
      href={`/products/${product.id}`}
      style={{
        display: "flex",
        height: "100%",
        textDecoration: "none",
        animationDelay: `${index * 0.07}s`,
      }}
      className="product-card-link"
    >
      <article
        className="product-card"
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
        {/* ── Image wrapper ── */}
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
            sizes="(max-width: 400px) 50vw, (max-width: 600px) 50vw, 25vw"
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
          className="product-info"
          style={{
            padding: "0.9rem 1rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.35rem",
            /* flex: 1 hace que esta sección crezca y mantenga alineados
               los precios al fondo cuando los títulos tienen distinta longitud */
            flex: 1,
          }}
        >
          {/* Name */}
          <h3
            className="product-name"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "1.05rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              lineHeight: 1.25,
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
              /* Permite que el título crezca sin romper el layout */
              flex: 1,
            }}
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
              flexWrap: "wrap",
              gap: "0.2rem",
            }}
          >
            <span
              className="product-price"
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
                className="product-stock"
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
                className="product-stock"
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
      {/* Grid
          align-items: stretch (default) + height:100% en los hijos
          garantiza que todas las tarjetas de una misma fila tengan
          la misma altura, independiente de la longitud del título. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.25rem",
          alignItems: "stretch",
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

        /* Responsive: ≤ 400px — tarjetas compactas */
        @media (max-width: 400px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
          }

          .product-card {
            border-radius: 10px !important;
          }

          .product-info {
            padding: 0.55rem 0.65rem 0.65rem !important;
            gap: 0.25rem !important;
          }

          .product-name {
            font-size: 0.82rem !important;
            line-height: 1.2 !important;
          }

          .product-price {
            font-size: 0.75rem !important;
          }

          .product-stock {
            font-size: 0.52rem !important;
            letter-spacing: 0.06em !important;
          }
        }
      `}</style>
    </section>
  );
}