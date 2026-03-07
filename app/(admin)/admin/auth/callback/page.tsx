"use client";

/**
 * app/(admin)/admin/auth/callback/page.tsx
 *
 * Página intermedia del flujo OAuth.
 * Google → backend → aquí (con ?token=...) → POST /api/auth/session → dashboard
 *
 * El backend redirige aquí con el JWT en el query param.
 * Esta página lo intercambia por una cookie HttpOnly via una request
 * CORS normal (no redirect), que el browser acepta correctamente.
 */

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import styles from "./page.module.css";

export default function AuthCallbackPage() {
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