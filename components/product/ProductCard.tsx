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
 */
export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
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
          department={product.department}
          code={product.code}
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
      </div>
    </article>
  );
}
