/**
 * src/hooks/shared/useProducts.ts
 *
 * Carga productos una sola vez al montar.
 * El filtrado, ordenamiento y búsqueda ocurren en cliente
 * para una experiencia sin latencia entre interacciones.
 *
 * adminMode: true  → GET /api/admin/products  (todos, sin filtro isVisible)
 * adminMode: false → GET /api/products        (solo isVisible = true)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/types/catalog';

interface UseProductsOptions {
  /**
   * Si true, usa el endpoint admin que devuelve todos los productos
   * independientemente de isVisible. Requiere sesión activa.
   * Por defecto false (endpoint público).
   */
  adminMode?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

interface ProductsResponse {
  products: Product[];
}

export function useProducts({ adminMode = false }: UseProductsOptions = {}): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [tick,     setTick]     = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  // Derivar el endpoint fuera del efecto y pasarlo como dependencia explícita
  // para que React lo capture correctamente en cada ejecución del efecto.
  const endpoint = adminMode ? '/api/admin/products' : '/api/products';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.get<ProductsResponse>(endpoint).then((res) => {
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
  // endpoint es estable (mismo valor de adminMode en toda la vida del componente),
  // pero incluirlo garantiza que el efecto se re-ejecute si cambiara.
  }, [tick, endpoint]);

  return { products, loading, error, refetch };
}