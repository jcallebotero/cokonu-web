import Link from "next/link";
import { departments } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { getFeaturedProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";

/**
 * Home page: hero + a "Destacados" grid of featured products read through the
 * catalog data-access layer.
 */
export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className="bg-bg">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <p className="font-meta text-sm uppercase tracking-[0.2em] text-green-dark">
            {siteConfig.location}
          </p>
          <h1 className="font-display mt-4 text-4xl text-ink sm:text-6xl">
            Dulces, mecatos y papelería
            <br className="hidden sm:block" /> con sabor a {siteConfig.name}.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-ink-soft">
            {siteConfig.tagline}. Pronto podrás armar tu pedido y cotizarlo por
            WhatsApp en segundos.
          </p>

          {/* Quick links into the two departments */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {departments.map((dept, i) => (
              <Link key={dept.slug} href={dept.href}>
                <Button variant={i === 0 ? "primary" : "outline"} size="lg">
                  Ver {dept.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Placeholder banner block */}
      <section className="mx-auto max-w-6xl px-6">
        <div className="flex min-h-64 items-center justify-center rounded-2xl bg-green-tint px-6 py-16 text-center">
          <div>
            <h2 className="font-display text-2xl text-ink sm:text-3xl">
              Banner destacado
            </h2>
            <p className="mx-auto mt-3 max-w-md font-meta text-sm text-ink-soft">
              Espacio reservado para promociones y lanzamientos. El contenido
              real llega en la siguiente fase.
            </p>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section
        aria-label="Productos destacados"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
      >
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">
            Destacados
          </h2>
        </div>
        <ProductGrid products={featured} />
      </section>
    </>
  );
}
