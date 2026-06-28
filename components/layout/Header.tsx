"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { departments } from "@/config/navigation";
import { useCart } from "@/context/CartContext";
import { DepartmentMenu } from "@/components/layout/DepartmentMenu";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchIcon, CartIcon, MenuIcon } from "@/components/ui/icons";

/**
 * Sticky, minimal header.
 *  - Left: Cokonu logo (wordmark on desktop, coconut on mobile) → "/".
 *  - Center (desktop): departments with hover/keyboard mega-menus.
 *  - Right: search (visual only) + cart button with count badge.
 *  - Mobile: hamburger opens the slide-in MobileMenu.
 */
export function Header() {
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: hamburger (mobile) + logo */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menú"
            className="rounded-md p-2 text-ink hover:bg-green-tint lg:hidden"
          >
            <MenuIcon />
          </button>

          <Link href="/" aria-label="Cokonu — ir al inicio" className="flex items-center">
            {/* Wordmark on desktop */}
            <Image
              src="/brand/logo_cokonu.png"
              alt="Cokonu"
              width={150}
              height={48}
              priority
              className="hidden h-9 w-auto object-contain lg:block"
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

        {/* Center: department nav (desktop) */}
        <nav aria-label="Departamentos" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {departments.map((dept) => (
              <DepartmentMenu key={dept.slug} department={dept} />
            ))}
          </ul>
        </nav>

        {/* Right: search (visual) + cart */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Buscar"
            title="Buscar (próximamente)"
            className="rounded-md p-2 text-ink hover:bg-green-tint"
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Abrir carrito, ${itemCount} artículos`}
            className="relative rounded-md p-2 text-ink hover:bg-green-tint"
          >
            <CartIcon />
            <span
              aria-hidden
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-dark px-1 text-[10px] font-medium leading-none text-surface"
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
