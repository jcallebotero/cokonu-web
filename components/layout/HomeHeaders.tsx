"use client";

import { useEffect, useState } from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchPanel } from "@/components/search/SearchPanel";
import { useIntroCascade } from "@/components/home/useIntroCascade";
import { cn } from "@/lib/cn";

/**
 * Home-only header, split in two cooperating pieces:
 *
 *  - HomeOverlayHeader — the INTEGRATED row: transparent, sits on top of the
 *    green hero panel at the very top of the page, and simply scrolls away with
 *    the page. Rendered at the root (z-40, absolute-in-document) so its search
 *    bar / mega-menu clear the z-30 search scrim. Drops in during ACT 4.
 *
 *  - HomeStickyHeader — the normal white header + marquee, hidden above the
 *    viewport until you scroll past ~65% of the hero, then it slides down and
 *    takes over (with the usual hide-on-down / show-on-up afterward).
 */

/** Portion of the hero you scroll before the sticky header takes over. */
const TAKEOVER_FRACTION = 0.5;

export function HomeOverlayHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // Single unit: the whole row drops in from above during ACT 4.
  const scope = useIntroCascade({
    fromY: -24,
    stagger: 0,
    startDelay: 0,
    duration: 0.45,
  });

  return (
    <div ref={scope}>
      {/* Absolute-in-document so it scrolls away with the panel; insets match
          the hero wrapper's margins so it aligns with the panel's top edge. */}
      <div
        data-cascade
        className="absolute inset-x-3 top-3 z-40 lg:inset-x-3.5 lg:top-3.5"
      >
        {/* `relative` positions the search bar (SearchPanel is absolute
            top-full) directly below the row. */}
        <div className="relative">
          <HeaderRow
            variant="overlay"
            onOpenMobile={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />
          <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>
      </div>

      {/* Outside the transformed/anchored row so its fixed positioning resolves
          against the viewport. */}
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}

export function HomeStickyHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
    <>
      <div
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[transform,opacity] duration-[350ms] ease-out",
          shown ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
        )}
      >
        <AnnouncementBar />
        <header className="relative border-b border-line bg-bg/90 backdrop-blur">
          <HeaderRow
            variant="solid"
            onOpenMobile={() => setMobileOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
          />
          <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
      </div>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
