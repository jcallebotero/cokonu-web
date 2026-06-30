/**
 * Order reference generator (client-side, no server).
 *
 * Format: PED-YYMMDD-XXXX
 *   - YYMMDD: today's date (local time)
 *   - XXXX:   4 random uppercase base36 chars
 * Example: "PED-260629-A1B2"
 *
 * Intentionally NON-sequential: a true sequential counter will arrive later
 * via the Google Sheets backend. Call this fresh when the user starts a quote
 * — do not cache it globally.
 */
export function makeOrderRef(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += Math.floor(Math.random() * 36)
      .toString(36)
      .toUpperCase();
  }

  return `PED-${yy}${mm}${dd}-${suffix}`;
}
