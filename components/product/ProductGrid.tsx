import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types/product";

/**
 * Responsive product grid: 2 columns on mobile, 3 on small desktops, 4 on
 * large screens, with generous gaps on the white page background.
 * Renders a friendly empty state when there are no products.
 */
export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl bg-green-tint/40 px-6 py-16 text-center">
        <p className="text-base text-ink">Pronto agregaremos productos aquí</p>
        <p className="mt-1 font-meta text-sm text-ink-soft">
          Estamos surtiendo esta sección. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.code} product={product} />
      ))}
    </div>
  );
}
