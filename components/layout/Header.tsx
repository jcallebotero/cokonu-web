"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SearchIcon, CartIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Full-width, dynamic sticky header.
 *  - Far left: Cokonu logo (wordmark on desktop, coconut on mobile) → "/".
 *  - Departments with hover/keyboard mega-menus (desktop).
 *  - Right: animated "Buscar" affordance + cart button with count badge.
 *  - Mobile: hamburger opens the slide-in MobileMenu.
 *  - Hides on scroll down, reveals on scroll up, always shown near the top.
 *    Uses a transform (no layout shift, no flicker).
 */
export function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Reveal on scroll up / near top; hide on scroll down.
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      if (y < 12) {
        setHidden(false);
      } else if (y > lastY + 4) {
        setHidden(true); // scrolling down
      } else if (y < lastY - 4) {
        setHidden(false); // scrolling up
      }
      lastY = y;
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* In normal flow ABOVE the sticky header: only visible at the very top,
          scrolls away naturally, and the reappearing sticky header omits it. */}
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur transition-transform duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          {/* Left (anchored): hamburger (mobile) + logo */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
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
              {/* Full logo with mascot on desktop — the hero of the header.
                  Scales down at smaller desktop widths so it never crowds
                  the department nav. */}
              <Image
                src="/brand/cokonu_logo_web.png"
                alt="Cokonu — Confitería y Papelería"
                width={560}
                height={133}
                priority
                className="hidden h-12 w-auto object-contain lg:block xl:h-14"
              />
              {/* Coconut character on mobile */}
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

          {/* Center (desktop): departments + search, balanced between the logo
              and the cart via flex-1 + justify-center. */}
          <div className="hidden flex-1 items-center justify-center gap-8 lg:flex">
            <HeaderNav />
            <button
              type="button"
              aria-label="Buscar"
              title="Buscar (próximamente)"
              className="flex items-center gap-1.5 p-2 text-ink hover:bg-green-tint"
            >
              <SearchIcon />
              <span className="flex items-center text-sm">
                Buscar
                {/* Thicker, taller blinking caret. */}
                <span
                  className="animate-caret ml-1 inline-block h-5 w-[3px] bg-green-dark"
                  aria-hidden
                />
              </span>
            </button>
          </div>

          {/* Right (anchored): search icon (mobile only) + cart */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label="Buscar"
              title="Buscar (próximamente)"
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
          </div>
        </div>
      </header>

      {/*
        Rendered OUTSIDE <header> on purpose: the header uses backdrop-blur
        (backdrop-filter), which makes it the containing block for any
        position:fixed descendant. Keeping the slide-in menu here ensures its
        `fixed inset-0` resolves against the viewport, so the panel is full
        viewport height instead of being clipped to the header's height.
      */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
