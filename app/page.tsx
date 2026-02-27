import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LandingHeader } from "@/components/landing/LandingHeader";

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
      <ThemeToggle />
      <LandingHeader />

      {/* Resto de secciones de la landing — próximamente */}
    </main>
  );
}