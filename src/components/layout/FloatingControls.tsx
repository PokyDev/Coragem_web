"use client";

import { BrandIcon } from "@/components/layout/ui/BrandIcon";
import { ThemeToggle } from "@/components/layout/ui/ThemeToggle";
import { ScrollToTop } from "@/components/layout/ui/ScrollToTop";

/**
 * FloatingControls
 *
 * Desktop (> 1250px): columna fixed bottom-left con ScrollToTop + BrandIcon + ThemeToggle
 * Mobile  (≤ 1250px): solo el ScrollToTop inline centrado (BrandIcon y ThemeToggle
 *                     se trasladan al MobileMenu)
 */
export function FloatingControls() {
  return (
    <>
      {/* ── Desktop: stack fixed bottom-left (> 1250px) ── */}
      <div
        className="floating-desktop"
        style={{
          position: "fixed",
          bottom: "1.25rem",
          left: "1.25rem",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.875rem",
          zIndex: 50,
        }}
      >
        <ScrollToTop variant="fixed" />
        <BrandIcon size={52} />
        <ThemeToggle />
      </div>

      {/* ── Mobile: ScrollToTop inline centrado (≤ 1250px) ── */}
      <div className="floating-mobile">
        <ScrollToTop variant="inline" />
      </div>

      <style>{`
        .floating-desktop {
          display: flex;
        }
        .floating-mobile {
          display: none;
        }

        @media (max-width: 1250px) {
          .floating-desktop {
            display: none !important;
          }
          .floating-mobile {
            display: block;
          }
        }
      `}</style>
    </>
  );
}