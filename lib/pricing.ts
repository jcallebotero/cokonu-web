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

/* ==========================================================================
   Presentation helpers (derived from the same thresholds — no duplication).
   Used by the card / product page / cart to communicate volume savings.
   ========================================================================== */

/** Whether the product has at least one tier strictly cheaper than qty-1. */
export function hasVolumeDiscount(product: Product): boolean {
  return priceTierHints(product).length > 0;
}

/** Which tier index (0,1,2) a quantity falls into. */
export function tierIndexForQty(qty: number): 0 | 1 | 2 {
  return qty >= TIER1_MIN_QTY ? 2 : qty >= TIER2_MIN_QTY ? 1 : 0;
}

export interface PriceTier {
  index: 0 | 1 | 2;
  /** First quantity in this tier (1, 6, 11). */
  minQty: number;
  /** Last quantity in this tier, or null for the open-ended top tier. */
  maxQty: number | null;
  /** Human range label, e.g. "1–5", "6–10", "11+". */
  rangeLabel: string;
  /** Resolved unit price for this tier (null only if the product is unpriced). */
  price: number | null;
}

/** The three pricing tiers with resolved prices and range labels. */
export function priceTiers(product: Product): PriceTier[] {
  const bounds: { index: 0 | 1 | 2; minQty: number; maxQty: number | null }[] = [
    { index: 0, minQty: 1, maxQty: TIER2_MIN_QTY - 1 },
    { index: 1, minQty: TIER2_MIN_QTY, maxQty: TIER1_MIN_QTY - 1 },
    { index: 2, minQty: TIER1_MIN_QTY, maxQty: null },
  ];
  return bounds.map((b) => ({
    ...b,
    rangeLabel: b.maxQty === null ? `${b.minQty}+` : `${b.minQty}–${b.maxQty}`,
    price: unitPriceForQty(product, b.minQty),
  }));
}

/** Per-unit savings vs the qty-1 price at a given quantity (0 if none). */
export function savingsPerUnit(product: Product, qty: number): number {
  const base = basePrice(product);
  const unit = unitPriceForQty(product, qty);
  if (base === null || unit === null) return 0;
  return Math.max(0, base - unit);
}

/**
 * If buying a few more units would cross into a cheaper tier, returns how many
 * to add and the resulting unit price — for a gentle "add N more" nudge. Null
 * when already at the best tier or the next tier isn't actually cheaper.
 */
export function unitsToNextTier(
  product: Product,
  qty: number,
): { add: number; price: number } | null {
  const nextThreshold =
    qty < TIER2_MIN_QTY ? TIER2_MIN_QTY : qty < TIER1_MIN_QTY ? TIER1_MIN_QTY : null;
  if (nextThreshold === null) return null;

  const currentUnit = unitPriceForQty(product, qty);
  const nextUnit = unitPriceForQty(product, nextThreshold);
  if (currentUnit === null || nextUnit === null || nextUnit >= currentUnit) {
    return null;
  }
  return { add: nextThreshold - qty, price: nextUnit };
}
