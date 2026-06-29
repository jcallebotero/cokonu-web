import chocolatinasData from "@/data/chocolatinas.json";
import type { DepartmentSlug, Product } from "@/types/product";

/**
 * Map the raw JSON rows into typed Products.
 *
 * `code` is kept as a STRING exactly as authored (leading zeros like "0006"
 * are significant — they must match the photo filenames), and is never coerced
 * to a number. JSON imports widen `department` to `string`, so it is narrowed
 * to DepartmentSlug here.
 */
const catalog: Product[] = (chocolatinasData as Array<Omit<Product, "department"> & { department: string }>).map(
  (row) => ({
    code: row.code,
    slug: row.slug,
    name: row.name,
    department: row.department as DepartmentSlug,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    stock: row.stock,
    presentation: row.presentation,
    description: row.description,
    featured: row.featured,
  }),
);

/**
 * DATA-ACCESS LAYER for the product catalog.
 *
 * Every page/component reads products through THIS module — never by importing
 * the JSON/data files directly. That isolation is the whole point: when we move
 * from the local JSON to a Google Sheets JSON source, only `getSource()` below
 * changes (e.g. `await fetch(SHEET_URL).then(r => r.json())`). The public
 * functions are already async, so their signatures — and every caller — stay
 * exactly the same.
 */

/**
 * The single seam to swap later. Today it returns the products loaded from
 * data/chocolatinas.json; tomorrow it fetches + maps the Sheets rows into
 * Product[]. Keep it the only place that knows where products come from.
 */
async function getSource(): Promise<Product[]> {
  return catalog;
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
