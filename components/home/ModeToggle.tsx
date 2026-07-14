"use client";

import { Cookie, Pencil } from "lucide-react";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { cn } from "@/lib/cn";

/**
 * Bottom-right cookie/pencil toggle (voldog-style): a white rounded-full pill
 * with two icon buttons, sized as a PEER to the bottom-left CTA pill — same
 * height (matching vertical padding `py-1.5 lg:py-[18px]` + circle size
 * `h-7 lg:h-12`), same shadow, comparable weight. The active icon sits in a
 * mode-tinted circle; the inactive is muted grey with no fill. Switching flips
 * the whole hero (panel bg, wordmark, chips, CTA) via the shared HeroMode
 * context. Part of the ACT 4 bottom-group cascade (data-cascade). Both bottom
 * pills scale down together on mobile so they fit without overlapping.
 */
export function ModeToggle() {
  const { mode, setMode } = useHeroMode();

  return (
    <div
      data-cascade
      className="is-round absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1 bg-white px-1.5 py-1.5 shadow-[0_12px_34px_-12px_rgba(0,0,0,0.45)] lg:bottom-6 lg:right-6 lg:gap-2 lg:px-2.5 lg:py-[18px]"
    >
      <button
        type="button"
        aria-label="Confitería"
        aria-pressed={mode === "cookie"}
        onClick={() => setMode("cookie")}
        className={cn(
          "is-round flex h-7 w-7 items-center justify-center transition-colors duration-300 ease-out lg:h-12 lg:w-12",
          mode === "cookie"
            ? "bg-green-tint text-green-deep"
            : "text-neutral-400 hover:text-neutral-500",
        )}
      >
        <Cookie className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
      <button
        type="button"
        aria-label="Papelería"
        aria-pressed={mode === "pencil"}
        onClick={() => setMode("pencil")}
        className={cn(
          "is-round flex h-7 w-7 items-center justify-center transition-colors duration-300 ease-out lg:h-12 lg:w-12",
          mode === "pencil"
            ? "bg-pink-tint text-pink-dark"
            : "text-neutral-400 hover:text-neutral-500",
        )}
      >
        <Pencil className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
    </div>
  );
}
