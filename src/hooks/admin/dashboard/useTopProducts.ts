"use client";

/**
 * src/hooks/admin/dashboard/useTopProducts.ts
 *
 * Devuelve los 5 productos más vendidos para el widget del dashboard.
 *
 * Estado actual: datos hardcodeados (mock).
 * Integración futura: reemplazar `MOCK_TOP_PRODUCTS` por una llamada a
 *   GET /api/admin/dashboard/top-products?limit=5
 * El shape de TopProduct no cambia — solo eliminar el mock y descomentar
 * el bloque de fetch.
 */

import { useState, useEffect } from "react";

/* ── Tipo público ─────────────────────────────────────────────────── */

export interface TopProduct {
  id:       string;
  name:     string;
  imageUrl: string | null;
  price:    number;
  ventas:   number;
  stock:    number;
}

export interface UseTopProductsReturn {
  products: TopProduct[];
  loading:  boolean;
  error:    string | null;
}

/* ── Mock (eliminar cuando el endpoint esté listo) ────────────────── */

const MOCK_TOP_PRODUCTS: TopProduct[] = [
  {
    id:       "mock-1",
    name:     "Cadena trébol corta",
    imageUrl: null,
    price:    30000,
    ventas:   89,
    stock:    0,
  },
  {
    id:       "mock-2",
    name:     "Anillo de corazón",
    imageUrl: null,
    price:    12000,
    ventas:   58,
    stock:    3,
  },
  {
    id:       "mock-3",
    name:     "Conjunto rosa roja",
    imageUrl: null,
    price:    24000,
    ventas:   67,
    stock:    2,
  },
  {
    id:       "mock-4",
    name:     "Cadena Singapur",
    imageUrl: null,
    price:    9000,
    ventas:   76,
    stock:    8,
  },
  {
    id:       "mock-5",
    name:     "Candongas doble cara",
    imageUrl: null,
    price:    15000,
    ventas:   43,
    stock:    10,
  },
];

/* ── Hook ─────────────────────────────────────────────────────────── */

export function useTopProducts(): UseTopProductsReturn {
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    /*
     * TODO: reemplazar este bloque por el fetch real cuando el
     * endpoint GET /api/admin/dashboard/top-products esté disponible:
     *
     * api.get<{ products: TopProduct[] }>("/api/admin/dashboard/top-products?limit=5")
     *   .then((res) => {
     *     if (cancelled) return;
     *     if (res.error || !res.data) { setError(res.error ?? "Error"); }
     *     else { setProducts(res.data.products); }
     *     setLoading(false);
     *   });
     */

    const timer = setTimeout(() => {
      if (cancelled) return;
      setProducts(MOCK_TOP_PRODUCTS);
      setLoading(false);
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return { products, loading, error };
}