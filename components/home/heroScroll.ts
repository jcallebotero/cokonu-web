"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Shared source of truth for the home hero → header scroll effect (DESKTOP ONLY;
 * see useIsDesktop). Both the hero panel (scale + wordmark fade) and the desktop
 * header (nav travel + bar + logo wipe) read the SAME progress, derived from the
 * RAW window scroll position over a fixed pixel distance. That distance is a
 * constant — nothing this effect transforms feeds back into it — so progress is
 * strictly monotonic with scroll and the two subtrees stay in sync.
 *
 * The stable "container" for progress is the viewport scroll itself (px),
 * normalized by EFFECT_SCROLL; the hero panel is pinned (sticky) inside a track
 * that is EFFECT_SCROLL taller than the viewport, which supplies that distance.
 */

/** Scroll distance (px) the pin + hero→header transition plays over. */
export const EFFECT_SCROLL = 340;

/** Nav row translateY (px): resting inside the panel vs landed at the header.
 *  NAV_LANDED_Y equals the marquee height so the bar sits flush beneath it. */
export const NAV_REST_Y = 60;
export const NAV_LANDED_Y = 28;

/** Panel shrink target (uniform, center-anchored). */
export const MIN_SCALE = 0.75;

/** Wordmark fade: held at full opacity through the early scroll, then fades to 0
 *  over a wide, late range so it disappears right as the landing bar covers it.
 *  Monotonic (clamped). */
export const WORDMARK_FADE_START = 0.45;
export const WORDMARK_FADE_END = 0.88;

/** Nav links fade in from invisible (clean panel at rest) to solid by this
 *  progress — roughly the first half of the upward travel. */
export const NAV_FADE_END = 0.5;

/** Progress where the bar background starts fading in behind the nav. */
export const BAR_START = 0.55;

/** Progress at which the header "lands": color flip + logo wipe + marquee. */
export const LAND_POINT = 0.82;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * True at the desktop breakpoint (≥1024px = Tailwind `lg`, the breakpoint that
 * already gates the desktop hero/nav). The whole scroll effect is scoped to this;
 * below it the hero is static and the header is a plain fixed bar. False during
 * SSR/first paint so mobile renders static by default.
 */
export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isDesktop;
}

/**
 * Progress ∈ [0,1] mapped from raw window scrollY over EFFECT_SCROLL, clamped.
 * Also returns the raw scrollY MV (for threshold events) and the reduced-motion
 * flag so callers can gate transforms.
 */
export function useHeroProgress() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, [0, EFFECT_SCROLL], [0, 1], {
    clamp: true,
  });
  return { scrollY, progress, reduce: !!reduce };
}
