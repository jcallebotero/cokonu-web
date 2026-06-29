import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findCategory, findSubcategory } from "@/config/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/catalog";
import { ProductImage } from "@/components/product/ProductImage";
import { ProductPurchase } from "@/components/product/ProductPurchase";

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

  // Gallery is structured to support multiple images later; one for now.
  // Images are derived from the product code (lib/productImage.ts).
  const imageCodes = [product.code];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
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

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface ring-1 ring-line/60">
            <ProductImage
              code={imageCodes[0]}
              alt={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {/* Thumbnail strip — rendered only when there are multiple images. */}
          {imageCodes.length > 1 && (
            <ul className="mt-3 flex gap-3">
              {imageCodes.map((c, i) => (
                <li
                  key={c}
                  className="relative aspect-square w-20 overflow-hidden rounded-lg bg-surface ring-1 ring-line/60"
                >
                  <ProductImage code={c} alt={`${product.name} ${i + 1}`} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info */}
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
            <ProductPurchase product={product} />
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
    </div>
  );
}
