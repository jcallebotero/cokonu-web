"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCOP } from "@/lib/money";
import { unitPriceForQty, priceTierHints } from "@/lib/pricing";
import type { Product } from "@/types/product";

/** Soft cap used when stock is unknown (null). */
const SOFT_MAX = 99;

/**
 * Purchase controls on the product detail page: tier-aware price, quantity
 * stepper (1..stock), add-to-cart, and stock state.
 *  - The unit price and line total re-price live as the quantity crosses a
 *    volume tier (see lib/pricing.ts).
 *  - Out of stock → "Agotado"; stepper + button hidden.
 *  - Low stock (≤ 5) → a subtle "¡Últimas unidades!" hint.
 *  - Unpriced (no tier prices) → "Consultar precio por WhatsApp" (still addable).
 */
export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const stockKnown = product.stock !== null;
  const outOfStock = stockKnown && (product.stock as number) <= 0;
  const lowStock =
    stockKnown && (product.stock as number) > 0 && (product.stock as number) <= 5;
  const maxQty = stockKnown ? (product.stock as number) : SOFT_MAX;

  const unitPrice = unitPriceForQty(product, qty);
  const hints = priceTierHints(product);

  return (
    <div className="space-y-5">
      {unitPrice !== null ? (
        <div>
          <p className="text-2xl font-medium text-ink">
            {formatCOP(unitPrice)}{" "}
            <span className="font-meta text-sm text-ink-soft">c/u</span>
          </p>
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

      {/* Volume pricing hints */}
      {hints.length > 0 && (
        <div className="rounded-lg bg-green-tint/50 px-3 py-2">
          <p className="font-meta text-xs text-ink-soft">Precio por cantidad</p>
          <ul className="mt-1 space-y-0.5">
            {hints.map((h) => (
              <li key={h.minQty} className="text-xs text-green-dark">
                {h.minQty}+ unidades: {formatCOP(h.price)} c/u
              </li>
            ))}
          </ul>
        </div>
      )}

      {outOfStock ? (
        <p className="inline-flex rounded-full bg-line px-3 py-1 text-sm font-medium text-ink-soft">
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
              variant="primary"
              size="lg"
              onClick={() => addItem(product, qty)}
            >
              Agregar al carrito
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
