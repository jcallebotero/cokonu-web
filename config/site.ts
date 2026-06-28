/**
 * Site-wide constants for Cokonu.
 *
 * Single source of truth for branding strings and integration config.
 * Update values here rather than hard-coding them across components.
 */
export const siteConfig = {
  /** Brand name. */
  name: "Cokonu",
  /** Short tagline shown under the logo and in the footer. */
  tagline: "Confitería y Papelería",
  /** Longer description for metadata / SEO. */
  description:
    "Cokonu — confitería y papelería en Medellín. Dulces, chocolatinas, mecatos y artículos de papelería con envío y cotización por WhatsApp.",
  /** Canonical locale for the customer-facing site. */
  locale: "es-CO",
  /** City / location, used in copy and metadata. */
  location: "Medellín, Colombia",
} as const;

/**
 * Placeholder WhatsApp number used for the (future) WhatsApp checkout.
 * Format: country code + number, no "+" or spaces.
 * TODO: replace "573000000000" with the real Cokonu business number.
 */
export const WHATSAPP_NUMBER = "573000000000";

/**
 * Builds a wa.me link, optionally pre-filling a message.
 * Centralized here so the checkout flow (later phase) can reuse it.
 */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type SiteConfig = typeof siteConfig;
