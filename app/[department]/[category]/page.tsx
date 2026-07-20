import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { departments, findCategory } from "@/config/navigation";
import { getProductsByCategory } from "@/lib/catalog";
import { getFlavorLabels } from "@/lib/productVariants";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SubcategoryFilter } from "@/components/product/SubcategoryFilter";

type Params = { department: string; category: string };

/** Pre-render the known department/category pairs. */
export function generateStaticParams() {
  return departments.flatMap((d) =>
    (d.children ?? []).map((c) => ({
      department: d.slug,
      category: c.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { department, category } = await params;
  const cat = findCategory(department, category);
  return { title: cat?.label ?? "Categoría" };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { department, category } = await params;
  const cat = findCategory(department, category);
  if (!cat) notFound();

  const products = await getProductsByCategory(department, category);
  const subcategories = cat.children ?? [];

  // Discover flavor variants from the photo files (main + <code>-<flavor>.<ext>)
  // for this category's products. The department directory is read ONCE
  // (memoized in lib/productVariants.ts) and filtered per code in memory — not
  // one readdir per card. Only products WITH flavors get an entry → chips.
  const flavorLabelsBySlug: Record<string, string[]> = {};
  for (const p of products) {
    const labels = getFlavorLabels(p.department, p.code);
    if (labels.length > 0) flavorLabelsBySlug[p.slug] = labels;
  }

  return (
    <div className="w-full px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      {/* Breadcrumb to the parent department */}
      <nav aria-label="Ruta de navegación" className="mb-4">
        <Link
          href={`/${department}`}
          className="font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
        >
          ← {findDepartmentLabel(department)}
        </Link>
      </nav>

      <PageHeading title={cat.label} />

      {subcategories.length > 0 ? (
        <SubcategoryFilter
          products={products}
          subcategories={subcategories}
          flavorLabelsBySlug={flavorLabelsBySlug}
        />
      ) : (
        <ProductGrid products={products} flavorLabelsBySlug={flavorLabelsBySlug} />
      )}
    </div>
  );
}

/** Small local helper to label the breadcrumb from the nav tree. */
function findDepartmentLabel(slug: string): string {
  return departments.find((d) => d.slug === slug)?.label ?? "Inicio";
}
