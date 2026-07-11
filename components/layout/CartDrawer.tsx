"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ProductImage } from "@/components/product/ProductImage";
import { QuoteButton } from "@/components/order/QuoteButton";
import { CloseIcon } from "@/components/ui/icons";
import { formatCOP } from "@/lib/money";
import { unitPriceForQty, activeAndStruckUnit } from "@/lib/pricing";
import { cn } from "@/lib/cn";

/**
 * Slide-in cart drawer (from the right).
 *
 * Shows line items (thumbnail, name, presentation, quantity stepper, line
 * total, remove) and the subtotal. The "Cotizar por WhatsApp" button is kept
 * visible but disabled — WhatsApp message generation arrives in the next phase.
 *
 * Accessibility: dialog role, focus moved to the close button on open,
 * closes on overlay click, the close button, and Escape.
 */
export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    closeButtonRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, closeCart]);

  const isEmpty = items.length === 0;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isOpen}
    >
      {/* Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-ink/40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0",
        )}
        onClick={closeCart}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={cn(
          "absolute right-0 top-0 flex h-full w-[90%] max-w-md flex-col bg-surface shadow-xl transition-transform duration-250 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id="cart-drawer-title" className="font-display text-lg">
            Tu carrito{itemCount > 0 ? ` (${itemCount})` : ""}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="rounded-md p-1.5 text-ink hover:bg-green-tint"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <Image
                src="/brand/logo_coko.png"
                alt="Personaje de Cokonu con el carrito vacío"
                width={96}
                height={96}
                className="h-24 w-24 object-contain opacity-90"
              />
              <p className="text-base text-ink">Tu carrito está vacío</p>
              <p className="font-meta text-sm text-ink-soft">
                Agrega productos para cotizarlos por WhatsApp.
              </p>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map(({ product, quantity }) => (
                <li key={product.slug} className="flex gap-3">
                  {/* Thumbnail (links to product page) */}
                  <Link
                    href={`/producto/${product.slug}`}
                    onClick={closeCart}
                    className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-line/60"
                  >
                    <ProductImage
                      src={product.imageSrc}
                      alt={product.name}
                      sizes="80px"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/producto/${product.slug}`}
                        onClick={closeCart}
                        className="text-sm text-ink transition-colors hover:text-green-dark"
                      >
                        {product.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(product.slug)}
                        aria-label={`Quitar ${product.name} del carrito`}
                        className="shrink-0 rounded p-1 text-ink-soft transition-colors hover:text-pink-dark"
                      >
                        <CloseIcon width={16} height={16} />
                      </button>
                    </div>

                    {product.presentation && (
                      <p className="font-meta text-xs text-ink-soft">
                        {product.presentation}
                      </p>
                    )}

                    {/* Unit-price row — ALWAYS rendered at a fixed height so
                        the line never resizes as the quantity/tier changes.
                        Progressive strikethrough: base → tier2 → tier3. */}
                    {(() => {
                      const { active, struck } = activeAndStruckUnit(
                        product,
                        quantity,
                      );
                      if (active === null) return null; // unpriced product
                      return (
                        <p className="mt-0.5 flex h-5 items-center gap-1.5 font-meta text-xs">
                          {struck !== null && (
                            <span className="text-ink-soft line-through">
                              {formatCOP(struck)}
                            </span>
                          )}
                          {/* Active price turns green when discounted so the
                              volume saving stands out; normal color at base. */}
                          <span
                            className={cn(
                              "font-medium",
                              struck !== null ? "text-green-deep" : "text-ink",
                            )}
                          >
                            {formatCOP(active)} c/u
                          </span>
                          {struck !== null && (
                            <span className="bg-green-tint px-1.5 py-0.5 text-[10px] leading-none text-green-dark">
                              por mayor
                            </span>
                          )}
                        </p>
                      );
                    })()}

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <QuantityStepper
                        value={quantity}
                        min={1}
                        max={product.stock === null ? 99 : product.stock}
                        size="sm"
                        onChange={(next) =>
                          updateQuantity(product.slug, next)
                        }
                        label={`Cantidad de ${product.name}`}
                      />
                      {(() => {
                        const unit = unitPriceForQty(product, quantity);
                        return unit === null ? null : (
                          <span className="text-sm font-medium text-ink">
                            {formatCOP(unit * quantity)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer / checkout */}
        {!isEmpty && (
          <div className="border-t border-line px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-ink-soft">Subtotal</span>
              {subtotal !== null ? (
                <span className="text-lg font-medium text-ink">
                  {formatCOP(subtotal)}
                </span>
              ) : (
                <span className="font-meta text-sm text-ink-soft">
                  Por confirmar
                </span>
              )}
            </div>

            <QuoteButton />

            <button
              type="button"
              onClick={clearCart}
              className="mt-3 block w-full text-center text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-pink-dark hover:decoration-pink-dark"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
