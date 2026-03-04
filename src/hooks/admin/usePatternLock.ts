"use client";

import { useState, useCallback, useRef } from "react";

/* ─── Constantes ─────────────────────────────────────────────────── */
const STORAGE_KEY   = "coragem_admin_pattern";
const MAX_ATTEMPTS  = 5;
const LOCKOUT_MS    = 30_000; // 30 segundos

/* ─── Tipos ──────────────────────────────────────────────────────── */
export type PatternStep = "draw" | "confirm" | "login";

export interface UsePatternLockReturn {
  /* Estado */
  step:          PatternStep;
  currentPattern: number[];
  attempts:       number;
  lockedUntil:    number | null;
  isFirstTime:    boolean;

  /* Acciones */
  addNode:       (node: number) => void;
  submitPattern: () => "ok" | "error" | "locked";
  reset:         () => void;
  clearStorage:  () => void;   // util para dev / reset manual
}

/* ─── Helpers de storage ─────────────────────────────────────────── */
function loadPattern(): number[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every((n) => typeof n === "number")) {
      return parsed as number[];
    }
    return null;
  } catch {
    return null;
  }
}

function savePattern(pattern: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pattern));
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/* ─── Hook ───────────────────────────────────────────────────────── */
export function usePatternLock(): UsePatternLockReturn {
  /* Determinar si ya hay patrón guardado */
  const savedPattern = useRef<number[] | null>(null);

  /* Iniciamos estado en función de si hay patrón guardado */
  const [isFirstTime,     setIsFirstTime]     = useState<boolean>(() => {
    savedPattern.current = loadPattern();
    return savedPattern.current === null;
  });
  const [step,            setStep]            = useState<PatternStep>(() =>
    savedPattern.current === null ? "draw" : "login"
  );
  const [currentPattern,  setCurrentPattern]  = useState<number[]>([]);
  const [firstDraft,      setFirstDraft]       = useState<number[]>([]);   // solo en flujo de registro
  const [attempts,        setAttempts]         = useState(0);
  const [lockedUntil,     setLockedUntil]      = useState<number | null>(null);

  /* ── addNode: agrega nodo al patrón en curso ── */
  const addNode = useCallback((node: number) => {
    setCurrentPattern((prev) => {
      if (prev.includes(node)) return prev;   // nodo ya visitado
      return [...prev, node];
    });
  }, []);

  /* ── submitPattern ── */
  const submitPattern = useCallback((): "ok" | "error" | "locked" => {
    /* Verificar bloqueo activo */
    if (lockedUntil !== null && Date.now() < lockedUntil) {
      return "locked";
    }

    const pattern = currentPattern;

    /* Mínimo 4 nodos */
    if (pattern.length < 4) {
      setCurrentPattern([]);
      return "error";
    }

    /* ── Flujo: primer registro ── */
    if (isFirstTime && step === "draw") {
      setFirstDraft(pattern);
      setCurrentPattern([]);
      setStep("confirm");
      return "ok";
    }

    if (isFirstTime && step === "confirm") {
      if (arraysEqual(firstDraft, pattern)) {
        savePattern(pattern);
        savedPattern.current = pattern;
        setIsFirstTime(false);
        setCurrentPattern([]);
        setStep("login");
        return "ok";
      } else {
        setCurrentPattern([]);
        return "error";
      }
    }

    /* ── Flujo: login con patrón existente ── */
    const stored = savedPattern.current ?? loadPattern();
    if (!stored) {
      setCurrentPattern([]);
      return "error";
    }

    if (arraysEqual(stored, pattern)) {
      setAttempts(0);
      setCurrentPattern([]);
      return "ok";
    }

    /* Patrón incorrecto */
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setCurrentPattern([]);

    if (newAttempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_MS;
      setLockedUntil(until);
      setAttempts(0);
      /* Auto-desbloqueo */
      setTimeout(() => {
        setLockedUntil(null);
      }, LOCKOUT_MS);
    }

    return "error";
  }, [currentPattern, step, isFirstTime, firstDraft, attempts, lockedUntil]);

  /* ── reset: limpia patrón en curso sin perder step ── */
  const reset = useCallback(() => {
    setCurrentPattern([]);
  }, []);

  /* ── clearStorage: elimina patrón guardado (dev/reset) ── */
  const clearStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    savedPattern.current = null;
    setIsFirstTime(true);
    setStep("draw");
    setCurrentPattern([]);
    setFirstDraft([]);
    setAttempts(0);
    setLockedUntil(null);
  }, []);

  return {
    step,
    currentPattern,
    attempts,
    lockedUntil,
    isFirstTime,
    addNode,
    submitPattern,
    reset,
    clearStorage,
  };
}