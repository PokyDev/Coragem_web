"use client";

import { usePatternAuth } from "@/hooks/admin/auth/usePatternAuth";
import { PatternCard }      from "@/components/admin/auth/PatternCard";
import { GoogleSignInCard } from "@/components/admin/auth/GoogleSignInCard";
import styles from "./css/page.module.css";

export default function AdminPage() {
  const { auth, onPatternComplete, onPatternReset, gridResetRef, intentionalResetRef } = usePatternAuth();

  const showGoogle = auth.phase === "authenticated";
  const showLoader = auth.phase === "loading";

  return (
    <div className={styles.root}>
      <div className={`${styles.glow} ${styles.glow1}`} />
      <div className={`${styles.glow} ${styles.glow2}`} />
      <div className={styles.noise} />

      <div className={styles.stage}>
        <div className={styles.clip}>
          <div className={styles.spacer} aria-hidden="true" />

          <div
            className={`${styles.cardSlot} ${showGoogle ? styles.cardSlotExitRight : ""}`}
            aria-hidden={showGoogle}
          >
            {!showLoader && (
              <PatternCard
                phase={auth.phase}
                externalStatusMsg={auth.statusMsg}
                onPatternComplete={onPatternComplete}
                onPatternReset={onPatternReset}
                gridResetRef={gridResetRef}
                intentionalResetRef={intentionalResetRef}
              />
            )}
            {showLoader && (
              <div className={styles.loader} aria-label="Cargando">
                <span className={styles.loaderDot} />
                <span className={styles.loaderDot} />
                <span className={styles.loaderDot} />
              </div>
            )}
          </div>

          <div
            className={`${styles.cardSlot} ${styles.cardSlotGoogle} ${showGoogle ? styles.cardSlotEnter : ""}`}
            aria-hidden={!showGoogle}
          >
            <GoogleSignInCard />
          </div>
        </div>
      </div>

      <p className={styles.footer}>
        Coragem Accessories &mdash; {new Date().getFullYear()}
      </p>
    </div>
  );
}