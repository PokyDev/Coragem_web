"use client";

/**
 * src/hooks/admin/usePatternAuth.ts
 *
 * Orquesta el flujo completo de autenticación por patrón.
 * Expone un `gridResetRef` que PatternCard conecta con su resetPattern(),
 * permitiendo que el hook fuerce un reset del grid sin prop drilling.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { PatternAuthPhase, PatternAuthState } from "@/types/admin";

interface PatternExistsResponse { exists: boolean }
interface PatternSaveResponse   { message: string }
interface PatternVerifyResponse { match: boolean }

const MESSAGES: Record<PatternAuthPhase, string> = {
  "loading":        "Verificando sistema…",
  "setup-define":   "Dibuja el patrón que usarás para ingresar",
  "setup-confirm":  "Repite el mismo patrón para confirmar",
  "verify":         "Ingresa tu patrón para continuar",
  "locked":         "Demasiados intentos fallidos. Intenta de nuevo más tarde.",
  "authenticated":  "Patrón correcto ✓",
};

export interface UsePatternAuthReturn {
  auth:              PatternAuthState;
  onPatternComplete: (nodes: number[]) => Promise<void>;
  onPatternReset:    () => void;
  /**
   * PatternCard debe asignar su función resetPattern() a este ref
   * para que el hook pueda forzar un reset del grid cuando lo necesite
   * (ej: patrones no coinciden en setup-confirm).
   */
  gridResetRef: React.MutableRefObject<(() => void) | null>;
}

export function usePatternAuth(): UsePatternAuthReturn {
  const [auth, setAuth] = useState<PatternAuthState>({
    phase:          "loading",
    statusMsg:      MESSAGES["loading"],
    failedAttempts: 0,
  });

  const firstPatternRef = useRef<number[] | null>(null);
  /** Conectado por PatternCard con su resetPattern() */
  const gridResetRef    = useRef<(() => void) | null>(null);

  /* ── Helpers ── */

  function setPhase(phase: PatternAuthPhase, overrideMsg?: string) {
    setAuth((prev) => ({
      ...prev,
      phase,
      statusMsg: overrideMsg ?? MESSAGES[phase],
    }));
  }

  function setError(msg: string) {
    setAuth((prev) => ({
      ...prev,
      statusMsg:      msg,
      failedAttempts: prev.failedAttempts + 1,
    }));
  }

  /* ── 1. Consultar existencia del patrón al montar ── */

  useEffect(() => {
    let cancelled = false;

    async function checkExists() {
      const res = await api.get<PatternExistsResponse>("/api/pattern/exists");
      if (cancelled) return;
      if (res.error) {
        setPhase("setup-define");
        return;
      }
      setPhase(res.data!.exists ? "verify" : "setup-define");
    }

    checkExists();
    return () => { cancelled = true; };
  }, []);

  /* ── 2. Callback principal: el usuario completó un patrón ── */

  const onPatternComplete = useCallback(async (nodes: number[]) => {
    const currentPhase = auth.phase;

    /* ── setup-define: guardar el primer patrón y pedir confirmación ── */
    if (currentPhase === "setup-define") {
      firstPatternRef.current = nodes;
      // Actualizar solo el mensaje del status, la fase cambia a setup-confirm.
      // El grid se reseteará desde el .finally() en PatternCard.
      setPhase("setup-confirm");
      return;
    }

    /* ── setup-confirm: comparar con el primero ── */
    if (currentPhase === "setup-confirm") {
      const first = firstPatternRef.current;

      if (!first || nodes.join("-") !== first.join("-")) {
        firstPatternRef.current = null;
        setPhase("setup-define", "Los patrones no coinciden. Empieza de nuevo.");
        // El grid ya se reseteará desde el .finally() en PatternCard
        return;
      }

      // Coinciden → enviar al backend
      const res = await api.post<PatternSaveResponse>("/api/pattern", { nodes });

      if (res.error) {
        firstPatternRef.current = null;
        setPhase("setup-define", res.error);
        return;
      }

      firstPatternRef.current = null;
      setPhase("authenticated");
      return;
    }

    /* ── verify: comparar contra el patrón almacenado en el backend ── */
    if (currentPhase === "verify") {
      const res = await api.post<PatternVerifyResponse>("/api/pattern/verify", { nodes });

      if (res.retryAfter !== undefined) {
        setAuth((prev) => ({
          ...prev,
          phase:       "locked",
          statusMsg:   MESSAGES["locked"],
          lockedUntil: res.retryAfter,
        }));
        return;
      }

      if (res.error) {
        setError(res.error);
        return;
      }

      if (!res.data?.match) {
        setError("Patrón incorrecto. Inténtalo de nuevo.");
        return;
      }

      setPhase("authenticated");
      return;
    }
  }, [auth.phase]);

  /* ── 3. Reset del grid ── */

  const onPatternReset = useCallback(() => {
    // Solo aplica si estamos en setup-confirm y el grid vuelve a idle
    // por el timer interno (MIN_NODES no alcanzado, etc.)
    if (auth.phase === "setup-confirm") {
      firstPatternRef.current = null;
      setPhase("setup-define");
    }
  }, [auth.phase]);

  return { auth, onPatternComplete, onPatternReset, gridResetRef };
}