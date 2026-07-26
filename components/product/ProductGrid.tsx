import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

/**
 * Responsive product grid: 2 columns on mobile up to 5 on wide desktops, with
 * generous gaps on the white page background. Renders a friendly empty state
 * when there are no products.
 *
 * `flavorLabelsBySlug` (optional): a slug → flavor-label[] map so each card can
 * show its variant chips. Only the category page provides it; other callers
 * (home/search/department) omit it → no chips.
 */
export function ProductGrid({
  products,
  flavorLabelsBySlug,
  allowPriority = true,
}: {
  products: Product[];
  flavorLabelsBySlug?: Record<string, string[]>;
  // Whether this grid's first card may carry the LCP `priority` hint. Defaults
  // true (single-grid pages: category / subcategory / search / home). The
  // department landing page renders one grid PER category section and passes
  // false for every section after the first, so the page keeps exactly ONE
  // priority image instead of eagerly loading below-the-fold sections.
  allowPriority?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="bg-green-tint/40 px-6 py-16 text-center">
        <p className="text-base text-ink">Pronto agregaremos productos aquí</p>
        <p className="mt-1 font-meta text-sm text-ink-soft">
          Estamos surtiendo esta sección. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((product, index) => (
        // Slug is unique across the whole catalog (department + code identity).
        <ProductCard
          key={product.slug}
          product={product}
          flavorLabels={flavorLabelsBySlug?.[product.slug]}
          // Only the first card is the above-the-fold LCP → priority; the rest
          // stay lazy (ProductImage's default). Suppressed entirely when the
          // caller opts out (allowPriority=false).
          priority={allowPriority && index === 0}
        />
      ))}
    </div>
  );
}
