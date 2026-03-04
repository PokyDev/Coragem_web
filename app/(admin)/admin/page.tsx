"use client";

/**
 * app/(admin)/admin/page.tsx
 *
 * Pantalla de autenticación del panel administrativo.
 *
 * Orquesta dos tarjetas en el mismo espacio:
 *   1. PatternCard      — visible inicialmente.
 *   2. GoogleSignInCard — se revela tras un patrón válido y permanece
 *                         visible hasta que la página se recargue.
 *
 * La transición (deslizamiento derecha / entrada izquierda) es permanente:
 * una vez que showGoogle es true, onPatternReset ya no puede revertirlo.
 * Esto se logra ignorando el callback de reset cuando ya se autenticó.
 *
 * Estilos: app/(admin)/admin/css/page.module.css
 */

import { useState, useCallback } from "react";
import { PatternCard }      from "@/components/admin/auth/PatternCard";
import { GoogleSignInCard } from "@/components/admin/auth/GoogleSignInCard";
import styles from "./css/page.module.css";

export default function AdminPage() {
  const [showGoogle, setShowGoogle] = useState(false);

  const handlePatternSuccess = useCallback(() => {
    setShowGoogle(true);
  }, []);

  /*
   * El reset del patrón (idle tras error o auto-reset) NO debe revertir
   * la transición si la autenticación ya fue exitosa.
   * Usamos la forma funcional de setState para leer el valor actual
   * sin necesidad de añadir showGoogle como dependencia del callback.
   */
  const handlePatternReset = useCallback(() => {
    setShowGoogle((current) => current);
  }, []);

  return (
    <div className={styles.root}>
      {/* ── Fondo atmosférico ── */}
      <div className={`${styles.glow} ${styles.glow1}`} />
      <div className={`${styles.glow} ${styles.glow2}`} />
      <div className={styles.noise} />

      {/* ── Stage ── */}
      <div className={styles.stage}>
        <div className={styles.clip}>

          {/* Spacer: da altura al clip sin participar en la animación */}
          <div className={styles.spacer} aria-hidden="true" />

          {/* Tarjeta 1: patrón — sale hacia la derecha al autenticarse */}
          <div className={`${styles.cardSlot} ${showGoogle ? styles.cardSlotExitRight : ""}`}>
            <PatternCard
              onPatternSuccess={handlePatternSuccess}
              onPatternReset={handlePatternReset}
            />
          </div>

          {/* Tarjeta 2: Google — entra desde la izquierda al autenticarse */}
          <div
            className={`${styles.cardSlot} ${styles.cardSlotGoogle} ${showGoogle ? styles.cardSlotEnter : ""}`}
            aria-hidden={!showGoogle}
          >
            <GoogleSignInCard />
          </div>

        </div>
      </div>

      {/* Footer */}
      <p className={styles.footer}>
        Coragem Accessories &mdash; {new Date().getFullYear()}
      </p>
    </div>
  );
}