"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { cn } from "@/lib/cn";

/**
 * Bottom-left CTA pill (voldog-style): white rounded-full pill with the mode's
 * catalog label + a tinted circle holding an arrow. Routes and colors follow
 * the hero mode; the label quick-fades on mode change. Part of the ACT 4
 * bottom-group cascade (data-cascade).
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
      className="group is-round absolute bottom-3.5 left-3.5 z-20 inline-flex items-center gap-1.5 bg-white py-1.5 pl-3 pr-1 text-[15px] font-medium text-ink shadow-[0_12px_34px_-12px_rgba(0,0,0,0.45)] transition-transform duration-200 hover:scale-[1.03] lg:bottom-6 lg:left-6 lg:gap-4 lg:py-[18px] lg:pl-8 lg:pr-2.5 lg:text-lg"
    >
      {/* Label fades in on mode change. Wraps to two lines on mobile so the
          pill stays clear of the toggle on narrow screens; one line on desktop. */}
      <span className="block max-w-[7rem] whitespace-normal leading-[1.15] lg:max-w-none lg:whitespace-nowrap">
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
          "is-round flex h-7 w-7 items-center justify-center transition-colors duration-[400ms] ease-out lg:h-12 lg:w-12",
          cookie ? "bg-green-tint" : "bg-pink-tint",
        )}
      >
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 lg:h-5 lg:w-5",
            cookie ? "text-green-deep" : "text-pink-dark",
          )}
        />
      </span>
    </Link>
  );
}
