"use client";

import { Cookie, Pencil } from "lucide-react";
import { useHeroMode } from "@/components/home/HeroModeContext";
import { cn } from "@/lib/cn";

/**
 * Bottom-right cookie/pencil toggle (voldog-style): white rounded-full pill with
 * two icon buttons. The active one sits in a mode-tinted circle; the inactive is
 * muted grey with no fill. Switching flips the whole hero (panel bg, wordmark,
 * chips, CTA) via the shared HeroMode context. Part of the ACT 4 bottom-group
 * cascade (data-cascade).
 */
export function ModeToggle() {
  const { mode, setMode } = useHeroMode();

  return (
    <div
      data-cascade
      className="is-round absolute bottom-3.5 right-3.5 z-20 flex items-center gap-1 bg-white p-1 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.4)] sm:p-1.5 lg:bottom-6 lg:right-6"
    >
      <button
        type="button"
        aria-label="Confitería"
        aria-pressed={mode === "cookie"}
        onClick={() => setMode("cookie")}
        className={cn(
          "is-round flex h-8 w-8 items-center justify-center transition-colors duration-300 ease-out sm:h-10 sm:w-10",
          mode === "cookie"
            ? "bg-green-tint text-green-deep"
            : "text-neutral-400 hover:text-neutral-500",
        )}
      >
        <Cookie className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Papelería"
        aria-pressed={mode === "pencil"}
        onClick={() => setMode("pencil")}
        className={cn(
          "is-round flex h-8 w-8 items-center justify-center transition-colors duration-300 ease-out sm:h-10 sm:w-10",
          mode === "pencil"
            ? "bg-pink-tint text-pink-dark"
            : "text-neutral-400 hover:text-neutral-500",
        )}
      >
        <Pencil className="h-5 w-5" />
      </button>
    </div>
  );
}
