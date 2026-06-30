"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { OrderReceipt, RECEIPT_WIDTH } from "@/components/order/OrderReceipt";
import { useCart } from "@/context/CartContext";
import { makeOrderRef } from "@/lib/orderRef";
import { buildQuoteMessage } from "@/lib/whatsappMessage";
import { nodeToPngFile, downloadFile } from "@/lib/receiptImage";
import { whatsappLink } from "@/config/site";
import type { CartLine } from "@/context/CartContext";

/** Snapshot of the order being quoted (frozen at click time). */
interface PendingOrder {
  items: CartLine[];
  ref: string;
  date: Date;
}

/** Wait for React to commit + the browser to paint before capturing. */
function nextPaint(): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );
}

/**
 * "Cotizar por WhatsApp" action.
 *
 * On click (cart non-empty): generates a fresh order ref, builds the text
 * message, renders the receipt off-screen and captures it as a 2x PNG, then:
 *  - Mobile / share-capable → navigator.share({ files, text }) (image + text).
 *  - Desktop / no file share → open wa.me with the text AND download the PNG,
 *    with an inline hint to attach it.
 * Any failure (including a cancelled share) falls back to the wa.me + download
 * path, so the user is never left stuck.
 */
export function QuoteButton() {
  const { items } = useCart();
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  const isEmpty = items.length === 0;

  function openWhatsAppWithDownload(message: string, file: File) {
    // Desktop path: wa.me cannot attach images, so open the text chat and
    // download the receipt for manual attachment.
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
    downloadFile(file);
    setHint(
      "Descargamos el recibo como imagen. En WhatsApp Web puedes adjuntarlo junto al mensaje.",
    );
  }

  async function handleQuote() {
    if (isEmpty || loading) return;
    setLoading(true);
    setHint(null);

    // Snapshot the cart + a fresh reference up front.
    const snapshot = items.map((l) => ({ ...l }));
    const ref = makeOrderRef();
    const message = buildQuoteMessage(snapshot, ref);
    const fileName = `pedido-${ref}.png`;

    try {
      // Render the receipt off-screen, then capture it.
      setOrder({ items: snapshot, ref, date: new Date() });
      await nextPaint();

      const node = receiptRef.current;
      if (!node) throw new Error("No se pudo preparar el recibo.");
      const file = await nodeToPngFile(node, fileName);

      // Prefer the native share sheet with the image + text (mobile).
      const canShareFiles =
        typeof navigator !== "undefined" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] });

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [file],
            text: message,
            title: "Pedido Cokonu",
          });
          // Shared successfully — no hint needed.
        } catch {
          // Rejected/cancelled → fall back so the user is never stuck.
          openWhatsAppWithDownload(message, file);
        }
      } else {
        openWhatsAppWithDownload(message, file);
      }
    } catch {
      // PNG generation failed → at least open the text chat.
      window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
      setHint(
        "No pudimos generar la imagen del recibo, pero abrimos WhatsApp con tu pedido.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={handleQuote}
        disabled={isEmpty || loading}
        aria-busy={loading}
      >
        {loading ? "Generando recibo…" : "Cotizar por WhatsApp"}
      </Button>

      {hint ? (
        <p className="mt-2 text-center font-meta text-xs text-green-dark">
          {hint}
        </p>
      ) : (
        <p className="mt-2 text-center font-meta text-xs text-ink-soft">
          Te enviaremos a WhatsApp con el resumen de tu pedido y el recibo.
        </p>
      )}

      {/*
        Off-screen receipt used only for PNG capture. Positioned far off-canvas
        (not display:none) so it has real layout for html-to-image. Closing the
        cart hides the drawer, not this node.
      */}
      <div aria-hidden style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none", opacity: 0, zIndex: -1, width: RECEIPT_WIDTH }}>
        <div ref={receiptRef}>
          {order && (
            <OrderReceipt
              items={order.items}
              orderRef={order.ref}
              date={order.date}
            />
          )}
        </div>
      </div>
    </div>
  );
}
