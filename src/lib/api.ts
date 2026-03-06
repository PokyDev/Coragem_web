/**
 * src/lib/api.ts
 *
 * Cliente HTTP base para consumir la API de Coragem.
 * Centraliza la URL base y el manejo de respuestas para no repetir
 * lógica de fetch en cada hook o componente.
 */

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  return url;
}

export interface ApiResponse<T> {
  data:  T    | null;
  error: string | null;
  /** Solo presente en respuestas de rate limit (HTTP 429) */
  retryAfter?: number;
}

async function request<T>(
  path:    string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      headers:     { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
    });

    if (res.status === 429) {
      const body = await res.json().catch(() => ({}));
      return {
        data:       null,
        error:      body.error ?? "Demasiados intentos fallidos",
        retryAfter: body.retryAfter,
      };
    }

    const body = await res.json();

    if (!res.ok) {
      return { data: null, error: body.error ?? "Error desconocido" };
    }

    return { data: body as T, error: null };
  } catch {
    return { data: null, error: "No se pudo conectar con el servidor" };
  }
}

export const api = {
  get:   <T>(path: string)                        => request<T>(path),
  post:  <T>(path: string, body: unknown)         => request<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  put:   <T>(path: string, body: unknown)         => request<T>(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown)         => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
};