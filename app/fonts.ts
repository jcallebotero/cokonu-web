import { Montserrat } from "next/font/google";

/**
 * Montserrat is the brand typeface.
 *   - 300 (Light)  → secondary / meta / captions   (.font-meta)
 *   - 400 (Regular)→ body text + product names      (default)
 *   - 900 (Black)  → headings / hero, used italic   (.font-display)
 *
 * Italics are included because the display role is "900 Italic".
 * The CSS variable `--font-montserrat` is wired into the Tailwind
 * `--font-sans` token in globals.css.
 */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "900"],
  style: ["normal", "italic"],
  variable: "--font-montserrat",
  display: "swap",
});
