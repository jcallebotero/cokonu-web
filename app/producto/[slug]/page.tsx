import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { findCategory, findSubcategory } from "@/config/navigation";
import { getAllProducts, getProductBySlug } from "@/lib/catalog";
import { getProductVariants } from "@/lib/productVariants";
import { ProductGallery } from "@/components/product/ProductGallery";
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

  // Flavor variants are discovered from the photo files (main + any
  // <code>-<flavor>.<ext>), server-side, and passed to the client gallery.
  const variants = getProductVariants(product.department, product.code);

  return (
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

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery — large image + flavor thumbnail strip (client). */}
        <div>
          <ProductGallery variants={variants} alt={product.name} />
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
