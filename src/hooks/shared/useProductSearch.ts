"use client";

/**
 * src/hooks/shared/useProductSearch.ts
 *
 * Hook de búsqueda de productos reutilizable.
 * Usado tanto en el catálogo público (CatalogToolbar) como en el
 * AdminTopbar del dashboard.
 *
 * Devuelve:
 *   - query        → valor actual del input
 *   - setQuery     → setter directo
 *   - clearQuery   → limpia el campo
 *   - inputProps   → props listos para conectar a un <input>
 */

import { useState, useCallback } from "react";

interface UseProductSearchOptions {
  /** Callback invocado en cada cambio de query (debounce opcional a cargo del consumidor) */
  onChange?: (value: string) => void;
  initialValue?: string;
}

export interface UseProductSearchReturn {
  query:      string;
  setQuery:   (v: string) => void;
  clearQuery: () => void;
  inputProps: {
    value:       string;
    onChange:    (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type:        string;
    autoComplete: string;
  };
}

export function useProductSearch({
  onChange,
  initialValue = "",
}: UseProductSearchOptions = {}): UseProductSearchReturn {
  const [query, setQueryState] = useState(initialValue);

  const setQuery = useCallback(
    (v: string) => {
      setQueryState(v);
      onChange?.(v);
    },
    [onChange]
  );

  const clearQuery = useCallback(() => {
    setQueryState("");
    onChange?.("");
  }, [onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
    },
    [setQuery]
  );

  return {
    query,
    setQuery,
    clearQuery,
    inputProps: {
      value:        query,
      onChange:     handleInputChange,
      placeholder:  "Buscar producto...",
      type:         "text",
      autoComplete: "off",
    },
  };
}