import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { departments, findDepartment } from "@/config/navigation";
import {
  getProductsByDepartment,
  getProductsByCategory,
} from "@/lib/catalog";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

type Params = { department: string };

/** Pre-render the known departments. */
export function generateStaticParams() {
  return departments.map((d) => ({ department: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { department } = await params;
  const dept = findDepartment(department);
  return { title: dept?.label ?? "Departamento" };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { department } = await params;
  const dept = findDepartment(department);
  if (!dept) notFound();

  const all = await getProductsByDepartment(department);

  // One section per category, each with its products. The heading links to
  // the dedicated category page.
  const sections = await Promise.all(
    (dept.children ?? []).map(async (cat) => ({
      category: cat,
      products: await getProductsByCategory(department, cat.slug),
    })),
  );

  return (
    <div className="w-full px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
      <PageHeading
        title={dept.label}
        subtitle={`Explora todo nuestro surtido de ${dept.label.toLowerCase()}.`}
      />

      {all.length === 0 ? (
        // Whole department empty → friendly empty state.
        <ProductGrid products={[]} />
      ) : (
        <div className="space-y-14">
          {/* Only render categories that currently have products; empty
              categories are reachable via the menu and show their own empty
              state on the dedicated category page. */}
          {sections
            .filter(({ products }) => products.length > 0)
            .map(({ category, products }, index) => (
            <section key={category.slug}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-xl text-ink sm:text-2xl">
                  <Link
                    href={category.href}
                    className="transition-colors hover:text-green-dark"
                  >
                    {category.label}
                  </Link>
                </h2>
                <Link
                  href={category.href}
                  className="shrink-0 font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
                >
                  Ver todo
                </Link>
              </div>
              {/* Only the first (above-the-fold) section prioritizes its LCP
                  image; later sections render no priority image, so we don't
                  eagerly download sections the visitor may never scroll to. */}
              <ProductGrid products={products} allowPriority={index === 0} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
