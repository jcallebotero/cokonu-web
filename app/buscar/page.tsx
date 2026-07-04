import Link from "next/link";
import type { Metadata } from "next";
import { searchCatalog } from "@/lib/catalog";
import { PageHeading } from "@/components/layout/PageHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim();
  return { title: keyword ? `Búsqueda: ${keyword}` : "Búsqueda" };
}

/**
 * Full search results page. Reuses the exact category-listing layout (breadcrumb
 * + PageHeading + full-width ProductGrid) and the shared searchCatalog() matcher
 * (name + category + subcategory) so it's identical to the header dropdown.
 */
export default async function BuscarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { q } = await searchParams;
  const keyword = (q ?? "").trim();

  const containerClass =
    "w-full px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8";

  // No keyword → friendly prompt back home.
  if (!keyword) {
    return (
      <div className={containerClass}>
        <PageHeading
          title="Búsqueda"
          subtitle="Escribe una palabra en el buscador para encontrar productos."
        />
        <Link
          href="/"
          className="text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-green-dark hover:decoration-green-dark"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  const results = await searchCatalog(keyword);

  return (
    <div className={containerClass}>
      {/* Breadcrumb — same composition as the category pages. */}
      <nav aria-label="Ruta de navegación" className="mb-4">
        <Link
          href="/"
          className="font-meta text-sm text-ink-soft transition-colors hover:text-green-dark"
        >
          ← Inicio
        </Link>
      </nav>

      <PageHeading
        title="Búsqueda"
        subtitle={`${results.length} resultados para “${keyword}”`}
      />

      {results.length > 0 ? (
        <ProductGrid products={results} />
      ) : (
        <p className="font-meta text-sm text-ink-soft">
          No encontramos productos para “{keyword}”. Intenta con otra palabra.
        </p>
      )}
    </div>
  );
}
