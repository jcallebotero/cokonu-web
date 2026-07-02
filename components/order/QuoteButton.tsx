"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { makeOrderRef } from "@/lib/orderRef";
import { buildQuoteMessage } from "@/lib/whatsappMessage";
import { whatsappLink } from "@/config/site";

/**
 * "Cotizar por WhatsApp" action — INSTANT, synchronous.
 *
 * On click (cart non-empty): generate a fresh order ref, build the Spanish
 * text message, and open wa.me in a new tab/window. No image generation, no
 * sharing, no download — so the button fires with no perceptible delay on both
 * mobile (WhatsApp app) and desktop (WhatsApp Web).
 *
 * The branded receipt (components/order/OrderReceipt.tsx) is kept in the repo
 * but dormant — reserved for a future confirmation step.
 */
export function QuoteButton() {
  const { items } = useCart();
  const isEmpty = items.length === 0;

  function handleQuote() {
    if (isEmpty) return;
    const ref = makeOrderRef();
    const message = buildQuoteMessage(items, ref);
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <Button
        variant="add"
        size="lg"
        className="w-full"
        onClick={handleQuote}
        disabled={isEmpty}
      >
        Cotizar por WhatsApp
      </Button>
      <p className="mt-2 text-center font-meta text-xs text-ink-soft">
        Te llevaremos a WhatsApp con el resumen de tu pedido.
      </p>
    </div>
  );
}
