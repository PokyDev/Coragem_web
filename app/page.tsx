import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        backgroundColor: "var(--bg)",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Botón de tema — esquina superior derecha */}
      <ThemeToggle />

      {/* Logo centrado */}
      <div
        className="animate-fade-in"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Image
          src="/images/illustrations/Coragem_Fondo.jpeg"
          alt="Coragem Accessories"
          width={320}
          height={320}
          priority
          style={{
            objectFit: "contain",
            borderRadius: "8px",
          }}
        />
      </div>
    </main>
  );
}