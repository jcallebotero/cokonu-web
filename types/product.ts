/**
 * Product domain model.
 *
 * Designed to be forward-compatible with a future Google Sheets source: each
 * field maps to a column, so swapping the mock array (data/products.ts) for a
 * fetched Sheets JSON only touches the data-access layer (lib/catalog.ts).
 */

/** Department slugs — must match the top-level slugs in config/navigation.ts. */
export type DepartmentSlug = "confiteria" | "papeleria";

export interface Product {
  /** SKU from the legacy system; the join key. Unique. */
  code: string;
  /** URL-safe id, used at /producto/[slug]. Unique. */
  slug: string;
  /** Display name (es-CO). */
  name: string;
  /** Department slug (matches config/navigation.ts). */
  department: DepartmentSlug;
  /** Category slug (matches config/navigation.ts), e.g. "confites". */
  category: string;
  /** Subcategory slug (e.g. "gomas") or null when the category has none. */
  subcategory: string | null;
  /** Price in COP, integer pesos (no decimals). */
  price: number;
  /** Available quantity; 0 means out of stock. */
  stock: number;
  /** Image path under /public, e.g. "/products/gomas-trolli.jpg". */
  image: string;
  /** Presentation, e.g. "Bolsa 100 g", "Unidad", "Paquete x 18". */
  presentation: string | null;
  /** Longer description (es-CO) or null. */
  description: string | null;
  /** Whether the product is featured on the home / highlights. */
  featured: boolean;
}
