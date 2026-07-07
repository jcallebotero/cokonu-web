import type { ReactNode } from "react";
import { PageHeading } from "@/components/layout/PageHeading";
import { whatsappLink } from "@/config/site";

/** Cokonu contact email (single source for the legal pages). */
export const COKONU_EMAIL = "confiteriacokonu@gmail.com";
/** Cokonu WhatsApp number, human-readable. */
export const COKONU_PHONE = "+57 305 362 4422";

const linkClass =
  "font-medium text-ink underline decoration-line underline-offset-2 transition-colors hover:text-green-dark hover:decoration-green-dark";

/** Email link (mailto). */
export function MailLink() {
  return (
    <a href={`mailto:${COKONU_EMAIL}`} className={linkClass}>
      {COKONU_EMAIL}
    </a>
  );
}

/** WhatsApp link (opens the chat in a new tab). */
export function WaLink() {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      {COKONU_PHONE}
    </a>
  );
}

/**
 * Shared layout for the legal / help pages (Términos, Privacidad, Devoluciones,
 * Contacto): standard page heading (same as the category pages) plus clean,
 * readable prose — headings, paragraphs and lists, not cards.
 */
export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8">
      <PageHeading
        title={title}
        subtitle={lastUpdated ? `Última actualización: ${lastUpdated}` : undefined}
      />
      <div className="max-w-3xl space-y-8 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </div>
  );
}

/** A titled section within a legal page. */
export function LegalSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      {title && (
        <h2 className="font-display text-base text-ink sm:text-lg">{title}</h2>
      )}
      {children}
    </section>
  );
}
