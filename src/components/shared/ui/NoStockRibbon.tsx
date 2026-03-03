/* ─── NoStockRibbon ──────────────────────────────────────────────────
 * Componente compartido entre ProductsGrid, CatalogGrid y ProductModal.
 * Muestra un overlay oscuro + banda diagonal "Sin Stock".
 * ──────────────────────────────────────────────────────────────────── */

export function NoStockRibbon() {
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