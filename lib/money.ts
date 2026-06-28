/**
 * Money formatting helpers for Cokonu.
 *
 * All prices on the site are in Colombian Pesos (COP):
 *   - prefix "$"
 *   - dot (".") as the thousands separator
 *   - no decimals
 *
 * Example: formatCOP(12500) === "$12.500"
 *
 * Always use this helper instead of formatting prices inline so the
 * format stays consistent across the whole site.
 */
export function formatCOP(value: number): string {
  // Round to whole pesos (COP is never shown with decimals) and take the
  // absolute value so we can place the sign ourselves.
  const rounded = Math.round(Math.abs(value));

  // Group thousands with a dot. We build the grouping manually instead of
  // relying on Intl so the output is identical across every runtime/locale.
  const grouped = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  const sign = value < 0 ? "-" : "";
  return `${sign}$${grouped}`;
}
