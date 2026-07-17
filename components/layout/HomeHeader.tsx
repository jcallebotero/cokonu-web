"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValueEvent, useTransform } from "framer-motion";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchPanel } from "@/components/search/SearchPanel";
import { useCart } from "@/context/CartContext";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { useIntroCascade } from "@/components/home/useIntroCascade";
import {
  BAR_START,
  EFFECT_SCROLL,
  LAND_POINT,
  NAV_FADE_END,
  NAV_LANDED_Y,
  NAV_REST_Y,
  useHeroProgress,
} from "@/components/home/heroScroll";
import { SearchIcon, CartIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Home header. Two completely separate renders, CSS-gated by breakpoint:
 *  - MOBILE (<lg): a plain FIXED bar, visible from the start (hamburger / centered
 *    coco logo / chips). No scroll effect — the hero below is static.
 *  - DESKTOP (≥lg): the scroll-driven header that rests INSIDE the panel and
 *    travels up to land as a bar (see DesktopHomeHeader).
 */
export function HomeHeader() {
  return (
    <>
      <MobileHomeHeader />
      <DesktopHomeHeader />
    </>
  );
}

/** Mode-tinted cart badge shared by both headers. */
function CartBadge({ count }: { count: number }) {
  return (
    <span
      aria-hidden
      className="cart-count-badge absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center bg-green-dark text-[10px] font-medium leading-none text-surface"
    >
      {count}
    </span>
  );
}

/* ───────────────────────── Mobile: plain fixed header ─────────────────────── */

function MobileHomeHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { mode } = useHeroMode();
  const cookie = mode === "cookie";
  const chipTint = cookie ? "bg-green-tint" : "bg-pink-tint";
  const chipInk = cookie ? "text-green-deep" : "text-pink-dark";

  // ACT 4: the whole bar drops in with the top group.
  const scope = useIntroCascade({ fromY: -14, startDelay: 0.2 });

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 lg:hidden">
        <div ref={scope}>
          <div
            data-cascade
            className="relative flex h-14 items-center bg-surface px-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
              className="p-2 text-ink hover:bg-green-tint"
            >
              <MenuIcon />
            </button>

            {/* Centered coco logo (visible from the start on mobile). */}
            <Link
              href="/"
              aria-label="Cokonu — ir al inicio"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
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

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "is-round flex h-9 w-9 items-center justify-center transition-colors duration-300 ease-out hover:brightness-95",
                  chipTint,
                  chipInk,
                )}
              >
                <SearchIcon />
              </button>
              <button
                type="button"
                onClick={openCart}
                aria-label={`Abrir carrito, ${itemCount} artículos`}
                className={cn(
                  "is-round relative flex h-9 w-9 items-center justify-center transition-colors duration-300 ease-out hover:brightness-95 sm:h-10 sm:w-10",
                  chipTint,
                  chipInk,
                )}
              >
                <CartIcon />
                <CartBadge count={itemCount} />
              </button>
            </div>
          </div>
        </div>

        {/* Anchored to the fixed wrapper (not the cascade layer). */}
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/* ───────────────────── Desktop: scroll-driven traveling header ────────────── */

// Horizontal padding aligns with the PANEL's inner content edge so the items sit
// at the SAME x at rest (inside the panel) and when landed (in the bar) — no jump.
// = panel margin (lg:p-11 = 44px) + panel inner inset (corner pills' left-6/right-6
//   = 24px).
const PANEL_INSET = "px-[68px]";

function DesktopHomeHeader() {
  const { scrollY, progress, reduce } = useHeroProgress();
  const [searchOpen, setSearchOpen] = useState(false);
  const [landed, setLanded] = useState(false);
  const { itemCount, openCart } = useCart();
  const { mode } = useHeroMode();
  const cookie = mode === "cookie";

  // Continuous travel + bar fade (non-reduced motion).
  const navY = useTransform(progress, [0, 1], [NAV_REST_Y, NAV_LANDED_Y]);
  const barOpacity = useTransform(progress, [BAR_START, 1], [0, 1], {
    clamp: true,
  });
  // Nav LINKS only: invisible at rest (clean panel), fade in across the first
  // half of the travel, solid by the time they land. Chips stay visible.
  const navLinksOpacity = useTransform(progress, [0, NAV_FADE_END], [0, 1], {
    clamp: true,
  });

  useMotionValueEvent(scrollY, "change", (s) => {
    setLanded(reduce ? s > 40 : s / EFFECT_SCROLL > LAND_POINT);
  });

  // ACT 4: nav items fade in with the top group, INSIDE the panel (at NAV_REST_Y).
  const scope = useIntroCascade({ fromY: -14, startDelay: 0.2 });

  const chipTint = cookie ? "bg-green-tint" : "bg-pink-tint";
  const chipInk = cookie ? "text-green-deep" : "text-pink-dark";
  // Rest: the light wordmark tone (green-pale / pink-tint) → ink once landed.
  const navColor = landed
    ? "text-ink"
    : cookie
      ? "text-green-pale"
      : "text-pink-tint";

  // Logo wipe (approved, unchanged): clipped at rest → uncovered left→right.
  const wipe = {
    clipPath: landed ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
    transition: reduce ? "none" : "clip-path 420ms ease-out",
  } as const;

  const opacity = reduce ? (landed ? 1 : 0) : barOpacity;

  return (
    <header className="fixed inset-x-0 top-0 z-40 hidden lg:block">
      <div ref={scope}>
        {/* Marquee — fixed strip at the very top; fades in as the bar lands.
            Opaque (bg-green-tint); its height (28px) === NAV_LANDED_Y so the bar
            sits flush beneath it with no seam. */}
        <motion.div
          aria-hidden={!landed}
          style={{ opacity }}
          className="absolute inset-x-0 top-0"
        >
          <AnnouncementBar />
        </motion.div>

        {/* Traveling nav row: rests inside the panel (NAV_REST_Y), rises to the
            header (NAV_LANDED_Y). Only this element's translateY moves. */}
        <motion.div
          style={{ y: reduce ? (landed ? NAV_LANDED_Y : NAV_REST_Y) : navY }}
          className="relative"
        >
          {/* Bar background — fades in behind the nav as it lands. FULLY OPAQUE
              (bg-bg, no alpha/backdrop) so the green panel never bleeds through. */}
          <motion.div
            style={{ opacity }}
            className="absolute inset-0 border-b border-line bg-bg"
          />

          <div
            data-cascade
            className={cn(
              "relative flex h-16 w-full items-center justify-between gap-4",
              PANEL_INSET,
            )}
          >
            {/* Left: logo — absent at rest, wipes in at landing. Its width is
                always reserved so the nav never shifts horizontally. */}
            <Link
              href="/"
              aria-label="Cokonu — ir al inicio"
              aria-hidden={!landed}
              tabIndex={landed ? undefined : -1}
              className="flex shrink-0 items-center"
              style={wipe}
            >
              <Image
                src="/brand/cokonu_logo_web.png"
                alt=""
                width={2156}
                height={513}
                priority
                className="h-10 w-auto object-contain xl:h-12"
              />
            </Link>

            {/* Center: department nav + mega-menus. Reused; label color goes from
                the light wordmark tone at rest → ink on landing. Wrapped so the
                LINKS fade in from invisible during the travel (the chips, outside
                this wrapper, stay visible). */}
            <motion.div
              className="flex flex-1"
              style={{
                opacity: reduce ? (landed ? 1 : 0) : navLinksOpacity,
              }}
            >
              <HeaderNav
                variant="overlay"
                labelColor={navColor}
                onSearch={() => setSearchOpen(true)}
              />
            </motion.div>

            {/* Right: Buscar + cart, mode-tinted chips in both states. */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Buscar"
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "is-round inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-300 ease-out hover:brightness-95",
                  chipTint,
                  chipInk,
                )}
              >
                <SearchIcon width={18} height={18} />
                Buscar
              </button>
              <button
                type="button"
                onClick={openCart}
                aria-label={`Abrir carrito, ${itemCount} artículos`}
                className={cn(
                  "is-round relative flex h-10 w-10 items-center justify-center transition-colors duration-300 ease-out hover:brightness-95",
                  chipTint,
                  chipInk,
                )}
              >
                <CartIcon />
                <CartBadge count={itemCount} />
              </button>
            </div>
          </div>

          {/* Search bar (absolute, top-full) — anchored to the traveling row so it
              drops below it in either state. Its scrim is portalled to body. */}
          <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        </motion.div>
      </div>
    </header>
  );
}
