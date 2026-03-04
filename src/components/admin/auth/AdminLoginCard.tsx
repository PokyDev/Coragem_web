"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PatternLock } from "./PatternLock";
import { usePatternLock } from "@/hooks/admin/usePatternLock";
import styles from "./AdminLoginCard.module.css";

/* ─── Constantes ─────────────────────────────────────────────────── */
const MIN_PATTERN_NODES = 4;
const LOCKOUT_MS        = 30_000;

/* ─── Textos por step ─────────────────────────────────────────────── */
const STEP_COPY = {
  draw: {
    title:    "Define tu patrón",
    subtitle: "Dibuja un patrón de acceso. Mínimo 4 puntos. Luego tendrás que repetirlo para confirmar.",
  },
  confirm: {
    title:    "Confirma tu patrón",
    subtitle: "Vuelve a dibujar exactamente el mismo patrón para verificarlo.",
  },
  login: {
    title:    "Acceso Administrativo",
    subtitle: "Dibuja tu patrón de acceso para continuar.",
  },
};

/* ─── Componente ─────────────────────────────────────────────────── */
export function AdminLoginCard() {
  const router = useRouter();
  const {
    step,
    currentPattern,
    attempts,
    lockedUntil,
    isFirstTime,
    addNode,
    submitPattern,
    reset,
  } = usePatternLock();

  /* Estado UI local */
  const [uiStatus,    setUiStatus]    = useState<"idle" | "error" | "locked">("idle");
  const [feedback,    setFeedback]    = useState<string>("");
  const [countdown,   setCountdown]   = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Detectar dispositivo táctil */
  useEffect(() => {
    setIsTouchDevice(
      window.matchMedia("(pointer: coarse)").matches ||
      "ontouchstart" in window
    );
  }, []);

  /* ── Contador de bloqueo ── */
  useEffect(() => {
    if (!lockedUntil) return;

    setUiStatus("locked");
    setFeedback("Sistema bloqueado");

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) {
        setUiStatus("idle");
        setFeedback("");
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockedUntil]);

  /* ── Mensaje de feedback en tiempo real ── */
  useEffect(() => {
    if (uiStatus === "locked") return;
    if (currentPattern.length === 0) {
      setFeedback(step === "login" ? "Dibuja tu patrón" : "Dibuja el patrón");
      return;
    }
    setFeedback(`${currentPattern.length} punto${currentPattern.length !== 1 ? "s" : ""} seleccionado${currentPattern.length !== 1 ? "s" : ""}`);
  }, [currentPattern, step, uiStatus]);

  /* ── onNodeEnter: solo actúa si no está bloqueado ── */
  const handleNodeEnter = useCallback((node: number) => {
    if (uiStatus === "locked") return;
    if (uiStatus === "error") setUiStatus("idle");
    addNode(node);
  }, [uiStatus, addNode]);

  /* ── Confirmar patrón ── */
  const handleSubmit = useCallback(async () => {
    if (currentPattern.length < MIN_PATTERN_NODES) {
      showError("Mínimo 4 puntos");
      return;
    }

    const result = submitPattern();

    if (result === "locked") {
      setUiStatus("locked");
      setFeedback("Sistema bloqueado");
      return;
    }

    if (result === "error") {
      if (step === "confirm") {
        showError("Los patrones no coinciden. Inténtalo de nuevo.");
      } else if (step === "login") {
        showError(getLoginErrorMsg());
      } else {
        showError("Error al procesar el patrón.");
      }
      return;
    }

    /* ── result === "ok" ── */
    if (step === "draw") {
      /* Primera vez: pasó a confirm */
      setFeedback("Ahora confirma el patrón");
      setUiStatus("idle");
      return;
    }

    if (step === "confirm") {
      /* Patrón registrado correctamente */
      await showSuccess("✓ Patrón definido correctamente");
      router.push("/admin/dashboard");
      return;
    }

    if (step === "login") {
      /* Acceso concedido */
      await showSuccess("✓ Acceso concedido");
      router.push("/admin/dashboard");
    }
  }, [currentPattern, submitPattern, step, router]);

  /* ── Helpers de feedback ── */
  function showError(msg: string) {
    setUiStatus("error");
    setFeedback(msg);
    setTimeout(() => {
      reset();
      setUiStatus("idle");
      setFeedback("");
    }, 1400);
  }

  function showSuccess(msg: string): Promise<void> {
    return new Promise((resolve) => {
      setFeedback(msg);
      /* Usamos un pequeño delay para que el usuario vea el feedback */
      setTimeout(resolve, 800);
    });
  }

  function getLoginErrorMsg() {
    const remaining = 5 - (attempts + 1);
    if (remaining <= 0) return "Acceso bloqueado temporalmente.";
    if (remaining === 1) return "Patrón incorrecto. Último intento.";
    return `Patrón incorrecto. ${remaining} intentos restantes.`;
  }

  /* ── Copy dinámico ── */
  const copy = STEP_COPY[step];

  /* ── Estado del grid ── */
  const gridStatus = uiStatus === "locked" ? "locked" : uiStatus;

  return (
    <div className={styles.root}>
      <div className={styles.layout}>

        {/* ── Panel izquierdo: instrucciones ── */}
        <div className={styles.infoPanel}>

          {/* Marca */}
          <div className={styles.brand}>
            <div className={styles.brandName}>CORA<span>GEM</span></div>
            <div className={styles.brandRole}>Panel Administrativo</div>
          </div>

          <div className={styles.divider} />

          {/* Instrucciones de dispositivo */}
          <div className={styles.instructions}>
            <div className={styles.instructionsTitle}>Cómo funciona</div>

            <div className={styles.deviceCard}>
              <span className={styles.deviceIcon}>📱</span>
              <div className={styles.deviceContent}>
                <span className={styles.deviceLabel}>Táctil (móvil / tablet)</span>
                <span className={styles.deviceDesc}>
                  Mantén presionado y arrastra el dedo por los puntos del patrón de forma continua.
                </span>
              </div>
            </div>

            <div className={styles.deviceCard}>
              <span className={styles.deviceIcon}>🖥️</span>
              <div className={styles.deviceContent}>
                <span className={styles.deviceLabel}>Escritorio (mouse)</span>
                <span className={styles.deviceDesc}>
                  Mantén el click sostenido y arrastra el cursor por los puntos para construir tu patrón.
                </span>
              </div>
            </div>

            <div className={styles.deviceCard} style={{ borderColor: "rgba(78,196,196,0.2)" }}>
              <span className={styles.deviceIcon}>🔒</span>
              <div className={styles.deviceContent}>
                <span className={styles.deviceLabel}>Seguridad</span>
                <span className={styles.deviceDesc}>
                  Después de 5 intentos fallidos, el acceso se bloqueará por 30 segundos.
                </span>
              </div>
            </div>
          </div>

          {/* Badge de estado actual */}
          <div
            className={`${styles.statusBadge} ${
              isFirstTime ? styles.badgeFirstTime : styles.badgeLogin
            }`}
          >
            <div className={styles.statusBadgeDot} />
            {isFirstTime ? "Primera configuración" : "Patrón configurado"}
          </div>
        </div>

        {/* ── Panel derecho: patrón ── */}
        <div className={styles.patternPanel}>

          {/* Encabezado */}
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>{copy.title}</div>
            <div className={styles.panelSubtitle}>{copy.subtitle}</div>
          </div>

          {/* Área del grid */}
          <div className={styles.patternArea}>

            {/* Feedback de texto */}
            <div
              className={`${styles.feedback} ${
                uiStatus === "error"    ? styles.feedbackError   :
                uiStatus === "locked"  ? styles.feedbackLocked  :
                currentPattern.length > 0 ? styles.feedbackDrawing :
                styles.feedbackIdle
              }`}
            >
              {feedback || "\u00A0"}
            </div>

            {/* Countdown si está bloqueado */}
            {uiStatus === "locked" && countdown > 0 && (
              <>
                <div className={styles.lockCountdown}>{countdown}s</div>
                <div className={styles.lockMessage}>
                  Demasiados intentos fallidos.<br />Por favor espera para continuar.
                </div>
              </>
            )}

            {/* Grid de patrón */}
            {uiStatus !== "locked" && (
              <PatternLock
                activeNodes={currentPattern}
                onNodeEnter={handleNodeEnter}
                status={gridStatus}
                disabled={false}
              />
            )}

            {/* Dots de progreso */}
            {uiStatus !== "locked" && (
              <div className={styles.progressDots}>
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className={`${styles.progressDot} ${
                      i < currentPattern.length
                        ? uiStatus === "error"
                          ? styles.progressDotError
                          : styles.progressDotActive
                        : ""
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Intentos restantes (solo en login) */}
          {step === "login" && attempts > 0 && uiStatus !== "locked" && (
            <div className={styles.attemptsInfo}>
              Intentos fallidos: <span>{attempts}</span> / 5
            </div>
          )}

          {/* Botones */}
          {uiStatus !== "locked" && (
            <div className={styles.btnRow}>
              <button
                className={styles.clearBtn}
                onClick={reset}
                disabled={currentPattern.length === 0}
              >
                Limpiar
              </button>
              <button
                className={styles.actionBtn}
                onClick={handleSubmit}
                disabled={currentPattern.length < MIN_PATTERN_NODES}
              >
                {step === "draw"    ? "Continuar"  :
                 step === "confirm" ? "Confirmar"  :
                 "Acceder"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}