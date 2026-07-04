import type { Product } from "@/types/product";

/**
 * Accent-fold + lowercase a string for case- and accent-insensitive matching.
 * e.g. "Galletería" → "galleteria".
 */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .trim();
}

/**
 * Filter products by a query — the SINGLE source of truth for both the live
 * search dropdown and the /buscar results page.
 *
 * Matches against product NAME + CATEGORY + SUBCATEGORY (case- and
 * accent-insensitive substring). Presentation is intentionally NOT matched.
 * An empty/whitespace query returns no results.
 */
export function searchProducts(products: Product[], query: string): Product[] {
  const needle = normalizeText(query);
  if (!needle) return [];
  return products.filter((p) => {
    const haystack = normalizeText(
      `${p.name} ${p.category} ${p.subcategory ?? ""}`,
    );
    return haystack.includes(needle);
  });
}
