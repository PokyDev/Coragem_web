/**
 * src/hooks/admin/useAdminLogout.ts
 *
 * Llama a POST /api/auth/logout para borrar la cookie HttpOnly
 * del backend y redirige al usuario a /admin.
 *
 * Uso en AdminSidebar:
 *   const logout = useAdminLogout();
 *   <button onClick={logout}>Cerrar sesión</button>
 */

"use client";

import { useRouter } from "next/navigation";
import { api }       from "@/lib/api";

export function useAdminLogout(): () => Promise<void> {
  const router = useRouter();

  return async () => {
    await api.post("/api/auth/logout", {});
    router.replace("/admin");
  };
}