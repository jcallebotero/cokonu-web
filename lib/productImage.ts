/**
 * Resolve a product's image path from its department + code.
 *
 * The image is NOT stored on the product; it is derived from the product's
 * identity. Because codes are now unique only WITHIN a department (Confitería
 * and Papelería can share a code), the path is namespaced by department:
 *   department "confiteria", code "0006" → "/products/confiteria/0006.jpg"
 *   department "papeleria",  code "365"  → "/products/papeleria/365.jpg"
 *
 * Leading zeros in the code are preserved (codes are strings). Any not-yet
 * uploaded photo is handled by the onError fallback in <ProductImage>, so a
 * missing file never breaks the layout.
 */
export function productImageSrc(department: string, code: string): string {
  return `/products/${department}/${code}.jpg`;
}
