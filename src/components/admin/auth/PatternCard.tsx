"use client";

import { useEffect, useRef } from "react";
import { usePatternLock } from "@/hooks/admin/usePatternLock";
import { PatternLock }    from "@/components/admin/auth/PatternLock";
import type { PatternAuthPhase } from "@/types/admin";

interface PatternCardProps {
  phase:             PatternAuthPhase;
  externalStatusMsg: string;
  onPatternComplete: (nodes: number[]) => Promise<void>;
  onPatternReset:    () => void;
  gridResetRef:      React.MutableRefObject<(() => void) | null>;
  /**
   * Ref que PatternCard activa ANTES de llamar resetPattern() cuando
   * el reset es intencional (tras procesar un patrón). Permite que
   * onPatternReset en usePatternAuth lo ignore en lugar de revertir la fase.
   */
  intentionalResetRef: React.MutableRefObject<boolean>;
}

const PHASE_COPY: Partial<Record<PatternAuthPhase, { title: string; sub: string }>> = {
  "setup-define":  { title: "Configura tu acceso",      sub: "Dibuja el patrón que usarás para ingresar al panel" },
  "setup-confirm": { title: "Confirma el patrón",       sub: "Repite el mismo patrón para verificar" },
  "verify":        { title: "Autenticación por patrón", sub: "Ingresa tu patrón de acceso para continuar" },
  "locked":        { title: "Acceso bloqueado",         sub: "Demasiados intentos fallidos. Intenta de nuevo en unos minutos." },
};

function SetupProgress({ phase }: { phase: PatternAuthPhase }) {
  if (phase !== "setup-define" && phase !== "setup-confirm") return null;
  return (
    <div className="pc-progress">
      <div className={`pc-progress__step ${phase === "setup-define" ? "pc-progress__step--active" : "pc-progress__step--done"}`}>
        <span>1</span><span>Define</span>
      </div>
      <div className="pc-progress__line" />
      <div className={`pc-progress__step ${phase === "setup-confirm" ? "pc-progress__step--active" : ""}`}>
        <span>2</span><span>Confirma</span>
      </div>
    </div>
  );
}

export function PatternCard({
  phase,
  externalStatusMsg,
  onPatternComplete,
  onPatternReset,
  gridResetRef,
  intentionalResetRef,
}: PatternCardProps) {
  const {
    pattern,
    patternRef,
    state,
    cursor,
    statusMsg: internalStatusMsg,
    nodeCenters,
    wrapperRef,
    svgRef,
    handleWrapperMouseDown,
    handleWrapperMouseMove,
    resetPattern,
  } = usePatternLock();

  const isLocked = phase === "locked";

  const onCompleteRef = useRef(onPatternComplete);
  const onResetRef    = useRef(onPatternReset);
  useEffect(() => { onCompleteRef.current = onPatternComplete; }, [onPatternComplete]);
  useEffect(() => { onResetRef.current    = onPatternReset;    }, [onPatternReset]);

  useEffect(() => {
    console.log("[PatternCard] conectando gridResetRef con resetPattern");
    gridResetRef.current = resetPattern;
  }, [gridResetRef, resetPattern]);

  useEffect(() => {
    console.log("[PatternCard] state cambió a:", state, "| phase actual:", phase);

    if (state === "success") {
      const nodes = [...patternRef.current];
      console.log("[PatternCard] state=success — nodes desde patternRef:", nodes, "| phase:", phase);

      onCompleteRef.current(nodes).finally(() => {
        console.log("[PatternCard] onPatternComplete resolvió — marcando reset intencional y llamando resetPattern()");
        // Marcar ANTES de resetear para que onPatternReset lo ignore
        intentionalResetRef.current = true;
        resetPattern();
      });
    }

    if (state === "idle") {
      console.log("[PatternCard] state=idle — notificando onPatternReset");
      onResetRef.current();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const visibleMsg = externalStatusMsg || internalStatusMsg;
  const gridState  = isLocked ? "error" : state;
  const copy       = PHASE_COPY[phase];

  return (
    <div className="pc-card">
      <div className="pc-brand">
        <span className="pc-brand__logo">CORA<span>GEM</span></span>
        <span className="pc-brand__sub">Panel Administrativo</span>
      </div>
      <div className="pc-divider" />
      {copy && (
        <div className="pc-titles">
          <p className="pc-label">{copy.title}</p>
          <p className="pc-sub">{copy.sub}</p>
        </div>
      )}
      <SetupProgress phase={phase} />
      <PatternLock
        pattern={pattern}
        state={gridState}
        cursor={cursor}
        nodeCenters={nodeCenters.current}
        svgRef={svgRef}
        wrapperRef={wrapperRef}
        onMouseDown={isLocked ? undefined : handleWrapperMouseDown}
        onMouseMove={isLocked ? undefined : handleWrapperMouseMove}
        disabled={isLocked}
      />
      <div className={`pc-status pc-status--${isLocked ? "error" : state}`}>
        {state === "idle"    && !isLocked && <span className="pc-status__dot" />}
        {(state === "error" || isLocked)  && <span className="pc-status__icon">✕</span>}
        {state === "success" && !isLocked && <span className="pc-status__icon pc-status__icon--ok">✓</span>}
        <span>{visibleMsg}</span>
      </div>
      <style>{`
        .pc-card { width:100%; background:var(--admin-bg-card); border:1px solid var(--admin-border); border-radius:20px; padding:1.5rem 2rem 1.25rem; display:flex; flex-direction:column; align-items:center; box-shadow:var(--admin-shadow-card); }
        .pc-brand { display:flex; flex-direction:column; align-items:center; gap:0.3rem; margin-bottom:1rem; }
        .pc-brand__logo { font-family:var(--font-jost),sans-serif; font-size:1.05rem; font-weight:800; letter-spacing:0.2em; text-transform:uppercase; color:var(--admin-text); }
        .pc-brand__logo span { color:var(--admin-accent); }
        .pc-brand__sub { font-family:var(--font-jost),sans-serif; font-size:0.58rem; font-weight:500; letter-spacing:0.16em; text-transform:uppercase; color:var(--admin-text-dim); }
        .pc-divider { width:100%; height:1px; background:linear-gradient(90deg,transparent 0%,var(--admin-border) 25%,rgba(78,196,196,0.3) 50%,var(--admin-border) 75%,transparent 100%); margin-bottom:1rem; }
        .pc-titles { text-align:center; margin-bottom:0.75rem; }
        .pc-label { font-family:var(--font-cormorant),serif; font-size:1.2rem; font-weight:600; color:var(--admin-text); letter-spacing:0.02em; margin-bottom:0.3rem; }
        .pc-sub { font-family:var(--font-jost),sans-serif; font-size:0.65rem; color:var(--admin-text-muted); letter-spacing:0.03em; line-height:1.6; max-width:260px; margin:0 auto; }
        .pc-progress { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.85rem; }
        .pc-progress__step { display:flex; align-items:center; gap:0.35rem; font-family:var(--font-jost),sans-serif; font-size:0.62rem; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--admin-text-dim); transition:color 0.2s ease; }
        .pc-progress__step span:first-child { width:18px; height:18px; border-radius:50%; border:1.5px solid var(--admin-border); display:flex; align-items:center; justify-content:center; font-size:0.6rem; transition:border-color 0.2s ease,background 0.2s ease,color 0.2s ease; }
        .pc-progress__step--active { color:var(--admin-accent); }
        .pc-progress__step--active span:first-child { border-color:var(--admin-accent); background:rgba(78,196,196,0.12); color:var(--admin-accent); }
        .pc-progress__step--done { color:var(--admin-accent); opacity:0.6; }
        .pc-progress__step--done span:first-child { border-color:var(--admin-accent); background:rgba(78,196,196,0.08); color:var(--admin-accent); }
        .pc-progress__line { flex:1; height:1px; background:var(--admin-border); width:24px; }
        .pc-status { display:flex; align-items:center; gap:0.45rem; font-family:var(--font-jost),sans-serif; font-size:0.72rem; font-weight:500; letter-spacing:0.04em; min-height:1.4rem; transition:color 0.2s ease; margin-bottom:0.6rem; text-align:center; }
        .pc-status--idle { color:var(--admin-text-muted); }
        .pc-status--drawing { color:var(--admin-accent); }
        .pc-status--success { color:var(--admin-accent); }
        .pc-status--error { color:var(--admin-danger); }
        .pc-status__dot { width:5px; height:5px; border-radius:50%; background:var(--admin-text-dim); flex-shrink:0; }
        .pc-status__icon { font-size:0.7rem; font-weight:700; color:var(--admin-danger); }
        .pc-status__icon--ok { color:var(--admin-accent); }

        /* ── Responsive: ocultar borde en móvil ── */
        @media (max-width: 600px) {
          .pc-card { border-color: transparent; box-shadow: none; }
        } 
      `}</style>
    </div>
  );
}