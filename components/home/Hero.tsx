"use client";

import { useTransform } from "framer-motion";
import { HeroPanel } from "@/components/home/HeroPanel";
import {
  EFFECT_SCROLL,
  MIN_SCALE,
  WORDMARK_FADE_END,
  WORDMARK_FADE_START,
  useHeroProgress,
  useIsDesktop,
} from "@/components/home/heroScroll";

/* ── Scroll-linked hero → header transition (DESKTOP ONLY; see heroScroll.ts) ──
   On desktop the panel is PINNED (sticky) at the top of a track that is
   EFFECT_SCROLL taller than the viewport. As those extra pixels scroll by, the
   panel scales UNIFORMLY 1 → MIN_SCALE about its own CENTER (top edge descends,
   sides come in) while the (separate, fixed) header nav travels UP to meet the
   top — they diverge on the same scroll range. Progress comes from raw scroll
   over the fixed EFFECT_SCROLL distance, so the wordmark fade is monotonic.

   MOBILE (and reduced motion): the effect is OFF — the track is natural height
   (no pin), the transforms stay at 1, and the header is a plain fixed bar
   (HomeHeader) with the panel below it. The page just scrolls normally. */

/**
 * Live homepage hero: a near-full-viewport rounded panel inside a white frame.
 * At rest it BREATHES — on desktop a symmetric ~44px margin (the header nav
 * floats inside it, see HomeHeader); on mobile a taller top margin that clears
 * the always-visible fixed mobile header.
 *
 * `data-hero-live` is the intro hook: globals.css keeps it invisible (visibility,
 * not display) while the curtain plays; IntroCurtain measures the inner
 * [data-hero-panel] live, so this wrapper's size doesn't matter to the intro.
 */
export function Hero() {
  const { progress, reduce } = useHeroProgress();
  const isDesktop = useIsDesktop();
  // The scroll effect runs only on desktop, and never under reduced motion.
  const active = isDesktop && !reduce;

  const scale = useTransform(progress, [0, 1], [1, MIN_SCALE]);
  // Holds full opacity until WORDMARK_FADE_START, then fades to 0 by
  // WORDMARK_FADE_END — late + slow, so it reads as the header covering it.
  const wordmarkOpacity = useTransform(
    progress,
    [WORDMARK_FADE_START, WORDMARK_FADE_END],
    [1, 0],
    { clamp: true },
  );

  return (
    <div
      data-hero-live
      className="w-full"
      // Desktop: taller than the viewport by EFFECT_SCROLL so the sticky child
      // holds while that extra height scrolls by (the pin distance). Mobile /
      // reduced motion: natural height, no pin.
      style={active ? { height: `calc(100svh + ${EFFECT_SCROLL}px)` } : undefined}
    >
      <div className={active ? "sticky top-0" : undefined}>
        {/* Mobile reserves ~72px up top for the fixed mobile header; desktop uses
            a symmetric ~44px frame so the panel breathes on all four sides. */}
        <div className="w-full px-4 pb-4 pt-[4.5rem] lg:px-11 lg:pb-11 lg:pt-11">
          <HeroPanel
            scale={active ? scale : 1}
            wordmarkOpacity={active ? wordmarkOpacity : 1}
          />
        </div>
      </div>
    </div>
  );
}
