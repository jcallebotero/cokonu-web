"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAnimate, useReducedMotion } from "framer-motion";

/* Preview flag lives in a plain module so app/page.tsx's server-rendered gate
   script can read its real value; the pre-paint gate does the once-per-session
   vs. every-load decision (see app/page.tsx + globals.css). */
export { FORCE_INTRO } from "@/components/home/introConfig";

/* Expo-out feel: fast start, soft settle. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* Act durations (seconds) — a starting point, tune to taste. */
const T = {
  seedIn: 0.7, // ACT 1: seed fades + zooms in
  wordIn: 0.45, // ACT 2: wordmark swipes up
  wordHold: 0.4, // ACT 2: hold
  wordOut: 0.3, // ACT 3: wordmark fades out
  expand: 0.85, // ACT 3: box grows to the panel
  handoff: 0.3, // ACT 4: overlay crossfades to the live panel
};

const SEED_RADIUS = 26; // px

/**
 * Reveals the real page: globals.css stops hiding [data-hero-live] + drops the
 * pre-paint white cover + unlocks scroll, and the ACT 4 cascades + mascot loop
 * start (they listen for "cokonu:intro-done").
 */
function finishIntro() {
  document.documentElement.dataset.intro = "done";
  window.dispatchEvent(new Event("cokonu:intro-done"));
}

function clamp(min: number, val: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

type Plan = {
  seedW: number;
  seedH: number;
  seedTop: number;
  seedLeft: number;
  fontSize: number;
  rect: { top: number; left: number; width: number; height: number };
  radius: number;
};

/**
 * Intro "zoom curtain", 4 acts (see the spec / app/page.tsx gate):
 *   1. White covers everything; a small rounded green seed fades + zooms in.
 *   2. A small COKONU wordmark swipes up inside the seed, holds, fades out.
 *   3. The now-EMPTY seed grows (box width/height, not scale — so the corners
 *      stay crisp) into the hero panel's exact measured rect.
 *   4. Hand off to the live panel: reveal it (its header + content cascade in)
 *      and crossfade this overlay away.
 *
 * Portaled to <body> so it sits above the header and covers it during ACTS 1–3.
 * Only runs when html[data-intro] === "play".
 */
export function IntroCurtain() {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();
  const started = useRef(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [done, setDone] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);

  // Decide + measure once.
  useEffect(() => {
    if (started.current) return;
    if (document.documentElement.dataset.intro !== "play") return;
    started.current = true;

    if (reduce) {
      finishIntro(); // reduced motion: skip all acts, show final state
      return;
    }
    const panel = document.querySelector("[data-hero-panel]");
    if (!panel) {
      finishIntro();
      return;
    }

    const r = panel.getBoundingClientRect();
    const radius = parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 24;
    const seedW = clamp(180, 0.14 * window.innerWidth, 260);
    const seedH = (seedW * 5) / 9; // ~9:5 landscape card

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan({
      seedW,
      seedH,
      seedTop: (window.innerHeight - seedH) / 2,
      seedLeft: (window.innerWidth - seedW) / 2,
      fontSize: seedW * 0.15,
      rect: { top: r.top, left: r.left, width: r.width, height: r.height },
      radius,
    });
  }, [reduce]);

  // Run the timeline once the overlay (and its refs) are on screen.
  useEffect(() => {
    if (!plan) return;
    const box = boxRef.current;
    const word = wordRef.current;
    if (!box || !word) return;

    const controls = animate([
      // ACT 1 — seed fades + zooms in.
      [box, { opacity: [0, 1], scale: [0.9, 1] }, { duration: T.seedIn, ease: "easeOut" }],
      // ACT 2 — wordmark swipes up, then holds (via the next entry's `at`).
      [word, { opacity: [0, 1], y: ["55%", "0%"] }, { duration: T.wordIn, ease: "easeOut" }],
      // ACT 3a — wordmark fades out + drifts up (after the hold).
      [
        word,
        { opacity: [1, 0], y: ["0%", "-30%"] },
        { duration: T.wordOut, ease: "easeIn", at: `+${T.wordHold}` },
      ],
      // ACT 3b — the empty box grows into the panel's exact rect (crisp corners).
      [
        box,
        {
          top: [plan.seedTop, plan.rect.top],
          left: [plan.seedLeft, plan.rect.left],
          width: [plan.seedW, plan.rect.width],
          height: [plan.seedH, plan.rect.height],
          "--intro-radius": [`${SEED_RADIUS}px`, `${plan.radius}px`],
        },
        { duration: T.expand, ease: EASE, at: "+0" },
      ],
    ]);

    let cancelled = false;
    controls.finished.then(async () => {
      if (cancelled) return;
      // ACT 4 — reveal the live panel (header + content cascade in), then
      // crossfade this overlay away. The box already coincides with the panel
      // (same green, same rect) so the swap is seamless.
      finishIntro();
      await animate(scope.current, { opacity: [1, 0] }, { duration: T.handoff, ease: "easeOut" }).finished;
      if (!cancelled) setDone(true);
    });

    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [plan, animate, scope]);

  if (typeof document === "undefined" || done || !plan) return null;

  return createPortal(
    <div
      ref={scope}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
    >
      {/* White stage: covers the header + page while the seed grows. */}
      <div className="absolute inset-0 bg-white" />

      {/* Green box: starts as the centered seed, grows into the panel rect. */}
      <div
        ref={boxRef}
        className="intro-box absolute flex items-center justify-center overflow-hidden bg-green"
        style={{
          top: plan.seedTop,
          left: plan.seedLeft,
          width: plan.seedW,
          height: plan.seedH,
          opacity: 0,
          transformOrigin: "center",
          willChange: "transform, width, height, top, left",
          // Escapes the global square-corners reset; animated in ACT 3.
          ["--intro-radius" as string]: `${SEED_RADIUS}px`,
        }}
      >
        {/* ACT 2 wordmark — separate element, clipped by the box; never coexists
            with the giant hero <h1>. */}
        <span
          ref={wordRef}
          className="font-display select-none whitespace-nowrap leading-none text-green-pale"
          style={{ fontSize: plan.fontSize, opacity: 0 }}
        >
          COKONU
        </span>
      </div>
    </div>,
    document.body,
  );
}
