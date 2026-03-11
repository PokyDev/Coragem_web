"use client";

/**
 * src/components/shared/ui/ProductCardSkeleton.tsx
 *
 * Skeleton reutilizable para grids de productos.
 * Usado en ProductsGrid (landing) y CatalogGrid (catálogo).
 *
 * Props:
 *   count  — número de cards a renderizar (default: 8)
 *   delay  — incremento de animationDelay entre cards en segundos (default: 0.08)
 */

interface ProductCardSkeletonProps {
  count?: number;
  delay?: number;
}

export function ProductCardSkeleton({
  count = 8,
  delay = 0.08,
}: ProductCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            borderRadius: "16px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--bg-card)",
            overflow: "hidden",
            animation: "skeletonPulse 1.4s ease-in-out infinite",
            animationDelay: `${i * delay}s`,
          }}
        >
          {/* Image area */}
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              backgroundColor: "var(--border)",
            }}
          />

          {/* Info area */}
          <div
            style={{
              padding: "0.9rem 1rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                height: "1rem",
                width: "70%",
                borderRadius: "4px",
                backgroundColor: "var(--border)",
              }}
            />
            <div
              style={{
                height: "0.85rem",
                width: "40%",
                borderRadius: "4px",
                backgroundColor: "var(--border)",
              }}
            />
          </div>
        </div>
      ))}

      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}