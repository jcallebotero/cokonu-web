import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { productFileSrc } from "@/lib/productImage";

/**
 * FLAVOR VARIANTS discovered from image FILES — never from catalog rows.
 *
 * A product's identity stays (department + code); price/stock still come from
 * that single code. Variants are ONLY extra photos and create no new products,
 * rows, or codes. Naming convention in `/public/products/<department>/`:
 *   <code>.<ext>          → main photo (no flavor)
 *   <code>-<flavor>.<ext> → a flavor variant (<flavor> = token after the first
 *                           dash following the code)
 * Dropping `7701-limon.jpg` into the folder makes "Limon" appear automatically —
 * no MAESTRA edit, no code change.
 *
 * SERVER-ONLY: reads the directory with `fs`. Never import into client code.
 */

export interface ProductVariant {
  /** Flavor token from the filename (after the first dash), or null for the main photo. */
  flavor: string | null;
  /** Title-cased ASCII flavor label ("Chocolate Blanco"), or null for the main photo. */
  label: string | null;
  /** Versioned image URL (keeps `?v=<mtime>`), via the centralized resolver. */
  src: string;
}

/** Extensions treated as product photos. */
const IMAGE_EXT = /\.(?:jpe?g|png|webp|avif|gif)$/i;

/**
 * Read a department's photo directory ONCE per request. Wrapped in React
 * `cache()` so a category grid (many products, same department) triggers a
 * single `readdir`, then each product filters this list in memory — not one
 * `readdir` per card. Sorted for deterministic ordering (raw readdir order is
 * filesystem-dependent). Missing folder → [] (many products have no photos).
 */
const readDepartmentDir = cache((department: string): string[] => {
  try {
    return fs
      .readdirSync(path.join(process.cwd(), "public", "products", department))
      .sort();
  } catch {
    return [];
  }
});

/** Escape regex metacharacters so the code is matched literally. */
function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Title-case a flavor token: '-'/'_' → spaces, each word capitalized. ASCII
 * only — no accents are added ("limon" → "Limon", not "Limón").
 */
function labelFromFlavor(flavor: string): string {
  return flavor
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Discover a product's photo variants — server-only, memoized per request.
 *
 * COLLISION-SAFE: a file belongs to code C iff its basename (extension stripped)
 * is EXACTLY C (the main) OR C immediately followed by '-' then a flavor. The
 * code is regex-escaped and anchored: `^<C>(?:-(.+))?$`. So codes that are
 * prefixes of each other never borrow photos — for code "770", "7701.jpg" does
 * NOT match; "018" and "0018" stay distinct. Codes are STRINGS: leading zeros
 * are significant and never coerced to numbers.
 *
 * Order: main first (flavor null), then flavors alphabetical by label. Every
 * `src` goes through the centralized resolver so it keeps `?v=<mtime>` and works
 * for any extension. No photos → [] (→ placeholder, no strip, no chips).
 */
export const getProductVariants = cache(
  (department: string, code: string): ProductVariant[] => {
    const files = readDepartmentDir(department);
    const re = new RegExp(`^${escapeRegExp(code)}(?:-(.+))?$`);

    let main: ProductVariant | null = null;
    const flavors: ProductVariant[] = [];

    for (const file of files) {
      if (!IMAGE_EXT.test(file)) continue;
      const base = file.replace(/\.[^.]+$/, ""); // strip the extension
      const match = re.exec(base);
      if (!match) continue;

      const src = productFileSrc(department, file);
      const flavor = match[1] ?? null;
      if (flavor === null) {
        // First main file wins (deterministic thanks to the sorted listing).
        main ??= { flavor: null, label: null, src };
      } else {
        flavors.push({ flavor, label: labelFromFlavor(flavor), src });
      }
    }

    flavors.sort((a, b) => a.label!.localeCompare(b.label!));
    return main ? [main, ...flavors] : flavors;
  },
);

/**
 * Flavor labels only (main excluded), alphabetical — for the category-card
 * chips. Reuses the memoized discovery above.
 */
export function getFlavorLabels(department: string, code: string): string[] {
  return getProductVariants(department, code)
    .filter((v) => v.flavor !== null)
    .map((v) => v.label as string);
}
