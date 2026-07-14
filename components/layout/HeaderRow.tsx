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
 *  - "solid"   → the normal white header. DESKTOP: dark logo lockup left, nav +
 *                Buscar in the center, a plain cart control right. MOBILE: matches
 *                the home mobile header — hamburger left, the coconut logo
 *                CENTERED (44px), and circular brand-green-tint search + cart
 *                chips on the right.
 *  - "overlay" → transparent row on the green/pink hero panel (home top). Swaps
 *                to the standalone COKONU wordmark and restyles the right-side
 *                controls as voldog chips in the current mode tint (green ⇄ pink).
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

  const cartLabel = `Abrir carrito, ${itemCount} artículos`;
  const cartBadge = (
    <span
      aria-hidden
      className="cart-count-badge absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center bg-green-dark text-[10px] font-medium leading-none text-surface"
    >
      {itemCount}
    </span>
  );

  return (
    <div className="relative flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:h-16 lg:px-8">
      {/* Left (anchored): hamburger (mobile) + desktop logo lockup. */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Abrir menú"
          className="p-2 text-ink hover:bg-green-tint lg:hidden"
        >
          <MenuIcon />
        </button>

        {/* Desktop logo (mobile uses the centered logo below). Overlay uses the
            standalone COKONU mark (no mascot) so it reads on green/pink; the
            solid header keeps the full logo lockup. */}
        <Link
          href="/"
          aria-label="Cokonu — ir al inicio"
          className="hidden items-center lg:flex"
        >
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
                ? "h-9 w-auto object-contain xl:h-10"
                : "h-10 w-auto object-contain xl:h-12"
            }
          />
        </Link>
      </div>

      {/* Mobile only: the coconut logo, centered — same asset + size as the home
          mobile header. Absolute so it stays centered regardless of side items. */}
      <Link
        href="/"
        aria-label="Cokonu — ir al inicio"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden"
      >
        <Image
          src="/brand/logo_coko.png"
          alt="Cokonu"
          width={44}
          height={44}
          priority
          className="h-11 w-11 object-contain"
        />
      </Link>

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
              aria-label={cartLabel}
              className={cn(
                "is-round relative flex h-9 w-9 items-center justify-center transition-colors duration-[400ms] ease-out hover:brightness-95 sm:h-10 sm:w-10",
                chipTint,
                chipInk,
              )}
            >
              <CartIcon />
              {cartBadge}
            </button>
          </>
        ) : (
          <>
            {/* Mobile: circular brand-green-tint chips (match the home header). */}
            <button
              type="button"
              aria-label="Buscar"
              onClick={onOpenSearch}
              className="is-round flex h-9 w-9 items-center justify-center bg-green-tint text-green-deep transition-colors duration-[400ms] ease-out hover:brightness-95 lg:hidden"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={openCart}
              aria-label={cartLabel}
              className="is-round relative flex h-9 w-9 items-center justify-center bg-green-tint text-green-deep transition-colors duration-[400ms] ease-out hover:brightness-95 sm:h-10 sm:w-10 lg:hidden"
            >
              <CartIcon />
              {cartBadge}
            </button>

            {/* Desktop: plain cart control (search lives in the center nav). */}
            <button
              type="button"
              onClick={openCart}
              aria-label={cartLabel}
              className="relative hidden p-2 text-ink hover:bg-green-tint lg:block"
            >
              <CartIcon />
              {cartBadge}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
