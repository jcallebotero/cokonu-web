import fs from "node:fs";
import path from "node:path";
import type { CloudinaryCatalog } from "@/lib/cloudinaryCatalog";

/**
 * Deploy-scoped cache-buster, BAKED AT BUILD TIME. `process.env.DEPLOY_VERSION`
 * is replaced with a string literal by webpack DefinePlugin (configured via
 * next.config.ts `env`), so this constant is identical in SSG and in ISR
 * regeneration and needs no runtime env lookup. Falls back to "dev" only if the
 * inlining is somehow absent (never the fake 1980 mtime). See next.config.ts for
 * the source (Netlify COMMIT_REF → local git SHA → literal).
 */
const VERSION = process.env.DEPLOY_VERSION || "dev";

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
 * CACHE-BUSTING: the URL carries a `?v=<DEPLOY_VERSION>` version that is stable
 * within a deploy and changes between deploys (see VERSION above). Since photos
 * live in the repo and only change via a deploy, this is always correct: a new
 * deploy serves fresh images; no deploy keeps stable, cacheable URLs.
 *
 * SERVER-ONLY: this stats the file with Node `fs` (existence check), so it must
 * run in server code (Server Components / route handlers / the data layer) —
 * never in a Client Component. It is called once, server-side, in lib/catalog.ts
 * to bake `product.imageSrc` into every Product during SSG/ISR; the resolved
 * string is then passed down to the client <ProductImage> as a prop. Do NOT
 * import this into a "use client" module (it would pull `fs` into the client
 * bundle).
 *
 * Missing photos are expected — many products have none yet. On ENOENT (or any
 * stat failure) it returns the plain path WITHOUT a `?v` param and never throws;
 * <ProductImage>'s onError then shows the coconut placeholder, exactly as before.
 */
export function productImageSrc(department: string, code: string): string {
  return productFileSrc(department, `${code}.jpg`);
}

/**
 * PER-CÓDIGO SOURCE SWITCH — the one rule that decides repo vs Cloudinary.
 *
 * If Cloudinary holds ANY asset for `<department>/<code>` it is AUTHORITATIVE
 * for that código: we serve its original delivery URL and never fall back to the
 * repo for that código (sources are never mixed within one código). If it holds
 * only flavors and no `<codigo>` main, the first flavor stands in as the main
 * image rather than crossing back to `public/`.
 *
 * If Cloudinary holds NOTHING for the código, this returns the EXISTING repo
 * path completely unchanged — same `?v=<DEPLOY_VERSION>` cache-buster, same
 * on-disk existence check, same placeholder behaviour. An empty catalog (no
 * credentials, e.g. every local build) therefore means "repo, exactly as today".
 *
 * Deliberately SYNCHRONOUS: the caller fetches the catalog once in the server
 * data layer and passes it in, so no leaf helper becomes async and no Cloudinary
 * access can drift into a Client Component. Cloudinary URLs get NO `?v=` — the
 * `/v<version>/` segment already busts cache on re-upload.
 */
export function resolveProductImageSrc(
  catalog: CloudinaryCatalog,
  department: string,
  code: string,
): string {
  const entry = catalog.get(`${department}/${code}`);
  if (entry) {
    const main = entry.main ?? entry.flavors[0]?.url;
    if (main) return main;
  }
  return productImageSrc(department, code);
}

/**
 * Version an EXACT product photo by its filename (including extension) under
 * `/public/products/<department>/`. This is the shared cache-busting primitive:
 * `productImageSrc` uses it for the `<code>.jpg` main photo, and the flavor
 * variant discovery (lib/productVariants.ts) uses it for each real file it finds
 * (so any extension — .jpg/.png/.webp — gets the same `?v=<DEPLOY_VERSION>`).
 *
 * SERVER-ONLY (`fs`). The `statSync` here is ONLY an existence check now (the
 * version comes from the build-time constant, not the mtime): missing file →
 * throw → catch → plain path, no `?v`, never throws → placeholder.
 */
export function productFileSrc(department: string, filename: string): string {
  const src = `/products/${department}/${filename}`;
  const file = path.join(
    process.cwd(),
    "public",
    "products",
    department,
    filename,
  );
  try {
    fs.statSync(file); // existence check only — throws (ENOENT) → placeholder path
    return `${src}?v=${VERSION}`;
  } catch {
    // No photo yet (ENOENT) or stat failed → plain path, no ?v, no crash.
    return src;
  }
}
