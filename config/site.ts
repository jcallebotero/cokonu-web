/**
 * Site-wide constants for Cokonu.
 *
 * Single source of truth for branding strings and integration config.
 * Update values here rather than hard-coding them across components.
 */
export const siteConfig = {
  /** Brand name. */
  name: "Cokonu",
  /** Full store display name — used in the WhatsApp message + receipt footer. */
  storeName: "Cokonu — Confitería y Papelería",
  /** Short tagline shown under the logo and in the footer. */
  tagline: "Confitería y Papelería",
  /** Longer description for metadata / SEO. */
  description:
    "Cokonu — confitería y papelería en Medellín. Dulces, chocolatinas, mecatos y artículos de papelería con envío y cotización por WhatsApp.",
  /** Canonical locale for the customer-facing site. */
  locale: "es-CO",
  /** City / location, used in copy, metadata and the receipt. */
  city: "Medellín, Colombia",
  /** Alias kept for existing call sites. */
  location: "Medellín, Colombia",
  /**
   * Full physical address — single source of truth. Also serves as the
   * judicial-notification address (Ley 1480 de 2011, art. 50 lit. a). Used in
   * the footer identity line and the Términos / Privacidad legal pages.
   */
  address:
    "Central mayorista de Antioquia, Itagüí, bloque 13 local 77 y 78, Medellín, Colombia",
} as const;

/**
 * Cokonu's WhatsApp business number for the quote flow.
 * Format: country code + number, no "+" or spaces. SINGLE SOURCE for the
 * number — every link/message derives it from here.
 */
export const WHATSAPP_NUMBER = "573053624422";

/**
 * Builds a wa.me link, optionally pre-filling a message.
 * Centralized here so the checkout flow (later phase) can reuse it.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type SiteConfig = typeof siteConfig;
