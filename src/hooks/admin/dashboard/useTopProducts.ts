"use client";

/**
 * src/hooks/admin/dashboard/useTopProducts.ts
 *
 * Devuelve los productos más vendidos para el widget del dashboard.
 * Consume GET /admin/products/top (endpoint protegido por sesión).
 */

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

/* ── Tipos públicos ───────────────────────────────────────────────── */

export interface ProductImage {
  id:      string;
  url:     string;
  order:   number;
  width?:  number;
  height?: number;
}

export interface TopProduct {
  id:     string;
  name:   string;
  images: ProductImage[];
  price:  number;
  ventas: number;
  stock:  number;
}

export interface UseTopProductsReturn {
  products: TopProduct[];
  loading:  boolean;
  error:    string | null;
}

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useTopProducts(): UseTopProductsReturn {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    api.get<TopProduct[]>("/api/admin/products/top").then((res) => {
      if (cancelled) return;
      if (res.error || !res.data) {
        setError(res.error ?? "Error al cargar los productos");
      } else {
        setProducts(res.data);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}