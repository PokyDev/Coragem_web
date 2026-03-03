"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import products from "@/data/products.json";
import { NoStockRibbon } from "@/components/ui/NoStockRibbon";
import { ProductModal } from "@/components/ui/ProductModal";
import { LoadMoreButton } from "@/components/ui/LoadMoreButton";
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

/* ─── Single Product Card ───────────────────────────────────────── */
function ProductCard({
  product,
  index,
  onClick,
}: {
  product: Product;
  index: number;
  onClick: (p: Product) => void;
}) {
  const outOfStock = product.stock === 0;

  return (
    <button
      onClick={() => onClick(product)}
      aria-label={`Ver ${product.name}`}
      className="product-card-btn"
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        textAlign: "left",
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
        animationDelay: `${index * 0.07}s`,
      }}
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
            flex: 1,
          }}
        >
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
    </button>
  );
}

/* ─── Main Grid Component ───────────────────────────────────────── */
export function ProductsGrid() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section
      style={{
        margin: "2rem auto 0",
        maxWidth: "1100px",
        padding: "0 1.5rem 4rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.25rem",
          alignItems: "stretch",
        }}
        className="products-grid"
      >
        {(products as Product[]).map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            index={i}
            onClick={setSelectedProduct}
          />
        ))}
      </div>

      <LoadMoreButton
        variant="landing"
        onClick={() => router.push("/products")}
      />

      {/* ── Modal ── */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* ── Styles ── */}
      <style>{`
        .product-card-btn:hover .product-card {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(78, 196, 196, 0.12), 0 2px 8px rgba(0,0,0,0.06);
          border-color: rgba(78, 196, 196, 0.3);
        }
        .product-card-btn:hover .product-img {
          transform: scale(1.05);
        }
        .product-card-btn:hover .product-name {
          color: var(--coragem-teal);
        }

        @media (max-width: 768px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.875rem !important;
          }
        }

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