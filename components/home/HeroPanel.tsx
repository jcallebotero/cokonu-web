"use client";

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
 * `data-hero-panel` marks the exact box the intro measures and grows into. Every
 * [data-cascade] element fades in together during ACT 4 (no stagger).
 */
export function HeroPanel() {
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
    <section
      ref={scope}
      data-hero-panel
      className={cn(
        "hero-panel relative flex min-h-[calc(100svh-5.5rem)] w-full flex-col overflow-hidden [container-type:inline-size] transition-colors duration-[400ms] ease-out",
        cookie ? "bg-green" : "bg-pink",
      )}
    >
      {/* Giant wordmark — upper-center, one line, ~90% of the panel width. */}
      <h1
        data-cascade
        className={cn(
          "font-display pointer-events-none absolute inset-x-0 top-[13%] select-none whitespace-nowrap text-center text-[20cqw] leading-[0.8] transition-colors duration-[400ms] ease-out",
          cookie ? "text-green-pale" : "text-pink-tint",
        )}
      >
        COKONU
      </h1>

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
    </section>
  );
}
