"use client";

/* ─── ProductMobileSheet ─────────────────────────────────────────────
 * Bottom sheet para pantallas móviles (≤ 600px).
 * ──────────────────────────────────────────────────────────────────── */

import { buildWhatsAppUrl } from "@/lib/config";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { NoStockRibbon } from "@/components/shared/ui/NoStockRibbon";
import { Product } from "@/types/catalog";

/* ─── Helpers ────────────────────────────────────────────────────── */
function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getImageSrc(product: Product): string {
  return product.images[0]?.url ?? "/placeholder.jpg";
}

const ZOOM_SCALE = 2.8;

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
          fontSize: "0.55rem",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          marginBottom: "0.15rem",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: "0.75rem",
          fontWeight: 500,
          color: accent ?? "var(--text-primary)",
          letterSpacing: "0.03em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Props ──────────────────────────────────────────────────────── */
interface ProductMobileSheetProps {
  product: Product | null;
  onClose: () => void;
}

/* ─── Component ──────────────────────────────────────────────────── */
export function ProductMobileSheet({ product, onClose }: ProductMobileSheetProps) {
  const sheetRef      = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const zoomPanelRef  = useRef<HTMLDivElement>(null);
  const zoomActiveRef = useRef(false);

  const [mounted,    setMounted]    = useState(false);
  const [closing,    setClosing]    = useState(false);
  const [dragY,      setDragY]      = useState(0);
  const [zoomActive, setZoomActive] = useState(false);

  const dragStartY = useRef(0);
  const isDragging = useRef(false);

  const outOfStock = product?.stock === 0;
  const imageSrc   = product ? getImageSrc(product) : "";

  // Preload raw Cloudinary URL so the background-image hits the browser cache
  // instead of making a fresh network request on first touch.
  // Next.js <Image> serves via /_next/image?..., which is a different cache entry.
  useEffect(() => {
    if (!imageSrc || imageSrc === "/placeholder.jpg") return;
    const img = new window.Image();
    img.src = imageSrc;
  }, [imageSrc]);

  /* ── Montar con animación ── */
  useEffect(() => {
    if (product) {
      setClosing(false);
      setDragY(0);
      requestAnimationFrame(() => setMounted(true));
    } else {
      setMounted(false);
    }
  }, [product]);

  /* ── Bloquear scroll del body ── */
  useEffect(() => {
    if (product) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  /* ── Cerrar con Escape ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Cerrar con animación de salida ── */
  const handleClose = useCallback(() => {
    setClosing(true);
    setDragY(0);
    setTimeout(() => {
      setMounted(false);
      setClosing(false);
      onClose();
    }, 320);
  }, [onClose]);

  /* ── Tap en backdrop ── */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        handleClose();
      }
    },
    [handleClose]
  );

  /* ── Swipe-to-dismiss ── */
  const handleHandleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleHandleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }, []);

  const handleHandleTouchEnd = useCallback(() => {
    isDragging.current = false;
    if (dragY > 100) handleClose();
    else setDragY(0);
  }, [dragY, handleClose]);

  /* ── Zoom: touch sobre la imagen ── */
  // Update background-position directly on the DOM node — no React re-render
  // on every touchmove. Only toggle active state (one re-render per gesture).
  const handleImageTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (outOfStock) return;
      const touch = e.touches[0];
      const rect  = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width)  * 100;
      const y = ((touch.clientY - rect.top)  / rect.height) * 100;

      if (zoomPanelRef.current) {
        zoomPanelRef.current.style.backgroundPosition = `${x}% ${y}%`;
      }

      zoomActiveRef.current = true;
      setZoomActive(true);
    },
    [outOfStock]
  );

  const handleImageTouchMove = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (outOfStock || !zoomActiveRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      const touch = e.touches[0];
      const rect  = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width)  * 100;
      const y = ((touch.clientY - rect.top)  / rect.height) * 100;

      if (zoomPanelRef.current) {
        zoomPanelRef.current.style.backgroundPosition = `${x}% ${y}%`;
      }
    },
    [outOfStock]
  );

  const handleImageTouchEnd = useCallback(() => {
    zoomActiveRef.current = false;
    setZoomActive(false);
  }, []);

  if (!product) return null;

  const isVisible = mounted && !closing;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`ms-backdrop ${isVisible ? "ms-backdrop--visible" : ""}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1100,
          backgroundColor: "rgba(0,0,0,0)",
          backdropFilter: "blur(0px)",
          transition: "background-color 0.32s ease, backdrop-filter 0.32s ease",
        }}
      />

      {/* ── Sheet ── */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle: ${product.name}`}
        className={`ms-sheet ${isVisible ? "ms-sheet--visible" : ""}`}
        style={{
          transform: isVisible ? `translateY(${dragY}px)` : "translateY(100%)",
          transition: isDragging.current
            ? "none"
            : "transform 0.36s cubic-bezier(0.4,0,0.2,1)",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1101,
          height: "85vh",
          backgroundColor: "var(--bg-card)",
          borderRadius: "20px 20px 0 0",
          border: "1px solid var(--border)",
          borderBottom: "none",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Handle zone ── */}
        <div style={{ flexShrink: 0 }}>
        {/*
          -- Opcional: handle de arrastre visible (barra horizontal) --
          <div
            ref={dragHandleRef}
            onTouchStart={handleHandleTouchStart}
            onTouchMove={handleHandleTouchMove}
            onTouchEnd={handleHandleTouchEnd}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "1rem 0 0.65rem",
              cursor: "grab",
              touchAction: "none",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "5px",
                borderRadius: "999px",
                background: "var(--border)",
              }}
            />
          </div>
        */}

          {/* Close button */}
          <div style={{ display: "flex", justifyContent: "center", padding: "0.75rem 1rem 0.8rem" }}>
            <button
              onClick={handleClose}
              aria-label="Cerrar panel"
              className="ms-close-btn"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1.5px solid var(--coragem-teal)",
                background: "rgba(78,196,196,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                padding: 0,
                color: "var(--coragem-teal)",
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Separator ── */}
        <div
          style={{
            flexShrink: 0,
            height: "1px",
            margin: "0 1rem",
            background: "linear-gradient(90deg, transparent 0%, var(--coragem-teal) 30%, var(--coragem-pink) 70%, transparent 100%)",
            opacity: 0.3,
          }}
        />

        {/* ── Header: nombre ── */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "0.75rem 1rem 0.6rem",
            gap: "0.75rem",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "clamp(1.2rem, 5vw, 1.5rem)",
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: "0.02em",
              color: "var(--text-primary)",
              flex: 1,
            }}
          >
            {product.name}
          </h2>
        </div>

        {/* ── Imagen | Zoom (fila fija, 50/50) ── */}
        <div
          style={{
            flexShrink: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            padding: "0 0.75rem",
          }}
        >

          {/* Panel de zoom */}
          <div
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "var(--bg)",
              border: `1px solid ${zoomActive ? "rgba(78,196,196,0.35)" : "var(--border)"}`,
              transition: "border-color 0.25s ease",
            }}
          >
            {outOfStock ? (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  opacity: 0.45,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.45rem",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "0 0.5rem",
                  }}
                >
                  Zoom no disponible
                </span>
              </div>
            ) : (
              <>
                {/* Always render with backgroundImage set — toggling to "none" forces
                    a re-fetch. Visibility is controlled by opacity/transform only. */}
                <div
                  ref={zoomPanelRef}
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: `url(${imageSrc})`,
                    backgroundSize: `${ZOOM_SCALE * 100}%`,
                    backgroundPosition: "50% 50%",
                    backgroundRepeat: "no-repeat",
                    opacity: zoomActive ? 1 : 0,
                    transform: zoomActive ? "scale(1)" : "scale(1.04)",
                    transition: "opacity 0.22s ease, transform 0.22s ease",
                  }}
                  role="img"
                  aria-label={`Vista ampliada: ${product.name}`}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem",
                    opacity: zoomActive ? 0 : 1,
                    transition: "opacity 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--coragem-teal)" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0.6 }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8"  x2="11"    y2="14"    />
                    <line x1="8"  y1="11" x2="14"    y2="11"    />
                  </svg>
                  <span
                    style={{
                      fontFamily: "var(--font-jost), sans-serif",
                      fontSize: "0.45rem",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      textAlign: "center",
                      padding: "0 0.75rem",
                      lineHeight: 1.5,
                    }}
                  >
                    Arrastra tu dedo sobre la imagen original para obtener una vista ampliada
                  </span>
                </div>

                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: "0.35rem 0.65rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "rgba(0,0,0,0.4)",
                    backdropFilter: "blur(6px)",
                    zIndex: 2,
                    borderRadius: "12px 12px 0 0",
                    opacity: zoomActive ? 1 : 0,
                    transition: "opacity 0.2s ease",
                    pointerEvents: "none",
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--coragem-teal)" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="11" y1="8"  x2="11"    y2="14"    />
                    <line x1="8"  y1="11" x2="14"    y2="11"    />
                  </svg>
                  <span
                    style={{
                      fontFamily: "var(--font-jost), sans-serif",
                      fontSize: "0.42rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.85)",
                    }}
                  >
                    Vista ampliada
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Imagen original */}
          <div
            style={{
              position: "relative",
              aspectRatio: "1 / 1",
              borderRadius: "12px",
              overflow: "hidden",
              backgroundColor: "var(--bg)",
              cursor: outOfStock ? "default" : "crosshair",
              touchAction: outOfStock ? "auto" : "none",
              WebkitTouchCallout: "none",
              userSelect: "none",
            }}
            onTouchStart={handleImageTouchStart}
            onTouchMove={handleImageTouchMove}
            onTouchEnd={handleImageTouchEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="45vw"
              draggable={false}
              style={{
                objectFit: "cover",
                opacity: outOfStock ? 0.55 : 1,
                WebkitTouchCallout: "none",
                userSelect: "none",
              }}
              priority
            />
            {outOfStock && <NoStockRibbon />}

            {!outOfStock && (
              <div
                className={`ms-zoom-hint ${zoomActive ? "ms-zoom-hint--hidden" : ""}`}
                style={{
                  position: "absolute",
                  bottom: "0.5rem",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "999px",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(6px)",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.25s ease",
                }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="var(--coragem-teal)" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-jost), sans-serif",
                    fontSize: "0.38rem",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  Arrastra tu dedo y amplia
                </span>
              </div>
            )}
          </div>

        </div>

        {/* ── Info scrollable ── */}
        <div
          className="ms-info-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0.9rem 1rem 2rem",
            touchAction: zoomActive ? "none" : "pan-y",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "1.15rem",
              fontWeight: 500,
              background: "linear-gradient(135deg, var(--coragem-teal) 0%, var(--coragem-pink) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "0.9rem",
            }}
          >
            {formatPrice(product.price)}
          </p>

          <div
            style={{
              height: "1px",
              background: "linear-gradient(90deg, var(--coragem-teal) 0%, transparent 80%)",
              opacity: 0.25,
              marginBottom: "0.9rem",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.7rem 1rem",
              marginBottom: "1rem",
            }}
          >
            <DetailItem label="Categoría" value={product.category.name} />
            <DetailItem label="Color"     value={product.color.name}    />
            <DetailItem label="Ventas"    value={`${product.ventas} unidades`} />
            <DetailItem
              label="Disponibilidad"
              value={outOfStock ? "Sin stock" : "Disponible"}
              accent={outOfStock ? "var(--coragem-pink)" : "var(--coragem-teal)"}
            />
          </div>

          {!outOfStock && (
            <div style={{ marginBottom: "1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Stock
                </span>
                <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.62rem", color: "var(--coragem-teal)", fontWeight: 500 }}>
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
            href={buildWhatsAppUrl(`Hola, me interesa el producto: ${product.name}`)}
            target="_blank"
            rel="noopener noreferrer"
            className={`ms-cta ${outOfStock ? "ms-cta--disabled" : ""}`}
            onClick={outOfStock ? (e) => e.preventDefault() : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.55rem",
              width: "100%",
              padding: "0.8rem 1.25rem",
              borderRadius: "999px",
              border: "none",
              fontFamily: "var(--font-jost), sans-serif",
              fontSize: "0.72rem",
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.76.459 3.414 1.263 4.857L2.018 22l5.305-1.223C8.71 21.581 10.317 22 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2zm.001 18c-1.513 0-2.926-.41-4.134-1.12l-.295-.175-3.148.726.756-3.059-.193-.313A7.945 7.945 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
              </svg>
            )}
            {outOfStock ? "Sin stock disponible" : "Consultar por WhatsApp"}
          </a>
        </div>
      </div>

      <style>{`
        .ms-backdrop--visible {
          background-color: rgba(0, 0, 0, 0.55) !important;
          backdrop-filter: blur(6px) !important;
        }
        .ms-cta:not(.ms-cta--disabled):hover {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .ms-zoom-hint--hidden {
          opacity: 0 !important;
          pointer-events: none !important;
        }
        @keyframes ms-close-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(78,196,196,0.45); }
          50%       { box-shadow: 0 0 0 8px rgba(78,196,196,0); }
        }
        .ms-close-btn {
          animation: ms-close-pulse 2s ease-in-out 0.5s 3;
          transition: background 0.18s ease, transform 0.15s ease;
        }
        .ms-close-btn:hover  { background: rgba(78,196,196,0.18) !important; transform: scale(1.08); }
        .ms-close-btn:active { transform: scale(0.94); }
        .ms-info-scroll::-webkit-scrollbar        { width: 3px; }
        .ms-info-scroll::-webkit-scrollbar-track  { background: transparent; }
        .ms-info-scroll::-webkit-scrollbar-thumb  { background: var(--border); border-radius: 999px; }
      `}</style>
    </>
  );
}
