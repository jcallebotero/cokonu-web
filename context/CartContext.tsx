"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/types/product";
import { unitPriceForQty, hasPrice } from "@/lib/pricing";

/**
 * Cart state for Cokonu.
 *
 * - Line items are { product, quantity, flavor, flavorSrc }.
 * - A line's identity is (department, code, flavor) — the product's slug already
 *   encodes (department + code), so the line key is (slug, flavor). Different
 *   flavors of the same code are SEPARATE lines; the same flavor added again
 *   merges (sums quantity). A no-flavor add (flavor null) is its own line.
 * - PRICING is per CODE, not per line: price tiers (1–5 / 6–10 / 11+) are looked
 *   up on the SUMMED quantity of all flavor lines sharing a (department, code)
 *   via `aggregateQtyBySlug` — the flavor never fragments the tier quantity.
 * - Quantity is clamped to the product's stock; adding an out-of-stock product
 *   is a no-op.
 * - The cart is persisted to localStorage so it survives a refresh, and
 *   hydrated safely (guarded against SSR / missing window).
 */

/** A single cart line. */
export interface CartLine {
  product: Product;
  quantity: number;
  /** Selected flavor label (from the photo variant), or null for the main/no-flavor line. */
  flavor: string | null;
  /** The flavor variant's resolved image src for the thumbnail; null → use product.imageSrc. */
  flavorSrc: string | null;
}

/**
 * Sum quantity per CODE (keyed by slug = department+code) across ALL flavor
 * lines of that code. This is the quantity the volume-price tier is looked up
 * on, so 2 Vainilla + 3 Limon + 2 Chocolate of one code = 7 units → every one of
 * those lines is priced at the 7-unit tier. Flavor is a label dimension only and
 * never fragments the tier quantity.
 */
export function aggregateQtyBySlug(items: CartLine[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const line of items) {
    totals.set(line.product.slug, (totals.get(line.product.slug) ?? 0) + line.quantity);
  }
  return totals;
}

interface CartContextValue {
  /** Line items. */
  items: CartLine[];
  /** Total number of units across all line items. */
  itemCount: number;
  /**
   * Subtotal in COP, or null when it cannot be computed because at least one
   * item has no price yet (price === null).
   */
  subtotal: number | null;
  /** Whether the slide-in cart drawer is open. */
  isOpen: boolean;
  /**
   * Add `qty` units of a product (clamped to stock). No-op if out of stock.
   * `flavor` (+ its image `flavorSrc`) selects/merges the line; omit for the
   * main/no-flavor line.
   */
  addItem: (
    product: Product,
    qty?: number,
    flavor?: string | null,
    flavorSrc?: string | null,
  ) => void;
  /** Remove a line by its (slug, flavor) identity. */
  removeItem: (slug: string, flavor: string | null) => void;
  /** Set a line's quantity by its (slug, flavor) identity (clamped; 0 removes). */
  updateQuantity: (slug: string, flavor: string | null, qty: number) => void;
  /** Empty the cart. */
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** localStorage key — versioned so the shape can evolve safely. */
const STORAGE_KEY = "cokonu.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  // Tracks whether we've read localStorage yet, so the first persist effect
  // doesn't overwrite stored data with the initial empty array.
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage once on mount (client only). This must run in an
  // effect, not a lazy initializer: the server can't read localStorage, so
  // initializing from it would cause an SSR/client hydration mismatch. The
  // one-time setState here is the intended "sync with an external system" use,
  // so the cascading-render lint rule is disabled for these two calls.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          // Keep only well-formed lines with a positive quantity, and MIGRATE
          // pre-flavor carts: old lines have no `flavor`/`flavorSrc` → null.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(
            parsed
              .filter(
                (l) => l?.product?.slug && typeof l.quantity === "number" && l.quantity > 0,
              )
              .map((l) => ({
                product: l.product,
                quantity: l.quantity,
                flavor: l.flavor ?? null,
                flavorSrc: l.flavorSrc ?? null,
              })),
          );
        }
      }
    } catch {
      // Corrupt/unavailable storage → start with an empty cart.
    }
    setHydrated(true);
  }, []);

  // Persist whenever items change (after the initial hydration read).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage write failures (e.g. private mode quota).
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((o) => !o), []);

  const addItem = useCallback(
    (
      product: Product,
      qty = 1,
      flavor: string | null = null,
      flavorSrc: string | null = null,
    ) => {
      if (qty <= 0) return;
      // Out of stock → no-op. Null stock = unknown inventory → allowed.
      if (product.stock !== null && product.stock <= 0) return;
      // No quantity cap when stock is unknown (null).
      const cap = product.stock === null ? Infinity : product.stock;
      setItems((prev) => {
        // Identity is (slug, flavor): same code + same flavor merges; a
        // different flavor of the same code is a distinct line.
        const existing = prev.find(
          (l) => l.product.slug === product.slug && l.flavor === flavor,
        );
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, cap);
          return prev.map((l) =>
            l.product.slug === product.slug && l.flavor === flavor
              ? { ...l, quantity: nextQty }
              : l,
          );
        }
        return [
          ...prev,
          { product, quantity: Math.min(qty, cap), flavor, flavorSrc },
        ];
      });
      setIsOpen(true); // open the drawer as feedback
    },
    [],
  );

  const removeItem = useCallback((slug: string, flavor: string | null) => {
    setItems((prev) =>
      prev.filter((l) => !(l.product.slug === slug && l.flavor === flavor)),
    );
  }, []);

  const updateQuantity = useCallback(
    (slug: string, flavor: string | null, qty: number) => {
      setItems((prev) =>
        prev.flatMap((l) => {
          if (!(l.product.slug === slug && l.flavor === flavor)) return [l];
          const cap = l.product.stock === null ? Infinity : l.product.stock;
          const clamped = Math.max(0, Math.min(qty, cap));
          return clamped === 0 ? [] : [{ ...l, quantity: clamped }];
        }),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, l) => sum + l.quantity, 0);
    // Subtotal is computable only if every item is priced; otherwise null.
    // Each line's UNIT price is the tier for the CODE's aggregate quantity
    // (summed across flavors), then multiplied by the line's own quantity.
    const codeTotals = aggregateQtyBySlug(items);
    const anyUnpriced = items.some((l) => !hasPrice(l.product));
    const subtotal = anyUnpriced
      ? null
      : items.reduce(
          (sum, l) =>
            sum +
            (unitPriceForQty(
              l.product,
              codeTotals.get(l.product.slug) ?? l.quantity,
            ) as number) *
              l.quantity,
          0,
        );
    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    };
  }, [
    items,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access cart state. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return ctx;
}
