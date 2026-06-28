"use client";

import { cn } from "@/lib/cn";

/**
 * Accessible quantity stepper. Clamped to [min, max]; buttons disable at the
 * bounds. Used on the product detail page and in the cart drawer.
 */
export function QuantityStepper({
  value,
  min = 1,
  max,
  onChange,
  size = "md",
  label = "Cantidad",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (next: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  const dims = size === "sm" ? "h-8" : "h-11";
  const btn =
    size === "sm" ? "w-8 text-base" : "w-11 text-lg";
  const num = size === "sm" ? "w-8 text-sm" : "w-10 text-base";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-line",
        dims,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
        className={cn(
          "flex h-full items-center justify-center rounded-l-lg text-ink transition-colors hover:bg-green-tint disabled:cursor-not-allowed disabled:opacity-40",
          btn,
        )}
      >
        −
      </button>
      <span
        aria-live="polite"
        className={cn("text-center tabular-nums", num)}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className={cn(
          "flex h-full items-center justify-center rounded-r-lg text-ink transition-colors hover:bg-green-tint disabled:cursor-not-allowed disabled:opacity-40",
          btn,
        )}
      >
        +
      </button>
    </div>
  );
}
