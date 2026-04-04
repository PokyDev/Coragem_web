"use client";

/**
 * src/hooks/admin/useProductMovement.ts
 *
 * Encapsula el registro de movimientos de inventario (PURCHASE / SALE)
 * para un producto específico.
 *
 * Responsabilidades:
 *   - Validar la cantidad antes de llamar al backend
 *   - Llamar a POST /api/admin/products/:productId/movements
 *   - Devolver el stock actualizado (stockAfter) para que el componente
 *     pueda actualizar su estado local sin necesidad de refetch global
 *   - Manejar errores de red y de negocio (stock insuficiente, etc.)
 */

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

/* ─── Tipos ─────────────────────────────────────────────────────── */

export type MovementType = "PURCHASE" | "SALE";

interface MovementResult {
  id:          string;
  type:        MovementType;
  quantity:    number;
  stockBefore: number;
  stockAfter:  number;
}

interface CreateMovementResponse {
  movement: MovementResult;
}

export interface UseProductMovementReturn {
  isLoading: boolean;
  error:     string | null;
  register:  (productId: string, type: MovementType, quantity: number) => Promise<MovementResult | null>;
  clearError: () => void;
}

/* ─── Hook ──────────────────────────────────────────────────────── */

export function useProductMovement(): UseProductMovementReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const register = useCallback(async (
    productId: string,
    type:      MovementType,
    quantity:  number,
  ): Promise<MovementResult | null> => {
    // Validación local antes de ir al backend
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("La cantidad debe ser un número entero mayor a cero");
      return null;
    }

    setIsLoading(true);
    setError(null);

    const res = await api.post<CreateMovementResponse>(
      `/api/admin/products/${productId}/movements`,
      { type, quantity },
    );

    setIsLoading(false);

    if (res.error || !res.data) {
      setError(res.error ?? "Error al registrar el movimiento");
      return null;
    }

    return res.data.movement;
  }, []);

  return { isLoading, error, register, clearError };
}