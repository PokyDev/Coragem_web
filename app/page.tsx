import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "calc(100dvh - 72px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg)",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* ThemeToggle — esquina inferior izquierda */}
      <ThemeToggle />

      {/* Contenido de la landing page — se construirá en el siguiente paso */}
      <p style={{ color: "var(--text-secondary)", fontFamily: "var(--font-jost)" }}>
        Landing page — próximamente
      </p>
    </main>
  );
}