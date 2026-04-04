/**
 * src/components/admin/layout/AdminGuard.tsx
 *
 * Client Component que protege las rutas bajo /admin/dashboard/*.
 * Mientras verifica la sesión muestra un loader; si no hay sesión
 * activa redirige a /admin.
 *
 * No proteger /admin (login) — solo el dashboard layout lo usa.
 */

"use client";

import { useEffect }    from "react";
import { useRouter }    from "next/navigation";
import { useAuth }      from "@/hooks/admin/auth/useAuth";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) return <AdminGuardLoader />;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}

/* ── Loader minimalista con los tokens de Slate Command ── */
function AdminGuardLoader() {
  return (
    <div style={{
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      minHeight:       "100dvh",
      backgroundColor: "var(--admin-bg)",
    }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width:           "7px",
              height:          "7px",
              borderRadius:    "50%",
              backgroundColor: "var(--admin-accent)",
              opacity:         0.3,
              animation:       `adminGuardPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes adminGuardPulse {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1);    }
        }
      `}</style>
    </div>
  );
}