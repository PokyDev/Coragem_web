import { LandingHeader } from "@/components/landing/LandingHeader";
import { ProductsGrid } from "@/components/landing/ProductsGrid";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "calc(100dvh - 72px)",
        backgroundColor: "var(--bg)",
        transition: "background-color 0.3s ease",
        paddingBottom: "4rem",
      }}
    >
      <LandingHeader />
      <ProductsGrid />

      {/* Resto de secciones de la landing — próximamente */}
    </main>
  );
}