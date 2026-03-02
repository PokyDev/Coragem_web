"use client";

/* ─── ProductModal ───────────────────────────────────────────────────
 * Punto de entrada unificado para la visualización de producto.
 *
 * Estrategia de renderizado:
 *   - Móvil (≤ 600px)  →  ProductMobileSheet  (bottom sheet con zoom 50/50)
 *   - Desktop/tablet   →  Modal centrado con zoom overlay en panel derecho
 *
 * El breakpoint se detecta con un ResizeObserver sobre window para
 * evitar hydration mismatches. Mientras no se resuelve el tamaño
 * inicial (SSR), no se renderiza nada (el modal solo se abre por
 * interacción del usuario, por lo que no hay CLS).
 * ──────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { NoStockRibbon } from "@/components/ui/NoStockRibbon";
import { ProductMobileSheet } from "@/components/ui/ProductMobileSheet";
import { Product } from "@/types/catalog";

/* ─── Hook: detectar móvil ───────────────────────────────────────── */
const MOBILE_BREAKPOINT = 600;

function useIsMobile(): boolean | null {
  /*
   * null = no resuelto aún (SSR / primera hidratación).
   * true  = móvil.
   * false = desktop/tablet.
   */
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(document.documentElement);
    return () => observer.disconnect();
  }, []);

  return isMobile;
}

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

const ZOOM_SCALE = 2.5;

/* ─── ZoomState ──────────────────────────────────────────────────── */
interface ZoomState {
  visible: boolean;
  bgX: number;
  bgY: number;
}

/* ─── ZoomOverlay (desktop) ──────────────────────────────────────── */
interface ZoomOverlayProps {
  src: string;
  alt: string;
  zoomState: ZoomState;
}

function ZoomOverlay({ src, alt, zoomState }: ZoomOverlayProps) {
  return (
    <div
      className={`zoom-overlay ${zoomState.visible ? "zoom-overlay--visible" : ""}`}
      aria-hidden="true"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: "50%",
        backgroundColor: "var(--bg-card)",
        padding: "1.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0,
        transform: "translateX(20px)",
        transition:
          "opacity 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        pointerEvents: "none",
        borderRadius: "0 20px 20px 0",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: "12px",
          overflow: "hidden",
          backgroundImage: `url(${src})`,
          backgroundSize: `${ZOOM_SCALE * 100}%`,
          backgroundPosition: `${zoomState.bgX}% ${zoomState.bgY}%`,
          backgroundRepeat: "no-repeat",
          transition: "background-position 0.04s linear",
        }}
        role="img"
        aria-label={`Vista ampliada: ${alt}`}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: "0.6rem 1rem",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(6px)",
            zIndex: 2,
            borderRadius: "12px 12px 0 0",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--coragem-teal)"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
          <span
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Vista ampliada
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────── */
interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

/* ─── DetailItem ─────────────────────────────────────────────────── */
function DetailItem({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.58rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: accent ?? "var(--text-primary)",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── DesktopModal ───────────────────────────────────────────────── */
function DesktopModal({ product, onClose }: ProductModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [zoomState, setZoomState] = useState<ZoomState>({
    visible: false,
    bgX: 50,
    bgY: 50,
  });

  const outOfStock = product?.stock === 0;

  useEffect(() => {
    if (product) {
      setClosing(false);
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setMounted(false);
      setClosing(false);
      onClose();
    }, 320);
  }, [onClose]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleImageMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (outOfStock) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomState({ visible: true, bgX: x, bgY: y });
    },
    [outOfStock]
  );

  const handleImageMouseLeave = useCallback(() => {
    setZoomState((prev) => ({ ...prev, visible: false }));
  }, []);

  if (!product) return null;

  const imageSrc = `/images/products/${product.image}`;
  const isVisible = mounted && !closing;

  return (
    <>
      <div
        className={`dm-backdrop ${isVisible ? "dm-backdrop--visible" : ""}`}
        onClick={handleBackdropClick}
        aria-modal="true"
        role="dialog"
        aria-label={`Detalle: ${product.name}`}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          backgroundColor: "rgba(0, 0, 0, 0)",
          backdropFilter: "blur(0px)",
          transition: "background-color 0.32s ease, backdrop-filter 0.32s ease",
          overflowY: "auto",
        }}
      >
        <div
          ref={panelRef}
          className={`dm-panel ${isVisible ? "dm-panel--visible" : ""}`}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "860px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            overflow: "hidden",
            opacity: 0,
            transform: "translateY(32px) scale(0.97)",
            transition:
              "opacity 0.32s cubic-bezier(0.4,0,0.2,1), transform 0.32s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)",
          }}
        >
          {/* Close */}
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="dm-close-btn"
            style={{
              opacity: zoomState.visible ? 0 : 1,
              pointerEvents: zoomState.visible ? "none" : "auto",
              position: "absolute",
              top: "1rem",
              right: "1rem",
              zIndex: 10,
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              background: "var(--bg)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition:
                "background 0.2s ease, color 0.2s ease, border-color 0.2s ease, opacity 0.25s ease",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Body */}
          <div
            style={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              minHeight: "400px",
            }}
          >
            {/* Left: imagen */}
            <div style={{ padding: "1.75rem", borderRight: "1px solid var(--border)" }}>
              <div
                onMouseMove={handleImageMouseMove}
                onMouseLeave={handleImageMouseLeave}
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  backgroundColor: "var(--bg)",
                  cursor: outOfStock ? "default" : "crosshair",
                }}
              >
                <Image
                  src={imageSrc}
                  alt={product.name}
                  fill
                  sizes="430px"
                  style={{
                    objectFit: "cover",
                    opacity: outOfStock ? 0.55 : 1,
                  }}
                  priority
                />
                {outOfStock && <NoStockRibbon />}

                {!outOfStock && (
                  <div
                    className={`dm-zoom-hint ${zoomState.visible ? "dm-zoom-hint--hidden" : ""}`}
                    style={{
                      position: "absolute",
                      bottom: "0.75rem",
                      right: "0.75rem",
                      zIndex: 3,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "999px",
                      background: "rgba(0,0,0,0.45)",
                      backdropFilter: "blur(6px)",
                      transition: "opacity 0.25s ease",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--coragem-teal)" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
                      Pasa el cursor para hacer zoom
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: info */}
            <div
              style={{
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                opacity: zoomState.visible ? 0 : 1,
                transition: "opacity 0.25s ease",
                pointerEvents: zoomState.visible ? "none" : "auto",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "clamp(1.6rem, 3vw, 2.1rem)",
                  fontWeight: 600,
                  lineHeight: 1.1,
                  letterSpacing: "0.02em",
                  color: "var(--text-primary)",
                  marginBottom: "0.6rem",
                }}
              >
                {product.name}
              </h2>

              <p
                style={{
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "1.35rem",
                  fontWeight: 500,
                  background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "1.2rem",
                }}
              >
                {formatPrice(product.price)}
              </p>

              <div style={{ height: "1px", background: "linear-gradient(90deg, var(--coragem-teal) 0%, transparent 80%)", opacity: 0.25, marginBottom: "1.2rem" }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem 1rem", marginBottom: "1.4rem" }}>
                <DetailItem label="Categoría" value={product.category} />
                <DetailItem label="Color" value={product.color} />
                <DetailItem label="Ventas" value={`${product.ventas} unidades`} />
                <DetailItem
                  label="Disponibilidad"
                  value={outOfStock ? "Sin stock" : "Disponible"}
                  accent={outOfStock ? "var(--coragem-pink)" : "var(--coragem-teal)"}
                />
              </div>

              {!outOfStock && (
                <div style={{ marginBottom: "1.6rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      Stock
                    </span>
                    <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.68rem", color: "var(--coragem-teal)", fontWeight: 500 }}>
                      {product.stock} uds.
                    </span>
                  </div>
                  <div style={{ height: "3px", borderRadius: "999px", background: "var(--border)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${Math.min((product.stock / 15) * 100, 100)}%`,
                        borderRadius: "999px",
                        background: "linear-gradient(90deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  </div>
                </div>
              )}

              <a
                href={`https://wa.me/573001234567?text=Hola, me interesa el producto: ${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`dm-cta ${outOfStock ? "dm-cta--disabled" : ""}`}
                onClick={outOfStock ? (e) => e.preventDefault() : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6rem",
                  width: "100%",
                  padding: "0.85rem 1.5rem",
                  borderRadius: "999px",
                  border: "none",
                  fontFamily: "var(--font-jost), sans-serif",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  cursor: outOfStock ? "not-allowed" : "pointer",
                  background: outOfStock
                    ? "var(--border)"
                    : "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
                  color: outOfStock ? "var(--text-secondary)" : "#ffffff",
                  transition: "opacity 0.2s ease, transform 0.2s ease",
                  opacity: outOfStock ? 0.55 : 1,
                }}
              >
                {!outOfStock && (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.76.459 3.414 1.263 4.857L2.018 22l5.305-1.223C8.71 21.581 10.317 22 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.513 0-2.926-.41-4.134-1.12l-.295-.175-3.148.726.756-3.059-.193-.313A7.945 7.945 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                  </svg>
                )}
                {outOfStock ? "Sin stock disponible" : "Consultar por WhatsApp"}
              </a>
            </div>

            {!outOfStock && (
              <ZoomOverlay src={imageSrc} alt={product.name} zoomState={zoomState} />
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dm-backdrop--visible {
          background-color: rgba(0, 0, 0, 0.55) !important;
          backdrop-filter: blur(6px) !important;
        }
        .dm-panel--visible {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
        }
        .dm-close-btn:hover {
          background: var(--coragem-pink) !important;
          border-color: var(--coragem-pink) !important;
          color: #fff !important;
        }
        .dm-cta:not(.dm-cta--disabled):hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .dm-zoom-hint--hidden {
          opacity: 0 !important;
          pointer-events: none;
        }
        .zoom-overlay--visible {
          opacity: 1 !important;
          transform: translateX(0) !important;
          pointer-events: auto !important;
        }
      `}</style>
    </>
  );
}

/* ─── ProductModal: entrada pública ─────────────────────────────── */
export function ProductModal({ product, onClose }: ProductModalProps) {
  const isMobile = useIsMobile();

  // Mientras no se resuelve el tamaño (SSR), no renderizar nada.
  // Como el modal solo se abre por interacción del usuario, no hay
  // impacto visible ni CLS.
  if (isMobile === null) return null;

  return isMobile ? (
    <ProductMobileSheet product={product} onClose={onClose} />
  ) : (
    <DesktopModal product={product} onClose={onClose} />
  );
}