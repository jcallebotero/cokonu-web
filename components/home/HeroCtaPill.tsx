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
      className="group is-round absolute bottom-3.5 left-3.5 z-20 inline-flex items-center gap-2 bg-white py-1.5 pl-3.5 pr-1.5 text-xs font-medium text-ink shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] transition-transform duration-200 hover:scale-[1.03] sm:gap-3 sm:py-2 sm:pl-5 sm:text-base lg:bottom-6 lg:left-6"
    >
      {/* Fixed-ish text slot; the label fades in when the mode flips. */}
      <span className="block whitespace-nowrap">
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
          "is-round flex h-7 w-7 items-center justify-center transition-colors duration-[400ms] ease-out sm:h-9 sm:w-9",
          cookie ? "bg-green-tint" : "bg-pink-tint",
        )}
      >
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5",
            cookie ? "text-green-deep" : "text-pink-dark",
          )}
        />
      </span>
    </Link>
  );
}
