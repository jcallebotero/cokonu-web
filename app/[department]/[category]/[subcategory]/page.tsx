import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  departments,
  findCategory,
  findSubcategory,
} from "@/config/navigation";
import { getProductsBySubcategory } from "@/lib/catalog";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = {
  department: string;
  category: string;
  subcategory: string;
};

/** Pre-render the known department/category/subcategory triples. */
export function generateStaticParams() {
  return departments.flatMap((d) =>
    (d.children ?? []).flatMap((c) =>
      (c.children ?? []).map((s) => ({
        department: d.slug,
        category: c.slug,
        subcategory: s.slug,
      })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { department, category, subcategory } = await params;
  const sub = findSubcategory(department, category, subcategory);
  return { title: sub?.label ?? "Subcategoría" };
}

export default async function SubcategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { department, category, subcategory } = await params;
  const sub = findSubcategory(department, category, subcategory);
  if (!sub) notFound();

  const cat = findCategory(department, category);
  const products = await getProductsBySubcategory(
    department,
    category,
    subcategory,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <nav aria-label="Ruta de navegación" className="mb-4">
        <Link
          href={cat?.href ?? `/${department}/${category}`}
          className="font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
        >
          ← {cat?.label ?? "Categoría"}
        </Link>
      </nav>

      <PageHeading title={sub.label} />
      <ProductGrid products={products} />
    </div>
  );
}
