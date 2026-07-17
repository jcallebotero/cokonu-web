"use client";

import { motion, type MotionValue } from "framer-motion";
import { CokoIdle } from "@/components/home/CokoIdle";
import { HeroCtaPill } from "@/components/home/HeroCtaPill";
import { ModeToggle } from "@/components/home/ModeToggle";
import { useIntroCascade } from "@/components/home/useIntroCascade";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { cn } from "@/lib/cn";

/**
 * The resting hero: a near-full-viewport rounded panel with a generous white
 * frame. Two center-stage elements — the giant COKONU wordmark (upper-center,
 * ~90% of the panel width on one line, sized in container-query units so it
 * scales with the panel) and the mascot (bottom-anchored, in front of the
 * lower letters) — plus the two corner pills (CTA + mode toggle).
 *
 * `[container-type:inline-size]` makes `cqw` resolve against the panel width, so
 * the wordmark and mascot cap scale with the panel, not the viewport. Mode
 * (cookie/pencil) crossfades the panel background + wordmark color.
 *
 * SCROLL EFFECT (driven by <Hero>): `scale` shrinks the whole section toward its
 * center (contents scale with it), and `wordmarkOpacity` fades the wordmark. The
 * section transform is separate from the ACT 4 cascade (which animates the
 * section's CHILDREN), and the scroll fade lives on a WRAPPER around the <h1> so
 * it never fights the cascade's opacity on the <h1> itself. Both are `1` (inert)
 * for reduced motion and at scroll progress 0, so there's no jump at the handoff.
 *
 * `data-hero-panel` marks the exact box the intro measures and grows into. Every
 * [data-cascade] element fades in together during ACT 4 (no stagger).
 */
export function HeroPanel({
  scale,
  wordmarkOpacity,
}: {
  scale: MotionValue<number> | number;
  wordmarkOpacity: MotionValue<number> | number;
}) {
  // Bottom group (rises up): wordmark, mascot, CTA pill, toggle all fade in
  // TOGETHER (no stagger) over the shared ~2s window; small slide so the fade
  // leads. Same startDelay as the top group → the whole hero enters in unison.
  const scope = useIntroCascade({
    fromY: 18,
    startDelay: 0.2,
  });
  const { mode } = useHeroMode();
  const cookie = mode === "cookie";

  return (
    <motion.section
      ref={scope}
      data-hero-panel
      style={{ scale, transformOrigin: "center", willChange: "transform" }}
      className={cn(
        // Fills the viewport at rest, minus the frame. Both breakpoints reserve
        // 5.5rem of vertical frame (mobile: pt-[4.5rem] + pb-4; desktop: p-11).
        "hero-panel relative flex min-h-[calc(100svh-5.5rem)] w-full flex-col overflow-hidden [container-type:inline-size] transition-colors duration-[400ms] ease-out",
        cookie ? "bg-green" : "bg-pink",
      )}
    >
      {/* Giant wordmark — upper-center, one line, ~90% of the panel width. The
          wrapper carries the SCROLL fade; the inner <h1> keeps the ACT 4 cascade
          fade + text styles, so the two opacities never collide. */}
      <motion.div
        style={{ opacity: wordmarkOpacity, willChange: "opacity" }}
        className="pointer-events-none absolute inset-x-0 top-[13%]"
      >
        <h1
          data-cascade
          className={cn(
            "font-display select-none whitespace-nowrap text-center text-[20cqw] leading-[0.8] transition-colors duration-[400ms] ease-out",
            cookie ? "text-green-pale" : "text-pink-tint",
          )}
        >
          COKONU
        </h1>
      </motion.div>

      {/* Mascot — bottom-anchored in the lower-center, in front (z-10). Sized to
          fit within this box (≈64% of the panel height / 90% of its width). */}
      <div
        data-cascade
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[36%] z-10 flex items-end justify-center"
      >
        <CokoIdle />
      </div>

      {/* Corner pills — part of the ACT 4 group that fades in all at once. */}
      <HeroCtaPill />
      <ModeToggle />
    </motion.section>
  );
}
