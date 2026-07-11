"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchPanel } from "@/components/search/SearchPanel";
import { useCart } from "@/context/CartContext";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { useIntroCascade } from "@/components/home/useIntroCascade";
import { SearchIcon, CartIcon, MenuIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/**
 * Home-only header. Desktop and mobile diverge:
 *
 *  - Desktop (lg+): a minimal INTEGRATED header INSIDE the panel — the mascot
 *    silhouette top-left + the search/cart chips top-right (no logo, no nav) —
 *    that scrolls away, plus the scroll-handoff sticky header (full nav) that
 *    slides in past the threshold. HomeOverlayHeader + HomeStickyHeader.
 *
 *  - Mobile (<lg): ONE fixed white header (hamburger / centered coco / chips),
 *    always visible, no marquee, no handoff. HomeMobileHeader.
 *
 * The chip cluster is rendered at the root (z-40) so its search bar clears the
 * z-30 search scrim; on desktop it's anchored to a box that mirrors the panel's
 * margins so it sits INSIDE the panel (never on the white frame).
 */

/** Portion of the hero you scroll before the sticky header takes over. */
const TAKEOVER_FRACTION = 0.5;

/** Mode-tinted search + cart chips (shared by desktop overlay + mobile fixed). */
function HeaderChips({
  onOpenSearch,
  pill = false,
}: {
  onOpenSearch: () => void;
  pill?: boolean;
}) {
  const { itemCount, openCart } = useCart();
  const { mode } = useHeroMode();
  const tint = mode === "cookie" ? "bg-green-tint" : "bg-pink-tint";
  const ink = mode === "cookie" ? "text-green-deep" : "text-pink-dark";

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {pill ? (
        <button
          type="button"
          aria-label="Buscar"
          onClick={onOpenSearch}
          className={cn(
            "is-round inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-[400ms] ease-out hover:brightness-95",
            tint,
            ink,
          )}
        >
          <SearchIcon width={18} height={18} />
          Buscar
        </button>
      ) : (
        <button
          type="button"
          aria-label="Buscar"
          onClick={onOpenSearch}
          className={cn(
            "is-round flex h-9 w-9 items-center justify-center transition-colors duration-[400ms] ease-out hover:brightness-95",
            tint,
            ink,
          )}
        >
          <SearchIcon />
        </button>
      )}

      <button
        type="button"
        onClick={openCart}
        aria-label={`Abrir carrito, ${itemCount} artículos`}
        className={cn(
          "is-round relative flex h-9 w-9 items-center justify-center transition-colors duration-[400ms] ease-out hover:brightness-95 sm:h-10 sm:w-10",
          tint,
          ink,
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
    </div>
  );
}

/** Coconut silhouette (top-left), filled with the mode tint via a CSS mask. */
function HeroSilhouette() {
  const { mode } = useHeroMode();
  const maskStyle: CSSProperties = {
    maskImage: "url(/brand/coko_header_hero.png)",
    WebkitMaskImage: "url(/brand/coko_header_hero.png)",
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  };
  return (
    <div
      aria-hidden
      style={maskStyle}
      className={cn(
        "aspect-[649/618] h-14 transition-colors duration-[400ms] ease-out xl:h-16",
        mode === "cookie" ? "bg-green-tint" : "bg-pink-tint",
      )}
    />
  );
}

/** Desktop (lg+): silhouette + chips inside the panel, scrolls away. */
export function HomeOverlayHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  // Silhouette + chips are the ACT 4 TOP group: drop in from above.
  const scope = useIntroCascade({
    fromY: -24,
    stagger: 0.14,
    startDelay: 0,
    duration: 1.05,
  });

  return (
    <div ref={scope} className="hidden lg:block">
      {/* Box mirrors the panel's lg margins (p-11 = 44px) so its children inset
          from the panel edge, never the white frame. Absolute-in-document, so it
          scrolls away with the panel. z-40 clears the z-30 search scrim. */}
      <div className="absolute left-11 right-11 top-11 z-40">
        <div className="relative">
          {/* Inset ~24px from the panel edge, matching the corner pills. */}
          <div className="flex items-start justify-between px-6 pt-6">
            <div data-cascade>
              <HeroSilhouette />
            </div>
            <div data-cascade>
              <HeaderChips pill onOpenSearch={() => setSearchOpen(true)} />
            </div>
          </div>
          {/* Search bar spans the panel width, anchored below the chip row. */}
          <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </div>
    </div>
  );
}

/** Mobile (<lg): one fixed white header, always visible. */
export function HomeMobileHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // The whole white bar drops in with the ACT 4 TOP group.
  const scope = useIntroCascade({
    fromY: -24,
    stagger: 0,
    startDelay: 0,
    duration: 1.05,
  });

  return (
    <>
      {/* Transparent fixed wrapper; the white bar lives in the cascade layer so
          it slides/fades in during ACT 4. */}
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

            {/* Centered logo (absolute so it doesn't drift with side content). */}
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

            <div className="ml-auto">
              <HeaderChips onOpenSearch={() => setSearchOpen(true)} />
            </div>
          </div>
        </div>

        {/* Anchored to the fixed wrapper (not the transformed cascade layer). */}
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

/** Desktop (lg+): the normal white header + marquee, hidden until the handoff. */
export function HomeStickyHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // `|| innerHeight` guards a transient 0-height panel measurement at mount
    // (which would otherwise read the threshold as 0 and wrongly "take over").
    const threshold = () => {
      const panel = document.querySelector("[data-hero-panel]");
      const h = panel?.getBoundingClientRect().height || window.innerHeight;
      return h * TAKEOVER_FRACTION;
    };

    let lastY = window.scrollY;
    let wasBelow = true;
    const update = () => {
      const y = window.scrollY;
      const below = y < threshold();
      if (below) {
        setShown(false); // integrated row owns the top
      } else if (wasBelow) {
        setShown(true); // just crossed the handoff → slide in
      } else if (y > lastY + 4) {
        setShown(false); // scrolling down
      } else if (y < lastY - 4) {
        setShown(true); // scrolling up
      }
      wasBelow = below;
      lastY = y;
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    update(); // resting state (runs without rAF)
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // Desktop only — mobile uses the fixed HomeMobileHeader instead.
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-40 hidden transition-[transform,opacity] duration-[350ms] ease-out lg:block",
        shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
      )}
    >
      <AnnouncementBar />
      <header className="relative border-b border-line bg-bg/90 backdrop-blur">
        <HeaderRow
          variant="solid"
          onOpenMobile={() => {}}
          onOpenSearch={() => setSearchOpen(true)}
        />
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>
    </div>
  );
}
