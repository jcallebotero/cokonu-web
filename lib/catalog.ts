import { products } from "@/data/products";
import type { DepartmentSlug, Product } from "@/types/product";

/**
 * DATA-ACCESS LAYER for the product catalog.
 *
 * Every page/component reads products through THIS module — never by importing
 * data/products.ts directly. That isolation is the whole point: when we move
 * from the mock array to a Google Sheets JSON source, only `getSource()` below
 * changes (e.g. `await fetch(SHEET_URL).then(r => r.json())`). The public
 * functions are already async, so their signatures — and every caller — stay
 * exactly the same.
 */

/**
 * The single seam to swap later. Today it returns the local mock array;
 * tomorrow it fetches + maps the Sheets rows into Product[]. Keep it the only
 * place that knows where products come from.
 */
async function getSource(): Promise<Product[]> {
  return products;
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
