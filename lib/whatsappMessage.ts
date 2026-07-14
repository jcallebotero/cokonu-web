import { formatCOP } from "@/lib/money";
import { unitPriceForQty, hasPrice } from "@/lib/pricing";
import { aggregateQtyBySlug, type CartLine } from "@/context/CartContext";

/**
 * Build the plain-text WhatsApp quote message (es-CO).
 *
 * Each line: "• {name} ({presentation}) ({flavor}) — Cantidad: {qty}"
 * (the "(presentation)" / "(flavor)" parts are omitted when null).
 *
 * Money: each line's UNIT price is the volume tier for the CODE's aggregate
 * quantity (summed across flavor lines), then × the line's own quantity — so
 * different flavors of one code share one tier. When every item is priced,
 * per-line unit prices and a Subtotal are appended; if any item is unpriced, no
 * money is shown (quote by WhatsApp).
 *
 * The returned string is plain text; URL-encode it at the call site.
 */
export function buildQuoteMessage(
  items: CartLine[],
  orderRef: string,
): string {
  const allPriced = items.length > 0 && items.every((l) => hasPrice(l.product));
  const codeTotals = aggregateQtyBySlug(items);

  const lines = items.map(({ product, quantity, flavor }) => {
    const presentation = product.presentation
      ? ` (${product.presentation})`
      : "";
    const flavorSuffix = flavor ? ` (${flavor})` : "";
    // Tier from the code aggregate; line total uses this line's own quantity.
    const unit = unitPriceForQty(product, codeTotals.get(product.slug) ?? quantity);
    const money =
      allPriced && unit !== null
        ? ` — ${formatCOP(unit)} c/u = ${formatCOP(unit * quantity)}`
        : "";
    return `• ${product.name}${presentation}${flavorSuffix} — Cantidad: ${quantity}${money}`;
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
      (sum, l) =>
        sum +
        (unitPriceForQty(
          l.product,
          codeTotals.get(l.product.slug) ?? l.quantity,
        ) as number) *
          l.quantity,
      0,
    );
    parts.push("", `Subtotal: ${formatCOP(subtotal)}`);
  }

  parts.push("", "Quedo atento(a) a disponibilidad y total. ¡Gracias!");

  return parts.join("\n");
}
