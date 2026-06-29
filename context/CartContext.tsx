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

/**
 * Cart state for Cokonu.
 *
 * - Line items are { product, quantity }.
 * - Quantity is always clamped to the product's stock; adding an
 *   out-of-stock product is a no-op.
 * - The cart is persisted to localStorage so it survives a refresh, and
 *   hydrated safely (guarded against SSR / missing window).
 */

/** A single cart line. */
export interface CartLine {
  product: Product;
  quantity: number;
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
  /** Add `qty` units of a product (clamped to stock). No-op if out of stock. */
  addItem: (product: Product, qty?: number) => void;
  /** Remove a line entirely by product code. */
  removeItem: (code: string) => void;
  /** Set the quantity of a line (clamped to stock; 0 removes it). */
  updateQuantity: (code: string, qty: number) => void;
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
          // Keep only well-formed lines with a positive quantity.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setItems(
            parsed.filter(
              (l) => l?.product?.code && typeof l.quantity === "number" && l.quantity > 0,
            ),
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
    (product: Product, qty = 1) => {
      if (qty <= 0) return;
      // Out of stock → no-op. Null stock = unknown inventory → allowed.
      if (product.stock !== null && product.stock <= 0) return;
      // No quantity cap when stock is unknown (null).
      const cap = product.stock === null ? Infinity : product.stock;
      setItems((prev) => {
        const existing = prev.find((l) => l.product.code === product.code);
        if (existing) {
          const nextQty = Math.min(existing.quantity + qty, cap);
          return prev.map((l) =>
            l.product.code === product.code ? { ...l, quantity: nextQty } : l,
          );
        }
        return [...prev, { product, quantity: Math.min(qty, cap) }];
      });
      setIsOpen(true); // open the drawer as feedback
    },
    [],
  );

  const removeItem = useCallback((code: string) => {
    setItems((prev) => prev.filter((l) => l.product.code !== code));
  }, []);

  const updateQuantity = useCallback((code: string, qty: number) => {
    setItems((prev) =>
      prev.flatMap((l) => {
        if (l.product.code !== code) return [l];
        const cap = l.product.stock === null ? Infinity : l.product.stock;
        const clamped = Math.max(0, Math.min(qty, cap));
        return clamped === 0 ? [] : [{ ...l, quantity: clamped }];
      }),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, l) => sum + l.quantity, 0);
    // Subtotal is computable only if every item has a price; otherwise null.
    const anyUnpriced = items.some((l) => l.product.price === null);
    const subtotal = anyUnpriced
      ? null
      : items.reduce((sum, l) => sum + (l.product.price as number) * l.quantity, 0);
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
