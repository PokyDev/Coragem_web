/**
 * src/hooks/user/useProducts.ts
 *
 * Carga todos los productos visibles una sola vez al montar.
 * El filtrado, ordenamiento y búsqueda ocurren en cliente
 * para una experiencia sin latencia entre interacciones.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types/catalog';

interface UseProductsReturn {
  products: Product[];
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

interface ProductsResponse {
  products: Product[];
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get<ProductsResponse>('/api/products').then((res) => {
      if (cancelled) return;

      if (res.error || !res.data) {
        setError(res.error ?? 'Error al cargar productos');
        setProducts([]);
      } else {
        setProducts(res.data.products);
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [tick]);

  return { products, loading, error, refetch };
}