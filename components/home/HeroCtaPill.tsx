"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { cn } from "@/lib/cn";

/**
 * The mode-aware "Ver catálogo" CTA pill. Two responsive placements (single
 * instance — same element, repositioned by breakpoint at `md` = 768px):
 *
 *  - PHONE only (< md / ≤ 767px): a compact CONTENT-WIDTH tinted pill (hugs
 *    [label + gap + arrow], no dead space inside), centered horizontally and
 *    dropped to `top-[44%]` — the vertical MIDPOINT of the gap between the
 *    wordmark bottom and the mascot's (bottom-anchored) visual top (~75%), with
 *    generous breathing room above and below. Tinted in the wordmark's light
 *    tint (green-pale ⇄ pink-tint), re-tints on toggle with the shared 400ms
 *    crossfade. Larger label (text-lg), one line (whitespace-nowrap).
 *  - TABLET / DESKTOP (≥ md / 768px+): the original bottom-left white pill
 *    (UNCHANGED). Using `md:` — not `lg:` — keeps the big below-title pill off
 *    tablet/laptop/square windows, where it used to overlap the wordmark.
 *
 * Part of the ACT 4 group (data-cascade) that fades in together. The cascade
 * animates the OUTER <Link>'s transform (y); the hover-scale + tint crossfade
 * live on the INNER pill <span> so they never fight the cascade's y-tween. The
 * phone layout uses inset/margin (not translate) so it can't clash with that
 * transform.
 */
export function HeroCtaPill() {
  const { mode } = useHeroMode();
  const cookie = mode === "cookie";

  return (
    <Link
      href={cookie ? "/confiteria" : "/papeleria"}
      data-cascade
      aria-label={
        cookie ? "Ver catálogo de confitería" : "Ver catálogo de papelería"
      }
      className="group absolute inset-x-0 top-[44%] z-20 mx-auto flex w-fit md:inset-x-auto md:left-6 md:top-auto md:bottom-6 md:mx-0 md:inline-flex md:w-auto"
    >
      <span
        className={cn(
          // Phone: CONTENT-WIDTH tinted pill (label + arrow packed with a small
          // gap; no dead space). Larger label; still one line.
          "is-round inline-flex items-center gap-2 py-3 pl-5 pr-2 text-lg font-medium text-ink shadow-[0_12px_34px_-12px_rgba(0,0,0,0.45)] transition-[background-color,transform] duration-[400ms] ease-out group-hover:scale-[1.03]",
          // Desktop: revert to the original white pill padding/gaps.
          "md:gap-4 md:py-[18px] md:pl-8 md:pr-2.5",
          cookie ? "bg-green-pale md:bg-white" : "bg-pink-tint md:bg-white",
        )}
      >
        {/* Label fades in on mode change; ALWAYS one line (no wrap). */}
        <span className="whitespace-nowrap leading-tight">
          <motion.span
            key={mode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="block"
          >
            {cookie ? "Ver catálogo de confitería" : "Ver catálogo de papelería"}
          </motion.span>
        </span>
        <span
          className={cn(
            // Arrow circle keeps the brand accent (mobile) / light tint (desktop).
            "is-round flex h-9 w-9 shrink-0 items-center justify-center transition-colors duration-[400ms] ease-out md:h-12 md:w-12",
            cookie ? "bg-green md:bg-green-tint" : "bg-pink md:bg-pink-tint",
          )}
        >
          <ArrowRight
            className={cn(
              // Arrow icon: same light tint as the pill (mobile); dark on the
              // white desktop pill (unchanged).
              "h-5 w-5 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5",
              cookie
                ? "text-green-pale md:text-green-deep"
                : "text-pink-tint md:text-pink-dark",
            )}
          />
        </span>
      </span>
    </Link>
  );
}
