import { Montserrat } from "next/font/google";

/**
 * Montserrat is the brand typeface.
 *   - 300 (Light)  → secondary / meta / captions   (.font-meta)
 *   - 400 (Regular)→ body text + product names      (default)
 *   - 900 (Black)  → headings / hero, NON-italic    (.font-display)
 *
 * The CSS variable `--font-montserrat` is wired into the Tailwind
 * `--font-sans` token in globals.css.
 */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  style: ["normal"],
  variable: "--font-montserrat",
  display: "swap",
});
