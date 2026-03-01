"use client";

import { useDebouncedPrice } from "@/hooks/useDebouncedPrice";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  /** Se llama con debounce — solo cuando el usuario deja de mover */
  onCommit: (min: number, max: number) => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(v);

export function PriceRangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onCommit,
}: PriceRangeSliderProps) {
  const { localMin, localMax, handleChangeMin, handleChangeMax } =
    useDebouncedPrice(valueMin, valueMax, onCommit);

  return (
    <div>
      {/* Labels: reflejan estado local (instantáneo, sin esperar debounce) */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
        <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.72rem", color: "var(--coragem-teal)", fontWeight: 500 }}>
          {fmt(localMin)}
        </span>
        <span style={{ fontFamily: "var(--font-jost), sans-serif", fontSize: "0.72rem", color: "var(--coragem-pink)", fontWeight: 500 }}>
          {fmt(localMax)}
        </span>
      </div>

      {/* Min */}
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          type="range"
          min={min} max={max} step={1000}
          value={localMin}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < localMax) handleChangeMin(v);
          }}
          className="price-slider"
          style={{ width: "100%", accentColor: "var(--coragem-teal)" }}
        />
      </div>

      {/* Max */}
      <div style={{ paddingTop: "1.5rem" }}>
        <input
            type="range"
            min={min} max={max} step={1000}
            value={localMax}
            onChange={(e) => {
            const v = Number(e.target.value);
            if (v > localMin) handleChangeMax(v);
            }}
            className="price-slider"
            style={{ width: "100%", accentColor: "var(--coragem-pink)" }}
        />
      </div>

      <style>{`
        .price-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 3px;
          border-radius: 999px;
          background: var(--border);
          outline: none;
          cursor: pointer;
          display: block;
        }
        .price-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: currentColor;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .price-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}