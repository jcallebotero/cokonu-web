import fs from "node:fs";
import path from "node:path";

/**
 * Resolve a product's image URL from its department + code — the SINGLE place
 * the product photo path is built.
 *
 * The image is NOT stored on the product; it is derived from the product's
 * identity. Because codes are unique only WITHIN a department (Confitería and
 * Papelería can share a code), the path is namespaced by department:
 *   department "confiteria", code "0006" → "/products/confiteria/0006.jpg"
 *   department "papeleria",  code "365"  → "/products/papeleria/365.jpg"
 * Leading zeros in the code are preserved (codes are strings).
 *
 * CACHE-BUSTING: the URL carries a `?v=<mtimeMs>` version derived from the image
 * FILE's last-modified time, so replacing a photo (same code/filename) changes
 * its URL and browsers fetch the fresh image instead of a stale cached one. An
 * unchanged file keeps the same version, so there is no needless refetch.
 *
 * SERVER-ONLY: this stats the file with Node `fs`, so it must run in server code
 * (Server Components / route handlers / the data layer) — never in a Client
 * Component. It is called once, server-side, in lib/catalog.ts to bake
 * `product.imageSrc` into every Product during SSG/ISR; the resolved string is
 * then passed down to the client <ProductImage> as a prop. Do NOT import this
 * into a "use client" module (it would pull `fs` into the client bundle).
 *
 * Missing photos are expected — many products have none yet. On ENOENT (or any
 * stat failure) it returns the plain path WITHOUT a `?v` param and never throws;
 * <ProductImage>'s onError then shows the coconut placeholder, exactly as before.
 */
export function productImageSrc(department: string, code: string): string {
  return productFileSrc(department, `${code}.jpg`);
}

/**
 * Version an EXACT product photo by its filename (including extension) under
 * `/public/products/<department>/`. This is the shared cache-busting primitive:
 * `productImageSrc` uses it for the `<code>.jpg` main photo, and the flavor
 * variant discovery (lib/productVariants.ts) uses it for each real file it finds
 * (so any extension — .jpg/.png/.webp — keeps the same `?v=<mtimeMs>` handling).
 *
 * SERVER-ONLY (`fs`). Missing file → plain path, no `?v`, never throws.
 */
export function productFileSrc(department: string, filename: string): string {
  const src = `/products/${department}/${filename}`;
  try {
    const file = path.join(
      process.cwd(),
      "public",
      "products",
      department,
      filename,
    );
    const version = Math.round(fs.statSync(file).mtimeMs);
    return `${src}?v=${version}`;
  } catch {
    // No photo yet (ENOENT) or stat failed → plain path, no ?v, no crash.
    return src;
  }
}
