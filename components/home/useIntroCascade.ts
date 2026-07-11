"use client";

import { useEffect } from "react";
import { useAnimate, useReducedMotion, stagger } from "framer-motion";

/* Expo-out feel, shared with the intro. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
/* Failsafe: reveal even if the intro never dispatches "done" (JS error, etc.). */
const FAILSAFE_MS = 6500;

/**
 * ACT 4 cascade for hero / header items.
 *
 * When this load is running the intro (html[data-intro] === "play"), every
 * [data-cascade] descendant of the returned scope is hidden immediately (it's
 * covered by the intro's white overlay meanwhile), then slid + faded into place
 * when the intro finishes (the "cokonu:intro-done" event), staggered in DOM
 * order. On skipped loads or with reduced motion, items stay in their final
 * rendered state — no animation, no flash.
 *
 * `fromY` is the slide offset: negative = drop in from above (header), positive
 * = rise in from below (hero content).
 */
export function useIntroCascade({
  fromY,
  stagger: step = 0.13,
  startDelay = 0,
  duration = 1.05,
}: {
  fromY: number;
  stagger?: number;
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

    // Park hidden (behind the intro overlay) until the reveal.
    animate(items, { opacity: 0, y: fromY }, { duration: 0 });

    let done = false;
    const reveal = () => {
      if (done) return;
      done = true;
      animate(
        items,
        { opacity: 1, y: 0 },
        { duration, ease: EASE, delay: stagger(step, { startDelay }) },
      );
    };

    window.addEventListener("cokonu:intro-done", reveal, { once: true });
    const failsafe = window.setTimeout(reveal, FAILSAFE_MS);

    return () => {
      window.removeEventListener("cokonu:intro-done", reveal);
      window.clearTimeout(failsafe);
    };
  }, [scope, animate, reduce, fromY, step, startDelay, duration]);

  return scope;
}
