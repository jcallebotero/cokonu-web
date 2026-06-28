"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { cn } from "@/lib/cn";
import type { NavNode } from "@/config/navigation";
import type { Product } from "@/types/product";

/**
 * Category view with subcategory filter chips (e.g. for "Confites").
 * Clicking a chip filters the grid in place; "Todos" shows everything.
 * Pure client-side filtering over the products passed in by the server page.
 */
export function SubcategoryFilter({
  products,
  subcategories,
}: {
  products: Product[];
  subcategories: NavNode[];
}) {
  const [active, setActive] = useState<string | null>(null); // null = "Todos"

  const filtered =
    active === null
      ? products
      : products.filter((p) => p.subcategory === active);

  const chip = (selected: boolean) =>
    cn(
      "rounded-full px-4 py-1.5 text-sm transition-colors",
      selected
        ? "bg-ink text-surface"
        : "bg-green-tint/50 text-ink hover:bg-green-tint",
    );

  return (
    <div>
      <div
        role="group"
        aria-label="Filtrar por subcategoría"
        className="mb-8 flex flex-wrap gap-2"
      >
        <button
          type="button"
          onClick={() => setActive(null)}
          aria-pressed={active === null}
          className={chip(active === null)}
        >
          Todos
        </button>
        {subcategories.map((sub) => (
          <button
            key={sub.slug}
            type="button"
            onClick={() => setActive(sub.slug)}
            aria-pressed={active === sub.slug}
            className={chip(active === sub.slug)}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <ProductGrid products={filtered} />
    </div>
  );
}
