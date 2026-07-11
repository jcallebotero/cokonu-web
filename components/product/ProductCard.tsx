"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ProductImage } from "@/components/product/ProductImage";
import { formatCOP } from "@/lib/money";
import { basePrice, priceTierHints } from "@/lib/pricing";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

/**
 * Product card for the catalog grid.
 *
 * - The whole card links to /producto/[slug] via a "stretched link" (the
 *   Link's ::after covers the card), so the Agregar button can live in the
 *   same card WITHOUT being nested inside the anchor (valid, accessible HTML).
 * - Out of stock: an "Agotado" overlay + a disabled button; the card still
 *   links to the product page.
 * - `flavorLabels` (optional): subtle, non-clickable indicator chips for the
 *   product's photo-derived flavor variants. Only the category page passes them;
 *   an empty/absent list renders no chips (unchanged card).
 */
export function ProductCard({
  product,
  flavorLabels,
}: {
  product: Product;
  flavorLabels?: string[];
}) {
  const { addItem } = useCart();
  // Up to 4 flavor chips in a single row; a "+N" chip stands in for the rest.
  const shownFlavors = flavorLabels?.slice(0, 4) ?? [];
  const extraFlavors = (flavorLabels?.length ?? 0) - shownFlavors.length;
  // Null stock = unknown inventory → always available, never "Agotado".
  const outOfStock = product.stock !== null && product.stock <= 0;
  // Card shows the single-unit (qty 1) price; null = quote by WhatsApp.
  const unitPrice = basePrice(product);
  // First cheaper volume tier, if any, for the subtle "Desde N" hint.
  const nextTier = priceTierHints(product)[0];

  return (
    <article className="group relative flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-surface ring-1 ring-line/60">
        <ProductImage
          src={product.imageSrc}
          alt={product.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/55">
            <span className="bg-bg-soft px-3 py-1 text-xs font-medium uppercase tracking-wide text-green-dark ring-1 ring-green-dark/20">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="text-sm text-ink">
          {/* Stretched link: covers the whole card for navigation. */}
          <Link
            href={`/producto/${product.slug}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        {product.presentation && (
          <p className="mt-0.5 font-meta text-xs text-ink-soft">
            {product.presentation}
          </p>
        )}

        <div className="mt-2 flex items-end justify-between gap-2">
          {unitPrice !== null ? (
            <span className="flex flex-col">
              <span className="text-sm font-medium text-ink">
                {formatCOP(unitPrice)}
              </span>
              {/* Subtle next-tier hint, e.g. "Desde 6: $34.000". */}
              {nextTier && (
                <span className="font-meta text-xs text-green-dark">
                  Desde {nextTier.minQty}: {formatCOP(nextTier.price)}
                </span>
              )}
            </span>
          ) : (
            <span className="font-meta text-xs text-ink-soft">
              Consultar por WhatsApp
            </span>
          )}

          {/* z-10 lifts the button above the stretched link's ::after. */}
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => addItem(product, 1)}
            aria-label={
              outOfStock
                ? `${product.name} agotado`
                : `Agregar ${product.name} al carrito`
            }
            className={cn(
              "relative z-10 px-3 py-1.5 text-xs font-medium transition-all duration-200",
              outOfStock
                ? "cursor-not-allowed bg-bg-soft text-green-dark"
                : "bg-green text-green-deep hover:scale-[1.04] hover:bg-pink hover:text-pink-tint",
            )}
          >
            {outOfStock ? "Agotado" : "Agregar"}
          </button>
        </div>

        {/* Flavor indicator chips — subtle, square, NOT clickable. One row; up
            to 4 labels + a "+N" chip for the rest. Absent when no flavors. */}
        {shownFlavors.length > 0 && (
          <div className="mt-2 flex gap-1 overflow-hidden">
            {shownFlavors.map((label) => (
              <span
                key={label}
                className="shrink-0 whitespace-nowrap bg-green-tint px-1.5 py-0.5 text-[11px] leading-tight text-green-deep"
              >
                {label}
              </span>
            ))}
            {extraFlavors > 0 && (
              <span className="shrink-0 whitespace-nowrap bg-green-tint px-1.5 py-0.5 text-[11px] leading-tight text-green-deep">
                +{extraFlavors}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
