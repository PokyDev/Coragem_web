"use client";

/**
 * app/(admin)/admin/auth/callback/page.tsx
 */

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import styles from "./page.module.css";

function AuthCallbackInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/admin?error=no_token");
      return;
    }

    api.post("/api/auth/session", { token }).then(({ error }) => {
      if (error) {
        router.replace("/admin?error=session_error");
        return;
      }
      router.replace("/admin/dashboard");
    });
  }, [router, searchParams]);

  return (
    <div className={styles.root}>
      <div className={styles.loader}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.root}>
          <div className={styles.loader}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}