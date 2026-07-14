"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductImage } from "@/components/product/ProductImage";
import { formatCOP } from "@/lib/money";
import {
  basePrice,
  unitPriceForQty,
  hasVolumeDiscount,
  priceTiers,
  tierIndexForQty,
  savingsPerUnit,
  unitsToNextTier,
} from "@/lib/pricing";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/lib/productVariants";

/** Soft cap used when stock is unknown (null). */
const SOFT_MAX = 99;
/** Only nudge to the next tier when it's within this many units. */
const NUDGE_WITHIN = 3;

/**
 * Purchase controls on the product detail page: tier-aware price, a volume
 * price table, quantity stepper (1..stock) and add-to-cart.
 *  - Unit price + line total re-price live as the quantity crosses a tier.
 *  - When a discount is active, the qty-1 price is struck through and the
 *    per-unit savings is shown; a "precio por cantidad" table highlights the
 *    active tier; a gentle nudge appears when the next tier is close.
 *  - Out of stock → "Agotado". Unpriced → "Consultar precio por WhatsApp".
 *
 * Flavor thumbnails (when the product has >1 photo variant) render BETWEEN the
 * tier table and the Agregar button; clicking one swaps the large image on the
 * left (state lifted to <ProductStage> via `selected`/`onSelect`) and the chosen
 * flavor is carried into the cart line on add.
 */
export function ProductPurchase({
  product,
  variants,
  selected,
  onSelect,
}: {
  product: Product;
  variants: ProductVariant[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  // The currently selected variant → the flavor carried into the cart. Main
  // photo has a null label, so no-flavor adds pass flavor null / no flavorSrc.
  const activeVariant = variants[selected] ?? null;
  const flavorLabel = activeVariant?.label ?? null;
  const flavorSrc = flavorLabel !== null ? (activeVariant?.src ?? null) : null;
  const showThumbs = variants.length > 1;

  const stockKnown = product.stock !== null;
  const outOfStock = stockKnown && (product.stock as number) <= 0;
  const lowStock =
    stockKnown && (product.stock as number) > 0 && (product.stock as number) <= 5;
  const maxQty = stockKnown ? (product.stock as number) : SOFT_MAX;

  const base = basePrice(product);
  const unitPrice = unitPriceForQty(product, qty);
  const showTiers = hasVolumeDiscount(product);
  const tiers = priceTiers(product);
  const activeTier = tierIndexForQty(qty);
  const savings = savingsPerUnit(product, qty); // > 0 when a tier discount is active
  const nudge = unitsToNextTier(product, qty);

  return (
    <div className="space-y-5">
      {unitPrice !== null ? (
        <div>
          <p className="flex items-baseline gap-2">
            <span className="text-2xl font-medium text-ink">
              {formatCOP(unitPrice)}
            </span>
            {savings > 0 && base !== null && (
              <span className="text-sm text-ink-soft line-through">
                {formatCOP(base)}
              </span>
            )}
            <span className="font-meta text-sm text-ink-soft">c/u</span>
          </p>

          {savings > 0 && (
            <p className="mt-1 text-sm font-medium text-green-dark">
              ¡Ahorras {formatCOP(savings)} por unidad!
            </p>
          )}

          {qty > 1 && (
            <p className="mt-1 text-sm text-ink-soft">
              Total: {formatCOP(unitPrice * qty)} · {qty} unidades
            </p>
          )}
        </div>
      ) : (
        <p className="font-meta text-sm text-ink-soft">
          Consultar precio por WhatsApp
        </p>
      )}

      {/* Volume price table — only when there's a real discount to show. */}
      {showTiers && (
        <div className="rounded-lg bg-green-tint/40 px-3 py-2.5">
          <p className="font-meta text-xs text-ink-soft">Precio por cantidad</p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
            {tiers.map((tier) => (
              <span
                key={tier.index}
                className={cn(
                  "rounded px-1.5 text-sm",
                  tier.index === activeTier
                    ? "bg-green-dark font-medium text-surface"
                    : "text-ink",
                )}
              >
                {tier.rangeLabel} u:{" "}
                {tier.price !== null ? formatCOP(tier.price) : "—"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Gentle nudge toward the next cheaper tier, only when close. */}
      {!outOfStock && nudge && nudge.add <= NUDGE_WITHIN && (
        <p className="font-meta text-sm text-green-dark">
          Agrega {nudge.add} más y baja a {formatCOP(nudge.price)} c/u.
        </p>
      )}

      {/* Flavor thumbnails — sit between the tier table and the Agregar button.
          Clicking swaps the large image (left); the active one keeps the green
          border; the flavor name shows only on hover/select. Square, wraps. */}
      {showThumbs && (
        <ul className="flex flex-wrap gap-3">
          {variants.map((variant, i) => (
            <li key={variant.src}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-label={variant.label ?? "Foto principal"}
                aria-pressed={i === selected}
                className={cn(
                  "group relative block aspect-square w-16 overflow-hidden bg-surface ring-1 transition-[box-shadow] sm:w-20",
                  i === selected
                    ? "ring-2 ring-green-dark"
                    : "ring-line/60 hover:ring-green",
                )}
              >
                <ProductImage
                  src={variant.src}
                  alt={variant.label ?? product.name}
                  sizes="80px"
                />
                {/* Label revealed on hover only (never permanent). Main = none. */}
                {variant.label && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-green-deep/85 px-1 py-0.5 text-center text-[10px] font-medium leading-tight text-surface opacity-0 transition-opacity group-hover:opacity-100">
                    {variant.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {outOfStock ? (
        <p className="inline-flex bg-bg-soft px-3 py-1 text-sm font-medium text-green-dark ring-1 ring-green-dark/20">
          Agotado
        </p>
      ) : (
        <>
          {lowStock && (
            <p className="font-meta text-sm text-pink-dark">
              ¡Últimas unidades!
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={qty}
              min={1}
              max={maxQty}
              onChange={setQty}
            />
            <Button
              variant="add"
              size="lg"
              onClick={() => addItem(product, qty, flavorLabel, flavorSrc)}
            >
              Agregar al carrito
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
