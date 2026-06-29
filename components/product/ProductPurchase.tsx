"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { formatCOP } from "@/lib/money";
import type { Product } from "@/types/product";

/**
 * Purchase controls on the product detail page: price, quantity stepper
 * (1..stock), add-to-cart, and stock state.
 *  - Out of stock → "Agotado" message; stepper + button hidden.
 *  - Low stock (≤ 5) → a subtle "¡Últimas unidades!" hint.
 */
/** Soft cap used when stock is unknown (null). */
const SOFT_MAX = 99;

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const hasPrice = product.price !== null;
  const stockKnown = product.stock !== null;
  const outOfStock = stockKnown && (product.stock as number) <= 0;
  const lowStock =
    stockKnown && (product.stock as number) > 0 && (product.stock as number) <= 5;
  // No cap when inventory is unknown; otherwise cap at stock.
  const maxQty = stockKnown ? (product.stock as number) : SOFT_MAX;

  return (
    <div className="space-y-5">
      {hasPrice ? (
        <p className="text-2xl font-medium text-ink">
          {formatCOP(product.price as number)}
        </p>
      ) : (
        <p className="font-meta text-sm text-ink-soft">
          Consultar precio por WhatsApp
        </p>
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
