import type { DepartmentSlug, Product } from "@/types/product";
import codeReference from "@/data/chocolatinas.json";
import { searchProducts } from "@/lib/search";
import { productImageSrc } from "@/lib/productImage";
import { basePrice } from "@/lib/pricing";

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
    const seenIdentities = new Set<string>();
    const products: Product[] = [];

    for (const raw of rows as RawProduct[]) {
      const rawCode = str(raw.code);
      const name = str(raw.name);
      const department = str(raw.department);
      const category = str(raw.category);
      // A product needs at least a code, name, department and category.
      if (!rawCode || !name || !department || !category) continue;

      // Codes are unique only WITHIN a department. The canonical (zero-padded)
      // restoration reference only covers Confitería, so only apply it there;
      // Papelería codes are used exactly as the sheet returns them.
      const code =
        department === "confiteria" ? canonicalCode(rawCode) : rawCode;

      // Identity = (department + code). Dedupe on BOTH — two products sharing a
      // code across departments are DIFFERENT products and are both kept.
      const identity = `${department} ${code}`;
      if (seenIdentities.has(identity)) continue;
      seenIdentities.add(identity);

      // Unique slug across the WHOLE catalog. Derived from the name; on any
      // collision, disambiguate deterministically by department then code
      // (which is guaranteed unique given the identity above).
      const base = slugify(name) || code;
      let slug = base;
      if (usedSlugs.has(slug)) slug = `${base}-${department}`;
      if (usedSlugs.has(slug)) slug = `${base}-${department}-${code}`;
      for (let n = 2; usedSlugs.has(slug); n++) {
        slug = `${base}-${department}-${code}-${n}`;
      }
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
        // Resolve the (cache-busted) image URL here, server-side, so it rides on
        // the product through the whole app (grid, product page, search, cart)
        // and the client never needs `fs`. Missing photos → plain path.
        imageSrc: productImageSrc(department, code),
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

/**
 * Search the catalog (name + category + subcategory). Powers BOTH the live
 * dropdown (via /api/search) and the /buscar page, using the shared matcher in
 * lib/search.ts. Returns all matches (callers slice for previews).
 */
export async function searchCatalog(query: string): Promise<Product[]> {
  return searchProducts(await getSource(), query);
}

/** Default number of related products to show on a product page. */
const RELATED_TARGET = 10;

/**
 * "Sellable" = safe to showcase: has a positive price AND is not out of stock.
 * Null stock = unknown inventory → treated as available (never "Agotado").
 */
function isSellable(product: Product): boolean {
  const price = basePrice(product);
  const inStock = product.stock === null || product.stock > 0;
  return price !== null && price > 0 && inStock;
}

/** Fisher–Yates shuffle → a NEW array (never mutates the input). */
function shuffle<T>(input: readonly T[]): T[] {
  const a = [...input];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Related products for the "También te podría gustar" showcase on a product
 * page. SERVER-side (runs at SSG/ISR generation), so the random order is baked
 * into the generated HTML — stable for that generation, rotating on each
 * revalidation, with no client randomness / hydration mismatch.
 *
 * Selection (priority): (a) same department + category first, then (b) top up
 * from the same department (any category) if short. Only SELLABLE items
 * (isSellable), the current product excluded, deduped by slug (= department +
 * code identity), up to `target`. Final display order is fully shuffled.
 * Returns [] when there are no sellable candidates (caller omits the section).
 */
export async function getRelatedProducts(
  product: Product,
  target = RELATED_TARGET,
): Promise<Product[]> {
  // (a) Same category, sellable, excluding the current product.
  const sameCategory = (
    await getProductsByCategory(product.department, product.category)
  ).filter((p) => p.slug !== product.slug && isSellable(p));

  const picked = shuffle(sameCategory).slice(0, target);

  // (b) Top up from the whole department when the category didn't fill up.
  if (picked.length < target) {
    const taken = new Set(picked.map((p) => p.slug));
    taken.add(product.slug);
    const deptTopUp = (
      await getProductsByDepartment(product.department)
    ).filter((p) => !taken.has(p.slug) && isSellable(p));
    picked.push(...shuffle(deptTopUp).slice(0, target - picked.length));
  }

  // Randomize the final display order (still server-computed → stable per gen).
  return shuffle(picked);
}
