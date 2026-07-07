"use client";

import { useEffect, useState } from "react";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SearchPanel } from "@/components/search/SearchPanel";
import { cn } from "@/lib/cn";

/**
 * Default sticky header (every page EXCEPT the home page — home uses the
 * integrated overlay + scroll-handoff headers, see HomeHeaders.tsx).
 *
 *  - Announcement marquee in normal flow above the sticky header (scrolls away).
 *  - Sticky header row (HeaderRow) that hides on scroll down, reveals on scroll
 *    up, always shown near the top. Uses a transform (no layout shift).
 *  - The search bar/dropdown live inside <header> so they anchor to it and clear
 *    the search scrim; MobileMenu is rendered OUTSIDE (the header's backdrop
 *    blur would otherwise clip its fixed positioning).
 */
export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
      <AnnouncementBar />

      <header
        className={cn(
          "sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur transition-transform duration-300 ease-out",
          hidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <HeaderRow
          variant="solid"
          onOpenMobile={() => setMobileOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Slide-in search bar + live dropdown, anchored below the header row. */}
        <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      {/*
        Rendered OUTSIDE <header> on purpose: the header uses backdrop-blur,
        which makes it the containing block for fixed descendants. Keeping the
        slide-in menu here ensures its `fixed inset-0` resolves against the
        viewport (full-height panel, not clipped to the header).
      */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
