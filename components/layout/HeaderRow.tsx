"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { SearchIcon, CartIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Shared header ROW: hamburger (mobile) + logo, department nav (HeaderNav — the
 * single source of nav/mega-menu logic), and the search + cart controls.
 *
 * Presentational only: the parent owns the mobile-menu / search state and
 * renders <SearchPanel> and <MobileMenu> at the right stacking level. Two
 * variants:
 *  - "solid"   → the normal white sticky header (dark logo with mascot; search
 *                lives in the center nav; plain search/cart controls).
 *  - "overlay" → transparent row on the green/pink hero panel (home top). Swaps
 *                to the standalone COKONU wordmark and restyles the right-side
 *                controls as voldog chips: a Buscar pill + a cart circle, both
 *                in the current mode tint (green ⇄ pink). Search moves out of the
 *                nav into this cluster.
 */
export function HeaderRow({
  variant = "solid",
  onOpenMobile,
  onOpenSearch,
}: {
  variant?: "solid" | "overlay";
  onOpenMobile: () => void;
  onOpenSearch: () => void;
}) {
  const { itemCount, openCart } = useCart();
  const { mode } = useHeroMode();
  const overlay = variant === "overlay";
  // Mode-aware chip colors (only used in the overlay variant).
  const chipTint = mode === "cookie" ? "bg-green-tint" : "bg-pink-tint";
  const chipInk = mode === "cookie" ? "text-green-deep" : "text-pink-dark";

  return (
    <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:h-16 lg:px-8">
      {/* Left (anchored): hamburger (mobile) + logo */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Abrir menú"
          className="p-2 text-ink hover:bg-green-tint lg:hidden"
        >
          <MenuIcon />
        </button>

        <Link
          href="/"
          aria-label="Cokonu — ir al inicio"
          className="flex items-center"
        >
          {/* Desktop wordmark. Overlay uses the standalone COKONU mark (no
              mascot) so it reads on green/pink and doesn't echo the giant hero
              mascot; the solid header keeps the full logo lockup. */}
          <Image
            src={
              overlay
                ? "/brand/solo_cokonu_verde.png"
                : "/brand/cokonu_logo_web.png"
            }
            alt="Cokonu — Confitería y Papelería"
            width={overlay ? 1562 : 560}
            height={overlay ? 618 : 133}
            priority
            className={
              overlay
                ? "hidden h-9 w-auto object-contain lg:block xl:h-10"
                : "hidden h-10 w-auto object-contain lg:block xl:h-12"
            }
          />
          {/* Coconut character on mobile (reads on both white and green/pink). */}
          <Image
            src="/brand/logo_coko.png"
            alt="Cokonu"
            width={40}
            height={40}
            priority
            className="h-9 w-9 object-contain lg:hidden"
          />
        </Link>
      </div>

      {/* Center (desktop): departments (+ search on the solid header). */}
      <HeaderNav variant={variant} onSearch={onOpenSearch} />

      {/* Right (anchored): search + cart. */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {overlay ? (
          <>
            {/* Buscar pill (desktop). */}
            <button
              type="button"
              aria-label="Buscar"
              onClick={onOpenSearch}
              className={cn(
                "is-round hidden items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-[400ms] ease-out hover:brightness-95 lg:inline-flex",
                chipTint,
                chipInk,
              )}
            >
              <SearchIcon width={18} height={18} />
              Buscar
            </button>

            {/* Search circle chip (mobile). */}
            <button
              type="button"
              aria-label="Buscar"
              onClick={onOpenSearch}
              className={cn(
                "is-round flex h-9 w-9 items-center justify-center transition-colors duration-[400ms] ease-out hover:brightness-95 lg:hidden",
                chipTint,
                chipInk,
              )}
            >
              <SearchIcon />
            </button>

            {/* Cart circle chip. */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrito, ${itemCount} artículos`}
              className={cn(
                "is-round relative flex h-9 w-9 items-center justify-center transition-colors duration-[400ms] ease-out hover:brightness-95 sm:h-10 sm:w-10",
                chipTint,
                chipInk,
              )}
            >
              <CartIcon />
              <span
                aria-hidden
                className="cart-count-badge absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center bg-green-dark text-[10px] font-medium leading-none text-surface"
              >
                {itemCount}
              </span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              aria-label="Buscar"
              onClick={onOpenSearch}
              className="p-2 text-ink hover:bg-green-tint lg:hidden"
            >
              <SearchIcon />
            </button>

            <button
              type="button"
              onClick={openCart}
              aria-label={`Abrir carrito, ${itemCount} artículos`}
              className="relative p-2 text-ink hover:bg-green-tint"
            >
              <CartIcon />
              <span
                aria-hidden
                className="cart-count-badge absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center bg-green-dark text-[10px] font-medium leading-none text-surface"
              >
                {itemCount}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
