import type { DepartmentSlug, Product } from "@/types/product";
import codeReference from "@/data/chocolatinas.json";

/**
 * DATA-ACCESS LAYER for the product catalog.
 *
 * Every page/component reads products through THIS module — never by fetching
 * the source directly. That isolation is the point: the catalog now comes from
 * the live Google Sheets JSON, and ONLY `getSource()` below knows that. All the
 * public functions keep the same signatures, so no page/component changed.
 */

/** Shape of one row in the Sheets JSON `products` array. */
interface RawProduct {
  code: unknown;
  name: unknown;
  department: unknown;
  category: unknown;
  subcategory: unknown;
  presentation: unknown;
  price1: unknown;
  price2: unknown;
  price3: unknown;
  stock: unknown;
  featured: unknown;
}

/**
 * Restore the canonical (zero-padded) product code.
 *
 * The live sheet returns codes with leading zeros STRIPPED (e.g. "6" instead
 * of "0006"), but the photo filenames are zero-padded. We restore the canonical
 * string code from a bundled reference (data/chocolatinas.json) keyed by the
 * leading-zero-stripped form, so images resolve and the code stays a STRING
 * (never coerced to a number). Unknown codes pass through unchanged.
 */
const canonicalByStripped = new Map<string, string>(
  (codeReference as Array<{ code: string }>).map((r) => [
    r.code.replace(/^0+/, "") || "0",
    r.code,
  ]),
);
function canonicalCode(code: string): string {
  return canonicalByStripped.get(code.replace(/^0+/, "") || "0") ?? code;
}

/** Coerce an unknown value to a finite number or null. */
function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** Coerce to a non-empty trimmed string or null. */
function str(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Slugify a product name: accent-fold, lowercase, hyphenate. Used for
 * /producto/[slug]. Slugs are deduped across the catalog (append code on
 * collision) so each product has a stable, unique URL.
 */
function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * The single seam: fetch the live catalog JSON and map it into Product[].
 *
 * - Uses Next.js ISR (`revalidate: 600`) so the site refreshes ~10 min after
 *   the owner edits the sheet, with no redeploy.
 * - `code` stays a STRING with leading zeros (image resolution depends on it).
 * - On any fetch/parse failure returns [] so pages show their empty state
 *   instead of crashing; the error is logged server-side.
 */
async function getSource(): Promise<Product[]> {
  const url = process.env.SHEETS_CATALOG_URL;
  if (!url) {
    console.error("[catalog] SHEETS_CATALOG_URL is not set.");
    return [];
  }

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) {
      console.error(`[catalog] fetch failed: HTTP ${res.status}`);
      return [];
    }

    const data: unknown = await res.json();
    const rows = (data as { products?: unknown })?.products;
    if (!Array.isArray(rows)) {
      console.error("[catalog] malformed response: 'products' is not an array.");
      return [];
    }

    const usedSlugs = new Set<string>();
    const seenCodes = new Set<string>();
    const products: Product[] = [];

    for (const raw of rows as RawProduct[]) {
      const rawCode = str(raw.code);
      const code = rawCode ? canonicalCode(rawCode) : null;
      const name = str(raw.name);
      const department = str(raw.department);
      const category = str(raw.category);
      // A product needs at least a code, name, department and category.
      if (!code || !name || !department || !category) continue;

      // Dedupe by code — the sheet can contain duplicate rows; keep the first.
      if (seenCodes.has(code)) continue;
      seenCodes.add(code);

      // Stable, unique slug derived from the name (append code on collision).
      let slug = slugify(name) || code;
      if (usedSlugs.has(slug)) slug = `${slug}-${code}`;
      usedSlugs.add(slug);

      products.push({
        code,
        slug,
        name,
        department: department as DepartmentSlug,
        category,
        subcategory: str(raw.subcategory),
        presentation: str(raw.presentation),
        price1: num(raw.price1),
        price2: num(raw.price2),
        price3: num(raw.price3),
        stock: num(raw.stock),
        description: null,
        featured: raw.featured === true,
      });
    }

    return products;
  } catch (error) {
    console.error("[catalog] failed to load live catalog:", error);
    return [];
  }
}

/** All products. */
export async function getAllProducts(): Promise<Product[]> {
  return getSource();
}

/** A single product by its URL slug, or null if not found. */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getSource();
  return all.find((p) => p.slug === slug) ?? null;
}

/** All products in a department, e.g. "confiteria". */
export async function getProductsByDepartment(
  department: DepartmentSlug | string,
): Promise<Product[]> {
  const all = await getSource();
  return all.filter((p) => p.department === department);
}

/** All products in a department + category, e.g. ("confiteria", "confites"). */
export async function getProductsByCategory(
  department: DepartmentSlug | string,
  category: string,
): Promise<Product[]> {
  const all = await getSource();
  return all.filter(
    (p) => p.department === department && p.category === category,
  );
}

/** All products in a department + category + subcategory. */
export async function getProductsBySubcategory(
  department: DepartmentSlug | string,
  category: string,
  subcategory: string,
): Promise<Product[]> {
  const all = await getSource();
  return all.filter(
    (p) =>
      p.department === department &&
      p.category === category &&
      p.subcategory === subcategory,
  );
}

/** Featured products (for home / highlights). */
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getSource();
  return all.filter((p) => p.featured);
}
