import type { Product } from "@/types/product";

/**
 * Volume-based (tiered) pricing — SINGLE SOURCE OF TRUTH for the thresholds.
 *
 * Quantity → tier:
 *   1–5   → price3 (single-unit / base)
 *   6–10  → price2
 *   11+   → price1 (best)
 *
 * Change the cutoffs here and the whole UI (cards, product page, cart, the
 * WhatsApp message) follows.
 */
export const TIER2_MIN_QTY = 6; // 6–10 units
export const TIER1_MIN_QTY = 11; // 11+ units

/**
 * Unit price for a given quantity, in COP. Returns null only when the product
 * has no prices at all. If the applicable tier price is missing, falls back to
 * whatever tier price is present (base first).
 */
export function unitPriceForQty(product: Product, qty: number): number | null {
  const chosen =
    qty >= TIER1_MIN_QTY
      ? product.price1
      : qty >= TIER2_MIN_QTY
        ? product.price2
        : product.price3;

  // Fallback to any present price (base/single-unit preferred).
  return chosen ?? product.price3 ?? product.price2 ?? product.price1 ?? null;
}

/** The single-unit (qty 1) price; the default display price. */
export function basePrice(product: Product): number | null {
  return unitPriceForQty(product, 1);
}

/** Whether the product has any tier price at all. */
export function hasPrice(product: Product): boolean {
  return basePrice(product) !== null;
}

/** Line total (unit price × qty) for a quantity, or null if unpriced. */
export function lineTotal(product: Product, qty: number): number | null {
  const unit = unitPriceForQty(product, qty);
  return unit === null ? null : unit * qty;
}

/**
 * Cheaper volume tiers worth advertising on the product page, in ascending
 * quantity. Only tiers strictly cheaper than the running price are included,
 * so we never show a "discount" that isn't one.
 */
export function priceTierHints(
  product: Product,
): { minQty: number; price: number }[] {
  const base = basePrice(product);
  if (base === null) return [];

  const hints: { minQty: number; price: number }[] = [];
  let prev = base;

  if (product.price2 !== null && product.price2 < prev) {
    hints.push({ minQty: TIER2_MIN_QTY, price: product.price2 });
    prev = product.price2;
  }
  if (product.price1 !== null && product.price1 < prev) {
    hints.push({ minQty: TIER1_MIN_QTY, price: product.price1 });
  }
  return hints;
}
