import { HeroPanel } from "@/components/home/HeroPanel";

/**
 * Live homepage hero: the near-full-viewport rounded panel inside a white frame.
 *
 * Mobile reserves ~72px of top padding for the always-visible fixed header
 * (HomeMobileHeader); desktop uses an even 44px frame (the integrated header +
 * corner pills sit INSIDE the panel). `data-hero-live` is the intro hook:
 * globals.css keeps it invisible (visibility, not display — it still lays out
 * for measurement + SEO) while the curtain plays; IntroCurtain measures the
 * inner [data-hero-panel].
 */
export function Hero() {
  return (
    <div
      data-hero-live
      className="w-full px-4 pb-4 pt-[4.5rem] lg:px-11 lg:pb-11 lg:pt-11"
    >
      <HeroPanel />
    </div>
  );
}
