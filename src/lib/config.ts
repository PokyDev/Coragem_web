/**
 * config.ts — Configuración central de variables de entorno.
 *
 * Centraliza el acceso a process.env para que:
 *  1. Los errores por variables faltantes aparezcan al arrancar,
 *     no silenciosamente en tiempo de ejecución.
 *  2. El resto del proyecto importe desde aquí en lugar de leer
 *     process.env directamente (evita typos y facilita refactors).
 */

/* ─── Helper de validación ───────────────────────────────────────── */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[config] Variable de entorno faltante: "${key}"\n` +
      `Asegúrate de que esté definida en .env.local`
    );
  }
  return value;
}

/* ─── Redes sociales ─────────────────────────────────────────────── */
export const INSTAGRAM_URL = requireEnv("NEXT_PUBLIC_INSTAGRAM_URL");

export const WHATSAPP_NUMBER = requireEnv("NEXT_PUBLIC_WHATSAPP_NUMBER");

const WHATSAPP_BASE_URL = requireEnv("NEXT_PUBLIC_WHATSAPP_BASE_URL");

/**
 * Construye la URL de WhatsApp con un mensaje pre-escrito opcional.
 *
 * @param message - Texto que aparecerá pre-escrito en el chat (opcional).
 * @returns URL completa lista para usar en un <a href="...">.
 *
 * @example
 * buildWhatsAppUrl("Hola, me interesa el producto: Anillo de corazón")
 * // → "https://wa.me/573166054031?text=Hola%2C%20me%20interesa..."
 */
export function buildWhatsAppUrl(message?: string): string {
  const base = `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}