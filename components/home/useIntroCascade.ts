"use client";

import { useEffect } from "react";
import { useAnimate, useReducedMotion } from "framer-motion";

/**
 * ACT 4 entrance timing — the tunable knobs live here.
 *
 * `REVEAL_DURATION` is the single shared window: every [data-cascade] element
 * fades in TOGETHER (there is no stagger), so nothing enters one-by-one.
 * `REVEAL_EASE` is ease-in-out so the opacity ramps gradually across the WHOLE
 * duration (never reaching opaque early) — the fade, not the small slide, is
 * what the eye follows.
 */
const REVEAL_DURATION = 2; // seconds
const REVEAL_EASE: [number, number, number, number] = [0.42, 0, 0.58, 1]; // ease-in-out
/* Failsafe: reveal even if the intro never dispatches "done" (JS error, etc.). */
const FAILSAFE_MS = 6500;

/**
 * ACT 4 entrance for hero / header items.
 *
 * When this load is running the intro (html[data-intro] === "play"), every
 * [data-cascade] descendant of the returned scope is hidden immediately (it's
 * covered by the intro's white overlay meanwhile), then faded + slid into place
 * ALL AT ONCE when the intro finishes (the "cokonu:intro-done" event) — no
 * per-item stagger. On skipped loads or with reduced motion, items stay in their
 * final rendered state — no animation, no flash.
 *
 * `fromY` is the (small) slide offset: negative = drop in from above (header),
 * positive = rise in from below (hero content). Keep it subtle so the opacity
 * fade dominates.
 */
export function useIntroCascade({
  fromY,
  startDelay = 0,
  duration = REVEAL_DURATION,
}: {
  fromY: number;
  startDelay?: number;
  duration?: number;
}) {
  const [scope, animate] = useAnimate();
  const reduce = useReducedMotion();

  useEffect(() => {
    const root = scope.current as HTMLElement | null;
    if (!root) return;
    const items = root.querySelectorAll("[data-cascade]");
    if (!items.length) return;

    const playing = document.documentElement.dataset.intro === "play";
    if (!playing || reduce) return; // already in final state

    // Park hidden (behind the intro overlay) until the reveal: fully transparent
    // so the opacity animates from a true 0, not a partial value.
    animate(items, { opacity: 0, y: fromY }, { duration: 0 });

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      // No per-index delay: every item shares one `startDelay`, so they all
      // start and finish their fade together (simultaneous entrance).
      animate(
        items,
        { opacity: 1, y: 0 },
        { duration, ease: REVEAL_EASE, delay: startDelay },
      );
    };

    window.addEventListener("cokonu:intro-done", reveal, { once: true });
    const failsafe = window.setTimeout(reveal, FAILSAFE_MS);

    return () => {
      window.removeEventListener("cokonu:intro-done", reveal);
      window.clearTimeout(failsafe);
    };
  }, [scope, animate, reduce, fromY, startDelay, duration]);

  return scope;
}
