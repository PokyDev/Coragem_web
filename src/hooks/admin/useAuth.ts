/**
 * src/hooks/admin/useAuth.ts
 *
 * Verifica si hay una sesión activa consultando GET /api/auth/me.
 * La cookie HttpOnly se envía automáticamente con credentials: "include".
 *
 * Uso:
 *   const { isAuthenticated, isLoading, user } = useAuth();
 */

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface AdminUser {
  id:    string;
  email: string;
}

interface AuthState {
  isLoading:       boolean;
  isAuthenticated: boolean;
  user:            AdminUser | null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    isLoading:       true,
    isAuthenticated: false,
    user:            null,
  });

  useEffect(() => {
    api.get<{ user: AdminUser }>("/api/auth/me").then(({ data }) => {
      setState({
        isLoading:       false,
        isAuthenticated: data !== null,
        user:            data?.user ?? null,
      });
    });
  }, []);

  return state;
}