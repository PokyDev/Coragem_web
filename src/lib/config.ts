/* ─── Variables públicas (cliente + servidor) ────────────────────── */
export const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";

export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

const WHATSAPP_BASE_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_BASE_URL ?? "https://wa.me";

/**
 * Construye la URL de WhatsApp con un mensaje pre-escrito opcional.
 */
export function buildWhatsAppUrl(message?: string): string {
  const base = `${WHATSAPP_BASE_URL}/${WHATSAPP_NUMBER}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}