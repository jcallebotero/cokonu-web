"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Cart state — SCAFFOLD ONLY (Phase 1).
 *
 * No add/remove logic yet. The shape and provider exist now so that:
 *   - the header can read the item count (currently 0),
 *   - the cart drawer can read open/close state,
 *   - Phase 2 can add real line items without restructuring.
 */

/** A single line in the cart. Kept minimal; extend in Phase 2. */
export interface CartItem {
  id: string;
  name: string;
  /** Unit price in COP (integer pesos). */
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextValue {
  /** Line items. Empty for now. */
  items: CartItem[];
  /** Total number of units across all line items. */
  itemCount: number;
  /** Subtotal in COP. */
  subtotal: number;
  /** Whether the slide-in cart drawer is open. */
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Cart line items — empty array scaffold; mutators arrive in Phase 2.
  const [items] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((o) => !o), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    };
  }, [items, isOpen, openCart, closeCart, toggleCart]);

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
