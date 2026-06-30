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
