/**
 * src/lib/api.ts
 *
 * Cliente HTTP base para consumir la API de Coragem.
 * Centraliza la URL base y el manejo de respuestas.
 */

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!url) throw new Error("NEXT_PUBLIC_API_URL is not defined");
  return url;
}

export interface ApiResponse<T> {
  data:  T | null;
  error: string | null;
  /** Solo presente en respuestas de rate limit (HTTP 429) */
  retryAfter?: number;
}

function parseNetworkError(err: unknown): string {
  if (err instanceof TypeError) {
    if (err.message.toLowerCase().includes("failed to fetch")) {
      return "No se pudo conectar con el servidor";
    }
    return `Error al enviar la solicitud: ${err.message}`;
  }
  if (err instanceof Error) return err.message || "Error desconocido";
  return "No se pudo conectar con el servidor";
}

async function request<T>(
  path:    string,
  options: RequestInit = {},
  withBody = true,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      credentials: "include",
      ...(withBody && { headers: { "Content-Type": "application/json" } }),
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

    if (res.status === 204 || res.headers.get("content-length") === "0") {
      return { data: null, error: null };
    }

    const body = await res.json();

    if (!res.ok) {
      return { data: null, error: body.error ?? "Error desconocido" };
    }

    return { data: body as T, error: null };
  } catch (err) {
    return { data: null, error: parseNetworkError(err) };
  }
}

export const api = {
  get:    <T>(path: string)                => request<T>(path, {}, false),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: <T>(path: string)                => request<T>(path, { method: "DELETE" }, false),
};