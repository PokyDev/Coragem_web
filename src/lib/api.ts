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

/**
 * Petición multipart/form-data.
 *
 * NO se establece el header Content-Type manualmente: el navegador lo
 * genera automáticamente con el boundary correcto al recibir un FormData.
 * Forzar "Content-Type: multipart/form-data" sin boundary rompe el parsing
 * del servidor.
 */
async function multipartRequest<T>(
  path:    string,
  method:  "POST" | "PATCH" | "PUT",
  body:    FormData,
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${getApiBase()}${path}`, {
      method,
      credentials: "include",
      body,
      // Sin headers: el browser pone "Content-Type: multipart/form-data; boundary=..."
    });

    if (res.status === 429) {
      const resBody = await res.json().catch(() => ({}));
      return {
        data:       null,
        error:      resBody.error ?? "Demasiados intentos fallidos",
        retryAfter: resBody.retryAfter,
      };
    }

    const resBody = await res.json();

    if (!res.ok) {
      return { data: null, error: resBody.error ?? "Error desconocido" };
    }

    return { data: resBody as T, error: null };
  } catch {
    return { data: null, error: "No se pudo conectar con el servidor" };
  }
}

export const api = {
  get:        <T>(path: string)                        => request<T>(path),
  post:       <T>(path: string, body: unknown)         => request<T>(path, { method: "POST",  body: JSON.stringify(body) }),
  put:        <T>(path: string, body: unknown)         => request<T>(path, { method: "PUT",   body: JSON.stringify(body) }),
  patch:      <T>(path: string, body: unknown)         => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),

  /** Subida de archivos — omite Content-Type para preservar el multipart boundary */
  multipart:  <T>(path: string, method: "POST" | "PATCH" | "PUT", body: FormData) =>
    multipartRequest<T>(path, method, body),
};