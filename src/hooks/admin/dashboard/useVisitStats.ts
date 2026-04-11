"use client";

/**
 * src/hooks/admin/dashboard/useVisitStats.ts
 *
 * Devuelve métricas de visitas al sitio público para el dashboard.
 *
 * Estado actual: datos hardcodeados (mock).
 * Integración futura: reemplazar el mock por:
 *   GET /api/admin/dashboard/visits?range=daily   → { data: DailyVisit[] }
 *   GET /api/admin/dashboard/visits?range=weekly
 *   GET /api/admin/dashboard/visits?range=monthly
 *
 * Shape del modelo Prisma a agregar cuando se implemente:
 *
 *   model PageVisit {
 *     id    String   @id @default(cuid())
 *     date  DateTime @default(now())
 *     // Opcionales a futuro: path String, referrer String
 *     @@index([date])
 *   }
 */

import { useState, useEffect } from "react";

/* ── Tipos públicos ───────────────────────────────────────────────── */

export interface DailyVisit {
  /** Etiqueta de visualización (ej. "Lun", "Sem 14", "Abr") */
  label:  string;
  visits: number;
}

export type VisitRange = "daily" | "weekly" | "monthly";

export interface VisitStats {
  /** Visitas de los últimos 7 días, agrupadas por día */
  daily:   DailyVisit[];
  /** Visitas de las últimas 8 semanas, agrupadas por semana */
  weekly:  DailyVisit[];
  /** Visitas de los últimos 6 meses, agrupadas por mes */
  monthly: DailyVisit[];
  /** Usuarios activos en este momento (polling o WebSocket a futuro) */
  currentOnline: number;
}

export interface UseVisitStatsReturn {
  stats:   VisitStats | null;
  loading: boolean;
  error:   string | null;
}

/* ── Mock ─────────────────────────────────────────────────────────── */

const MOCK_STATS: VisitStats = {
  currentOnline: 4,
  daily: [
    { label: "Lun", visits: 38 },
    { label: "Mar", visits: 52 },
    { label: "Mié", visits: 45 },
    { label: "Jue", visits: 61 },
    { label: "Vie", visits: 79 },
    { label: "Sáb", visits: 94 },
    { label: "Dom", visits: 57 },
  ],
  weekly: [
    { label: "Sem 1",  visits: 210 },
    { label: "Sem 2",  visits: 275 },
    { label: "Sem 3",  visits: 248 },
    { label: "Sem 4",  visits: 310 },
    { label: "Sem 5",  visits: 289 },
    { label: "Sem 6",  visits: 334 },
    { label: "Sem 7",  visits: 301 },
    { label: "Sem 8",  visits: 426 },
  ],
  monthly: [
    { label: "Nov",  visits: 820  },
    { label: "Dic",  visits: 1140 },
    { label: "Ene",  visits: 730  },
    { label: "Feb",  visits: 890  },
    { label: "Mar",  visits: 1050 },
    { label: "Abr",  visits: 1230 },
  ],
};

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useVisitStats(): UseVisitStatsReturn {
  const [stats,   setStats]   = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /*
     * TODO: reemplazar este bloque por el fetch real:
     *
     * Promise.all([
     *   api.get<{ data: DailyVisit[] }>("/api/admin/dashboard/visits?range=daily"),
     *   api.get<{ data: DailyVisit[] }>("/api/admin/dashboard/visits?range=weekly"),
     *   api.get<{ data: DailyVisit[] }>("/api/admin/dashboard/visits?range=monthly"),
     *   api.get<{ count: number }>("/api/admin/dashboard/online"),
     * ]).then(([daily, weekly, monthly, online]) => {
     *   if (cancelled) return;
     *   setStats({
     *     daily:         daily.data?.data   ?? [],
     *     weekly:        weekly.data?.data  ?? [],
     *     monthly:       monthly.data?.data ?? [],
     *     currentOnline: online.data?.count ?? 0,
     *   });
     *   setLoading(false);
     * });
     */

    const timer = setTimeout(() => {
      if (cancelled) return;
      setStats(MOCK_STATS);
      setLoading(false);
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return { stats, loading, error };
}