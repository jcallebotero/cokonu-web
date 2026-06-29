/**
 * Resolve a product's image path from its code (Option A).
 *
 * The image is NOT stored on the product; it is derived from the unique code,
 * e.g. code "0006" → "/products/0006.jpg". This mirrors how images resolve
 * once data comes from Google Sheets: the sheet carries the code and the path
 * is computed here. Any not-yet-uploaded photo is handled by the onError
 * fallback in <ProductImage>, so a missing file never breaks the layout.
 */
export function productImageSrc(code: string): string {
  return `/products/${code}.jpg`;
}
