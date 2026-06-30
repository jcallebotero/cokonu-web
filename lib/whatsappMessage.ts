import { formatCOP } from "@/lib/money";
import { unitPriceForQty, hasPrice } from "@/lib/pricing";
import type { CartLine } from "@/context/CartContext";

/**
 * Build the plain-text WhatsApp quote message (es-CO).
 *
 * Each line: "• {name} ({presentation}) — Cantidad: {qty}"
 * (the "(presentation)" part is omitted when presentation is null).
 *
 * Money: each line is priced at its volume tier for the chosen quantity. When
 * every item is priced, per-line unit prices and a Subtotal are appended; if
 * any item is unpriced, no money is shown (quote by WhatsApp).
 *
 * The returned string is plain text; URL-encode it at the call site.
 */
export function buildQuoteMessage(
  items: CartLine[],
  orderRef: string,
): string {
  const allPriced = items.length > 0 && items.every((l) => hasPrice(l.product));

  const lines = items.map(({ product, quantity }) => {
    const presentation = product.presentation
      ? ` (${product.presentation})`
      : "";
    const unit = unitPriceForQty(product, quantity);
    const money =
      allPriced && unit !== null
        ? ` — ${formatCOP(unit)} c/u = ${formatCOP(unit * quantity)}`
        : "";
    return `• ${product.name}${presentation} — Cantidad: ${quantity}${money}`;
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
      (sum, l) => sum + (unitPriceForQty(l.product, l.quantity) as number) * l.quantity,
      0,
    );
    parts.push("", `Subtotal: ${formatCOP(subtotal)}`);
  }

  parts.push("", "Quedo atento(a) a disponibilidad y total. ¡Gracias!");

  return parts.join("\n");
}
