/**
 * Product domain model.
 *
 * Fed from the live Google Sheets JSON via the data-access layer
 * (lib/catalog.ts). Each field maps to a sheet column; pricing is volume-based
 * across three tiers (see lib/pricing.ts).
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
  /**
   * Volume price tiers in COP (integer pesos), any may be null:
   *   - price1: best/lowest price (highest quantity tier, 11+)
   *   - price2: mid tier (6–10)
   *   - price3: single-unit / base price (1–5)
   * Read these through lib/pricing.ts (unitPriceForQty / basePrice) rather than
   * directly. If all three are null the product is "quote by WhatsApp".
   */
  price1: number | null;
  price2: number | null;
  price3: number | null;
  /**
   * Available quantity (0 = out of stock), or null when inventory is unknown.
   * Null stock → treated as available with no quantity cap and never "Agotado".
   */
  stock: number | null;
  /**
   * Fully-resolved product image URL, computed SERVER-SIDE in lib/catalog.ts via
   * lib/productImage.ts (`productImageSrc`). Carries an mtime cache-buster
   * (`?v=<mtimeMs>`) so a replaced photo busts the browser cache; a product with
   * no photo yet gets the plain path (no `?v`) and falls back to the placeholder.
   * Passed to the client <ProductImage> as its `src` prop — never recomputed on
   * the client (that would need `fs`).
   */
  imageSrc: string;
  /**
   * @deprecated Images are derived from `code` via lib/productImage.ts.
   * Kept optional and unused for backward compatibility / future overrides.
   */
  image?: string;
  /** Presentation, e.g. "Bolsa 100 g", "Unidad", "Paquete x 18". */
  presentation: string | null;
  /** Longer description (es-CO) or null. */
  description: string | null;
  /** Whether the product is featured on the home / highlights. */
  featured: boolean;
}
