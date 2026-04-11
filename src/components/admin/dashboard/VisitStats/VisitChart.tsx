"use client";

/**
 * src/components/admin/dashboard/VisitStats/VisitChart.tsx
 *
 * Gráfica de área para métricas de visitas. Componente aislado
 * para que recharts (que accede a window/document) nunca cause
 * problemas de SSR — se importa con dynamic() en VisitStats.tsx.
 *
 * Recibe los datos ya normalizados; no conoce el concepto de "rango".
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyVisit } from "@/hooks/admin/dashboard/useVisitStats";

/* ── Tooltip personalizado ───────────────────────────────────────── */

interface CustomTooltipProps {
  active?:  boolean;
  payload?: Array<{ value: number }>;
  label?:   string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background:    "var(--admin-bg-card)",
        border:        "1px solid var(--admin-border)",
        borderRadius:  "8px",
        padding:       "0.5rem 0.875rem",
        fontFamily:    "var(--font-jost), sans-serif",
        fontSize:      "0.72rem",
        color:         "var(--admin-text)",
        boxShadow:     "0 4px 16px rgba(0,0,0,0.25)",
        pointerEvents: "none",
      }}
    >
      <div style={{ color: "var(--admin-text-muted)", marginBottom: "2px", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontWeight: 700, color: "var(--admin-accent)", fontSize: "0.85rem" }}>
        {payload[0].value} visitas
      </div>
    </div>
  );
}

/* ── Props ──────────────────────────────────────────────────────── */

interface VisitChartProps {
  data: DailyVisit[];
}

/* ── Component ──────────────────────────────────────────────────── */

export function VisitChart({ data }: VisitChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="visitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#4ec4c4" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#4ec4c4" stopOpacity={0}    />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(30, 58, 95, 0.6)"
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{
            fontFamily:    "var(--font-jost), sans-serif",
            fontSize:      10,
            fill:          "#4a5568",
            letterSpacing: "0.06em",
          }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{
            fontFamily: "var(--font-jost), sans-serif",
            fontSize:   10,
            fill:       "#4a5568",
          }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(78,196,196,0.2)", strokeWidth: 1 }} />

        <Area
          type="monotone"
          dataKey="visits"
          stroke="#4ec4c4"
          strokeWidth={2}
          fill="url(#visitGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#4ec4c4", stroke: "#0d1520", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}