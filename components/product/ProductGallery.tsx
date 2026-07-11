"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { cn } from "@/lib/cn";
import type { ProductVariant } from "@/lib/productVariants";

/**
 * Product-page gallery: a large main image with a horizontal strip of SQUARE
 * thumbnails below it (mobile + desktop). The variants are discovered
 * server-side (lib/productVariants.ts) and passed in as a prop — no `fs` here.
 *
 *  - Thumbnails = [main (if present), ...flavors]; the main photo is the first
 *    selectable thumbnail. Clicking one swaps the large image (client state).
 *  - The active thumbnail has a brand-green (#429600 = green-dark) border.
 *  - Flavor names never show permanently: a thumbnail reveals its label on
 *    HOVER; selecting a flavor shows its label as a caption near the large
 *    image. The main photo has no label (the product H1 already names it).
 *  - One image total (just main, or just one flavor) → NO strip, single image.
 *  - No photos → the coconut placeholder (via <ProductImage> with no src).
 *  - Main missing but flavors exist → the large image defaults to the first
 *    flavor (variants[0]).
 *
 * Corners stay square (site-wide rule); thumbnails + active border are rectangular.
 */
export function ProductGallery({
  variants,
  alt,
}: {
  variants: ProductVariant[];
  alt: string;
}) {
  const [selected, setSelected] = useState(0);
  const active = variants[selected] ?? null;
  const showStrip = variants.length > 1;

  return (
    <div>
      {/* Large main image */}
      <div className="relative aspect-square overflow-hidden bg-surface ring-1 ring-line/60">
        <ProductImage
          // Key by src so the onError "failed" state resets when the image swaps.
          key={active?.src ?? "placeholder"}
          src={active?.src}
          alt={alt}
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        {/* Caption near the large image — only when a FLAVOR is selected. */}
        {showStrip && active?.label && (
          <span className="absolute bottom-3 left-3 bg-surface/90 px-2.5 py-1 text-xs font-medium text-green-deep ring-1 ring-line/60">
            {active.label}
          </span>
        )}
      </div>

      {/* Thumbnail strip — only when there is more than one image. */}
      {showStrip && (
        <ul className="mt-3 flex gap-3 overflow-x-auto">
          {variants.map((variant, i) => (
            <li key={variant.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-label={variant.label ?? "Foto principal"}
                aria-pressed={i === selected}
                className={cn(
                  "group relative block aspect-square w-20 overflow-hidden bg-surface ring-1 transition-[box-shadow]",
                  i === selected
                    ? "ring-2 ring-green-dark"
                    : "ring-line/60 hover:ring-green",
                )}
              >
                <ProductImage src={variant.src} alt={variant.label ?? alt} sizes="80px" />
                {/* Label revealed on hover only (never permanent). Main = no label. */}
                {variant.label && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-green-deep/85 px-1 py-0.5 text-center text-[10px] font-medium leading-tight text-surface opacity-0 transition-opacity group-hover:opacity-100">
                    {variant.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
