import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FloatingControls } from "@/components/layout/FloatingControls";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: "72px" }}>
        {children}
      </div>
      <FloatingControls />
      <Footer />
    </>
  );
}