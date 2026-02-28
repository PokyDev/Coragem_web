import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingControls } from "@/components/layout/FloatingControls";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Coragem Accessories",
  description: "Bisutería en rodio artesanal — elegancia que dura.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${jost.variable} antialiased`}>
        <Providers>
          <Navbar />
          <div style={{ paddingTop: "72px" }}>
            {children}
          </div>
          <FloatingControls />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}