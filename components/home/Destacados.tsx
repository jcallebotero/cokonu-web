"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Cookie, Pencil } from "lucide-react";
import {
  useHeroMode,
  type HeroMode,
} from "@/components/home/HeroModeContext";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

/**
 * Single canonical ribbon path (green shape, reused for BOTH modes). Drawn in a
 * fixed 1440×400 viewBox and stretched by preserveAspectRatio="none"; only the
 * STROKE COLOR changes between modes — never the geometry.
 */
const RIBBON_D = "M -80 150 C 260 30, 500 270, 760 170 S 1240 70, 1540 250";

/**
 * Home "Destacados" showcase, filtered by the SHARED hero mode
 * (cookie = confitería / pencil = papelería).
 *
 * DATA (unchanged): both department lists are computed on the SERVER
 * (getFeaturedByDepartment) and passed in as props, so switching is INSTANT with
 * no refetch — the client just crossfades between the two already-in-memory
 * grids. The toggle here and the hero toggle read/write the SAME HeroMode
 * context, so they stay in sync. Default is cookie (confitería).
 *
 * VISUALS: an eyebrow line (split left/right), a giant mode-colored "DESTACADOS"
 * wordmark with the toggle beside it, and a decorative wavy ribbon that PAINTS
 * itself right→left once when the section scrolls into view.
 */
export function Destacados({
  confiteria,
  papeleria,
}: {
  confiteria: Product[];
  papeleria: Product[];
}) {
  const { mode, setMode } = useHeroMode();
  const cookie = mode === "cookie";
  const products = cookie ? confiteria : papeleria;
  const reduce = useReducedMotion();

  const sectionRef = useRef<HTMLElement>(null);

  // Ribbon draw-in: paint the stroke once, right→left, when the section enters
  // view (see the path below). Reduced motion shows it fully drawn (the offset
  // formula resolves to 0), so the observer is skipped entirely.
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  // Fade the grid ONLY on an actual mode switch — the first render stays at full
  // opacity (SSR-safe, never stuck invisible).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Never render an empty section (the per-department fallback makes this rare).
  if (confiteria.length === 0 && papeleria.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      aria-label="Productos destacados"
      className="relative w-full overflow-hidden px-4 py-20 sm:px-6 sm:py-24 lg:px-8"
    >
      {/* Decorative wavy ribbon — behind everything, mode-tinted. Its box size is
          derived ONLY from the viewport (fixed band height, not a % of the
          section), so the SAME path renders IDENTICALLY in both modes — only the
          color differs. It paints itself right→left on scroll-in. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 flex items-center overflow-hidden"
      >
        <svg
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          className="-ml-[15%] h-[clamp(260px,42vw,560px)] w-[130%] shrink-0"
        >
          <path
            d={RIBBON_D}
            fill="none"
            strokeLinecap="round"
            strokeWidth={96}
            // Right→left paint: with pathLength normalized to 1 and a single
            // full-length dash, animating the offset from -1 → 0 reveals the
            // stroke growing from its END (x≈1540, right) back to its START
            // (x≈-80, left). The round cap reads as the brush tip.
            pathLength={1}
            strokeDasharray="1 1"
            className={cookie ? "stroke-green-tint" : "stroke-pink-tint"}
            style={{
              strokeDashoffset: reduce || drawn ? "0" : "-1",
              transition: reduce
                ? "none"
                : "stroke-dashoffset 1.4s ease-out, stroke 0.3s ease-out",
            }}
          />
        </svg>
      </div>

      <div className="relative z-10">
        {/* Eyebrow — two texts at opposite ends; stacks on mobile. */}
        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:gap-6">
          <span
            className="font-medium lowercase text-ink"
            style={{ fontSize: "clamp(18px, 2.2vw, 34px)" }}
          >
            explora y enamórate
          </span>
          <span
            className="font-medium lowercase text-ink"
            style={{ fontSize: "clamp(18px, 2.2vw, 34px)" }}
          >
            de nuestros productos
          </span>
        </div>

        {/* Giant mode-colored wordmark (flush left) + toggle (flush right) on ONE
            row across all desktop widths (lg+). The toggle keeps its size; the
            wordmark font yields so they always fit on one line. The desktop clamp
            reserves room for the fixed ~373px toggle + gap + padding:
            font ≈ (100vw − 64 − 373 − 32) / 7.075 ≈ 14.1vw − 73px, capped 170px.
            Mobile keeps the toggle below and the original size. */}
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <h2
            className={cn(
              "font-display whitespace-nowrap uppercase leading-[0.85] transition-colors duration-300 ease-out",
              "text-[length:clamp(52px,9vw,170px)] lg:text-[length:clamp(44px,calc(14.1vw_-_73px),170px)]",
              cookie ? "text-green" : "text-pink",
            )}
          >
            Destacados
          </h2>
          <ModeTabs mode={mode} setMode={setMode} />
        </div>

        {/* 4-per-row desktop (2 rows for 8), 3 tablet, 2 mobile; square cards.
            Keying by mode swaps the in-memory list and fades the new grid in. */}
        <motion.div
          key={mode}
          initial={mounted ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4"
        >
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Labeled mode toggle: a white rounded-full pill with a thin dark outline and two
 * options (icon + sentence-case label, regular weight — same treatment as the
 * site nav). The active option is filled in the SOLID brand color with the
 * LIGHTEST tint for its text + icon — confitería #96CA6F with #F4FFE9 (green-pale);
 * papelería #DD7AA5 with #FFD9EB (pink-tint). Inactive is muted grey. The fill
 * crossfades (~250ms). Drives the shared hero mode (aria-pressed intact).
 *
 * SIZE: mobile is compact (unchanged); on desktop (lg+) the pill grows taller
 * with larger padding, icons and text so it reads as a peer of the giant
 * wordmark.
 */
function ModeTabs({
  mode,
  setMode,
}: {
  mode: HeroMode;
  setMode: (m: HeroMode) => void;
}) {
  const tab = (active: boolean, activeClasses: string) =>
    cn(
      "is-round inline-flex items-center gap-2 px-4 py-2.5 text-xs transition-colors duration-[250ms] ease-out sm:px-5 sm:text-sm lg:gap-3 lg:px-7 lg:py-4 lg:text-lg",
      active ? activeClasses : "text-neutral-400 hover:text-neutral-600",
    );

  return (
    <div className="is-round inline-flex shrink-0 items-center gap-1 self-start bg-white p-1 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.35)] ring-1 ring-ink/15 lg:gap-2 lg:self-auto lg:p-1.5">
      <button
        type="button"
        aria-pressed={mode === "cookie"}
        onClick={() => setMode("cookie")}
        className={tab(mode === "cookie", "bg-green text-green-pale")}
      >
        <Cookie className="h-5 w-5 lg:h-7 lg:w-7" />
        Confitería
      </button>
      <button
        type="button"
        aria-pressed={mode === "pencil"}
        onClick={() => setMode("pencil")}
        className={tab(mode === "pencil", "bg-pink text-pink-tint")}
      >
        <Pencil className="h-5 w-5 lg:h-7 lg:w-7" />
        Papelería
      </button>
    </div>
  );
}
