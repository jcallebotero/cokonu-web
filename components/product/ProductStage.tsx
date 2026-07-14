"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import type { Product } from "@/types/product";
import type { ProductVariant } from "@/lib/productVariants";

/**
 * Product detail "stage" — owns the two-column layout AND the shared gallery
 * selection so the large image (left) and the flavor thumbnails (which now live
 * in the right info column, inside <ProductPurchase> between the tier table and
 * the Agregar button) stay in sync.
 *
 *  - Left: the large image for the currently selected variant, with the flavor
 *    name shown as a caption only while a flavor is selected.
 *  - Right: name, presentation, purchase controls (price / tiers / thumbnails /
 *    quantity + add), and description.
 *  - Clicking a thumbnail swaps the large image; the selected flavor is carried
 *    into the cart line on add (handled in <ProductPurchase>).
 *
 * Variants come from server-side discovery (lib/productVariants.ts); no `fs`
 * here. Photoless → placeholder, no thumbnails. One image → no thumbnails.
 */
export function ProductStage({
  product,
  variants,
}: {
  product: Product;
  variants: ProductVariant[];
}) {
  // Main is variants[0]; if the main photo is missing, variants[0] is the first
  // flavor, so the large image still defaults sensibly.
  const [selected, setSelected] = useState(0);
  const active = variants[selected] ?? null;
  const hasFlavors = variants.length > 1;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* Left: large image */}
      <div>
        <div className="relative aspect-square overflow-hidden bg-surface ring-1 ring-line/60">
          <ProductImage
            // Key by src so the onError "failed" state resets when the image swaps.
            key={active?.src ?? "placeholder"}
            src={active?.src}
            alt={product.name}
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          {/* Caption — only when a FLAVOR is selected (main has no label). */}
          {hasFlavors && active?.label && (
            <span className="absolute bottom-3 left-3 bg-surface/90 px-2.5 py-1 text-xs font-medium text-green-deep ring-1 ring-line/60">
              {active.label}
            </span>
          )}
        </div>
      </div>

      {/* Right: info + purchase (thumbnails live inside ProductPurchase) */}
      <div>
        <h1 className="font-display text-3xl text-ink sm:text-4xl">
          {product.name}
        </h1>
        {product.presentation && (
          <p className="mt-2 font-meta text-sm text-ink-soft">
            {product.presentation}
          </p>
        )}

        <div className="mt-6">
          <ProductPurchase
            product={product}
            variants={variants}
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        {product.description && (
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-sm font-medium text-ink">Descripción</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
