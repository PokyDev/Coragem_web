'use client';

import { useState } from 'react';
import Image        from 'next/image';
import { NoStockRibbon } from '@/components/shared/ui/NoStockRibbon';
import { ProductModal  } from '@/components/shared/product/ProductModal';
import type { Product  } from '@/types/catalog';

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(price);
}

/* ─── Loading skeleton ───────────────────────────────────────────── */
function GridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: '16px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-card)',
            overflow: 'hidden',
            animation: 'skeletonPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.1}s`,
          }}
        >
          <div style={{ width: '100%', aspectRatio: '1 / 1', backgroundColor: 'var(--border)' }} />
          <div style={{ padding: '0.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ height: '1rem', width: '70%', borderRadius: '4px', backgroundColor: 'var(--border)' }} />
            <div style={{ height: '0.85rem', width: '40%', borderRadius: '4px', backgroundColor: 'var(--border)' }} />
          </div>
        </div>
      ))}
    </>
  );
}

/* ─── Error state ────────────────────────────────────────────────── */
function ErrorState({ message }: { message: string }) {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem' }}>
      <span style={{ fontSize: '2rem' }}>✦</span>
      <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.3rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        No se pudo cargar el catálogo
      </p>
      <p style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '0.78rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
        {message}
      </p>
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 1rem', gap: '1rem', opacity: 0, animation: 'fadeInCard 0.4s ease forwards' }}>
      <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>✦</span>
      <p style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.4rem', fontWeight: 500, color: 'var(--text-primary)' }}>Sin resultados</p>
      <p style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '0.8rem', color: 'var(--text-secondary)', letterSpacing: '0.06em' }}>
        Intenta con otros filtros o un término diferente
      </p>
    </div>
  );
}

/* ─── Product Card ───────────────────────────────────────────────── */
function ProductCard({ product, index, onClick }: { product: Product; index: number; onClick: (p: Product) => void }) {
  const outOfStock   = product.stock === 0;
  const firstImage   = product.images[0];

  return (
    <button
      onClick={() => onClick(product)}
      aria-label={`Ver ${product.name}`}
      className="catalog-card-btn"
      style={{ display: 'flex', height: '100%', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: 0, animation: 'fadeInCard 0.45s ease forwards', animationDelay: `${index * 0.06}s` }}
    >
      <article
        className="catalog-card"
        style={{ display: 'flex', flexDirection: 'column', width: '100%', borderRadius: '16px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)', overflow: 'hidden', transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s ease', opacity: outOfStock ? 0.82 : 1 }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0 }}>
          {firstImage ? (
            <Image
              src={firstImage.url}
              alt={product.name}
              fill
              sizes="(max-width: 400px) 50vw, (max-width: 600px) 50vw, 33vw"
              {...(firstImage.width  && firstImage.height
                ? { width: firstImage.width, height: firstImage.height }
                : {})}
              style={{ objectFit: 'cover', transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' }}
              className="catalog-card-img"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '1.5rem' }}>✦</span>
            </div>
          )}
          {outOfStock && <NoStockRibbon />}
        </div>

        <div className="catalog-card-info" style={{ padding: '0.9rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
          <h3 className="catalog-card-name" style={{ fontFamily: 'var(--font-cormorant), serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25, letterSpacing: '0.02em', transition: 'color 0.2s ease', flex: 1 }}>
            {product.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.15rem', flexWrap: 'wrap', gap: '0.2rem' }}>
            <span className="catalog-card-price" style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '0.92rem', fontWeight: 500, background: 'linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {formatPrice(product.price)}
            </span>
            <span className="catalog-card-stock" style={{ fontFamily: 'var(--font-jost), sans-serif', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: outOfStock ? 'var(--text-secondary)' : 'var(--coragem-teal)', opacity: outOfStock ? 0.7 : 0.85 }}>
              {outOfStock ? 'Sin stock' : 'Disponible'}
            </span>
          </div>
        </div>
      </article>
    </button>
  );
}

/* ─── Main Grid ──────────────────────────────────────────────────── */
interface CatalogGridProps {
  products: Product[];
  loading:  boolean;
  error:    string | null;
}

export function CatalogGrid({ products, loading, error }: CatalogGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <>
      <div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', alignItems: 'stretch' }}
        className="catalog-grid"
      >
        {loading && <GridSkeleton />}
        {!loading && error    && <ErrorState message={error} />}
        {!loading && !error && products.length === 0 && <EmptyState />}
        {!loading && !error && products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} onClick={setSelectedProduct} />
        ))}
      </div>

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <style>{`
        .catalog-card-btn:hover .catalog-card {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(78,196,196,0.12), 0 2px 8px rgba(0,0,0,0.06);
          border-color: rgba(78,196,196,0.3) !important;
        }
        .catalog-card-btn:hover .catalog-card-img   { transform: scale(1.05); }
        .catalog-card-btn:hover .catalog-card-name  { color: var(--coragem-teal); }

        @keyframes fadeInCard {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1;   }
          50%       { opacity: 0.5; }
        }

        @media (max-width: 900px) { .catalog-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 400px) {
          .catalog-grid  { grid-template-columns: repeat(2, 1fr) !important; gap: 0.5rem !important; }
          .catalog-card  { border-radius: 10px !important; }
          .catalog-card-info  { padding: 0.55rem 0.65rem 0.65rem !important; gap: 0.25rem !important; }
          .catalog-card-name  { font-size: 0.82rem !important; line-height: 1.2 !important; }
          .catalog-card-price { font-size: 0.75rem !important; }
          .catalog-card-stock { font-size: 0.52rem !important; letter-spacing: 0.06em !important; }
        }
      `}</style>
    </>
  );
}