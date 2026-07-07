import Image from "next/image";
import { whatsappLink } from "@/config/site";
import { cn } from "@/lib/cn";

/**
 * Floating WhatsApp button, fixed to the bottom-left on every page.
 *
 * Small, round (an intentional exception to the global square-corners rule via
 * `.is-round`), with a soft drop shadow and a subtle hover lift. Sits above page
 * content (z-30) but BELOW the header (z-40) and the cart drawer / its overlay
 * (z-50), so it never blocks the drawer or the mega-menu.
 *
 * `hidden` fades it out (e.g. once the reveal footer is uncovered) so it never
 * awkwardly overlaps the footer content.
 */
export function WhatsAppFab({ hidden = false }: { hidden?: boolean }) {
  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={cn(
        "is-round fixed bottom-5 left-5 z-30 block h-12 w-12 overflow-hidden shadow-[0_6px_20px_-4px_rgba(0,0,0,0.35)] transition-all duration-200 hover:scale-105 sm:bottom-6 sm:left-6 sm:h-14 sm:w-14",
        hidden ? "pointer-events-none opacity-0" : "opacity-100",
      )}
    >
      <Image
        src="/brand/whatsapp_cokonu.png"
        alt=""
        width={56}
        height={56}
        className="h-full w-full object-contain"
      />
    </a>
  );
}
