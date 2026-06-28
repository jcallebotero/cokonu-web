"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Slide-in cart drawer (from the right).
 *
 * Phase 1: empty state only — coconut character, an empty message and a
 * disabled "Cotizar por WhatsApp" action. Cart line items render here in a
 * later phase (the structure is already in place via CartContext).
 *
 * Accessibility: dialog role, focus moved to the close button on open,
 * closes on overlay click, the close button, and Escape.
 */
export function CartDrawer() {
  const { isOpen, closeCart, items, itemCount } = useCart();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCart();
    document.addEventListener("keydown", onKey);
    // Move focus into the drawer and lock body scroll.
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
            // Line items will be rendered here in Phase 2.
            <ul className="space-y-4" />
          )}
        </div>

        {/* Footer / checkout */}
        <div className="border-t border-line px-5 py-4">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled
            title="Disponible próximamente"
          >
            Cotizar por WhatsApp
          </Button>
          <p className="mt-2 text-center font-meta text-xs text-ink-soft">
            El pago y la cotización por WhatsApp se habilitarán pronto.
          </p>
        </div>
      </aside>
    </div>
  );
}
