import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findCategory, findSubcategory } from "@/config/navigation";
import {
  getAllProducts,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/catalog";
import { getProductVariants, getFlavorLabels } from "@/lib/productVariants";
import { ProductStage } from "@/components/product/ProductStage";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = { slug: string };

/** Pre-render every product page. */
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  // Breadcrumb: resolve the nearest category/subcategory labels from the nav.
  const category = findCategory(product.department, product.category);
  const subcategory = product.subcategory
    ? findSubcategory(product.department, product.category, product.subcategory)
    : null;
  const backNode = subcategory ?? category;

  // Flavor variants are discovered from the photo files (main + any
  // <code>-<flavor>.<ext>), server-side, and passed to the client gallery.
  const variants = await getProductVariants(product.department, product.code);

  // Related showcase — computed SERVER-side (order baked per ISR generation).
  // Same-category first, topped up from the department; sellable items only.
  const related = await getRelatedProducts(product);
  // Variant chips for the related cards (same source the category grid uses).
  const relatedFlavorLabels: Record<string, string[]> = {};
  for (const p of related) {
    const labels = await getFlavorLabels(p.department, p.code);
    if (labels.length > 0) relatedFlavorLabels[p.slug] = labels;
  }

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Ruta de navegación" className="mb-6">
          {backNode ? (
            <Link
              href={backNode.href}
              className="font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
            >
              ← {backNode.label}
            </Link>
          ) : (
            <Link
              href="/"
              className="font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
            >
              ← Inicio
            </Link>
          )}
        </nav>

        {/* Large image (left) + info/purchase with flavor thumbnails (right). */}
        <ProductStage product={product} variants={variants} />
      </div>

      {/* Related products — full-width, above the footer. Omitted entirely when
          there are no sellable candidates (no empty heading). Reuses the exact
          category grid + card so chips / tiers / Agregar all work as-is. */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="w-full border-t border-line px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
        >
          <h2
            id="related-heading"
            className="font-display mb-8 text-2xl text-ink sm:text-3xl"
          >
            También te podría gustar
          </h2>
          <ProductGrid products={related} flavorLabelsBySlug={relatedFlavorLabels} />
        </section>
      )}
    </>
  );
}
