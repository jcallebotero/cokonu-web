import { formatCOP } from "@/lib/money";
import type { CartLine } from "@/context/CartContext";

/**
 * Build the plain-text WhatsApp quote message (es-CO).
 *
 * Each line: "• {name} ({presentation}) — Cantidad: {qty}"
 * (the "(presentation)" part is omitted when presentation is null).
 *
 * Money: while a product's price is null, no money is shown for it. When every
 * item has a price, per-line unit prices and a Subtotal line are appended — so
 * the same function is already correct for when prices arrive later.
 *
 * The returned string is plain text; URL-encode it at the call site.
 */
export function buildQuoteMessage(
  items: CartLine[],
  orderRef: string,
): string {
  const allPriced =
    items.length > 0 && items.every((l) => l.product.price !== null);

  const lines = items.map(({ product, quantity }) => {
    const presentation = product.presentation
      ? ` (${product.presentation})`
      : "";
    const unit =
      allPriced && product.price !== null
        ? ` — ${formatCOP(product.price)} c/u`
        : "";
    return `• ${product.name}${presentation} — Cantidad: ${quantity}${unit}`;
  });

  const parts = [
    "¡Hola Cokonu! Quiero completar este pedido:",
    "",
    `Pedido: ${orderRef}`,
    "",
    ...lines,
  ];

  if (allPriced) {
    const subtotal = items.reduce(
      (sum, l) => sum + (l.product.price as number) * l.quantity,
      0,
    );
    parts.push("", `Subtotal: ${formatCOP(subtotal)}`);
  }

  parts.push("", "Quedo atento(a) a disponibilidad y total. ¡Gracias!");

  return parts.join("\n");
}
