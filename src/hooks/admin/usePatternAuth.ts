"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import type { PatternAuthPhase, PatternAuthState } from "@/types/admin";

interface PatternExistsResponse { exists: boolean }
interface PatternSaveResponse   { message: string }
interface PatternVerifyResponse { match: boolean }

const MESSAGES: Record<PatternAuthPhase, string> = {
  "loading":       "Verificando sistema…",
  "setup-define":  "Dibuja el patrón que usarás para ingresar",
  "setup-confirm": "Repite el mismo patrón para confirmar",
  "verify":        "Ingresa tu patrón para continuar",
  "locked":        "Demasiados intentos fallidos. Intenta de nuevo más tarde.",
  "authenticated": "Patrón correcto ✓",
};

export interface UsePatternAuthReturn {
  auth:              PatternAuthState;
  onPatternComplete: (nodes: number[]) => Promise<void>;
  onPatternReset:    () => void;
  gridResetRef:         React.MutableRefObject<(() => void) | null>;
  intentionalResetRef:  React.MutableRefObject<boolean>;
}

export function usePatternAuth(): UsePatternAuthReturn {
  const [auth, setAuth] = useState<PatternAuthState>({
    phase:          "loading",
    statusMsg:      MESSAGES["loading"],
    failedAttempts: 0,
  });

  const phaseRef        = useRef<PatternAuthPhase>("loading");
  const firstPatternRef = useRef<number[] | null>(null);
  const gridResetRef    = useRef<(() => void) | null>(null);
  /**
   * Cuando nosotros llamamos resetPattern() intencionalmente (después de
   * procesar un patrón), activamos este flag para que onPatternReset
   * ignore el evento idle que genera ese reset y no revierta la fase.
   */
  const intentionalResetRef = useRef(false);

  function setPhase(phase: PatternAuthPhase, overrideMsg?: string) {
    console.log(`[PatternAuth] setPhase: ${phaseRef.current} → ${phase}`, overrideMsg ?? "");
    phaseRef.current = phase;
    setAuth((prev) => ({ ...prev, phase, statusMsg: overrideMsg ?? MESSAGES[phase] }));
  }

  function setError(msg: string) {
    console.log("[PatternAuth] setError:", msg);
    setAuth((prev) => ({ ...prev, statusMsg: msg, failedAttempts: prev.failedAttempts + 1 }));
  }

  /* ── 1. Consultar existencia del patrón al montar ── */
  useEffect(() => {
    let cancelled = false;
    console.log("[PatternAuth] montado — consultando GET /api/pattern/exists");

    async function checkExists() {
      const res = await api.get<PatternExistsResponse>("/api/pattern/exists");
      console.log("[PatternAuth] /api/pattern/exists respuesta:", res);
      if (cancelled) return;
      if (res.error) { setPhase("setup-define"); return; }
      setPhase(res.data!.exists ? "verify" : "setup-define");
    }

    checkExists();
    return () => { cancelled = true; };
  }, []);

  /* ── 2. Callback principal ── */
  const onPatternComplete = useCallback(async (nodes: number[]) => {
    const currentPhase = phaseRef.current;
    console.log(`[PatternAuth] onPatternComplete — phase: ${currentPhase} | nodes:`, nodes);

    if (currentPhase === "setup-define") {
      console.log("[PatternAuth] setup-define: guardando primer patrón, pasando a setup-confirm");
      firstPatternRef.current = nodes;
      setPhase("setup-confirm");
      return;
    }

    if (currentPhase === "setup-confirm") {
      const first = firstPatternRef.current;
      console.log("[PatternAuth] setup-confirm: comparando", nodes.join("-"), "vs", first?.join("-"));

      if (!first || nodes.join("-") !== first.join("-")) {
        console.log("[PatternAuth] setup-confirm: NO coinciden → volviendo a setup-define");
        firstPatternRef.current = null;
        // El grid se resetea solo desde el .finally() de PatternCard —
        // ese reset también es intencional, marcarlo para que onPatternReset lo ignore.
        intentionalResetRef.current = true;
        setPhase("setup-define", "Los patrones no coinciden. Empieza de nuevo.");
        return;
      }

      console.log("[PatternAuth] setup-confirm: coinciden → POST /api/pattern");
      const res = await api.post<PatternSaveResponse>("/api/pattern", { nodes });
      console.log("[PatternAuth] POST /api/pattern respuesta:", res);

      if (res.error) {
        firstPatternRef.current = null;
        intentionalResetRef.current = true;
        setPhase("setup-define", res.error);
        return;
      }

      firstPatternRef.current = null;
      setPhase("authenticated");
      return;
    }

    if (currentPhase === "verify") {
      console.log("[PatternAuth] verify → POST /api/pattern/verify");
      const res = await api.post<PatternVerifyResponse>("/api/pattern/verify", { nodes });
      console.log("[PatternAuth] POST /api/pattern/verify respuesta:", res);

      if (res.retryAfter !== undefined) {
        phaseRef.current = "locked";
        setAuth((prev) => ({ ...prev, phase: "locked", statusMsg: MESSAGES["locked"], lockedUntil: res.retryAfter }));
        return;
      }
      if (res.error) { setError(res.error); return; }
      if (!res.data?.match) { setError("Patrón incorrecto. Inténtalo de nuevo."); return; }

      setPhase("authenticated");
      return;
    }

    console.warn("[PatternAuth] onPatternComplete llamado en fase inesperada:", currentPhase);
  }, []);

  /* ── 3. Reset del grid ── */
  const onPatternReset = useCallback(() => {
    const currentPhase = phaseRef.current;

    // Si el reset fue intencional (lo provocamos nosotros desde onPatternComplete
    // o desde resetPattern tras procesar el patrón), ignorarlo y limpiar el flag.
    if (intentionalResetRef.current) {
      console.log("[PatternAuth] onPatternReset — reset intencional, ignorando. phase:", currentPhase);
      intentionalResetRef.current = false;
      return;
    }

    console.log("[PatternAuth] onPatternReset — reset orgánico, phase:", currentPhase);

    // Solo revertir a setup-define si el usuario abandonó el paso de confirmación
    // (ej: dibujó menos de MIN_NODES y el grid se reseteó solo por el timer interno)
    if (currentPhase === "setup-confirm") {
      firstPatternRef.current = null;
      setPhase("setup-define");
    }
  }, []);

  return { auth, onPatternComplete, onPatternReset, gridResetRef, intentionalResetRef };
}