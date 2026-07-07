import { HeroPanel } from "@/components/home/HeroPanel";

/**
 * Live homepage hero: the near-full-viewport rounded panel with a generous even
 * white frame (~16px mobile → ~44px desktop, set by the wrapper padding — the
 * panel's min-height in HeroPanel accounts for it). `data-hero-live` is the
 * intro hook: globals.css keeps it invisible (visibility, not display — it
 * still lays out for measurement and stays in the DOM for SEO) while the
 * curtain plays; IntroCurtain measures the inner [data-hero-panel].
 */
export function Hero() {
  return (
    <div data-hero-live className="w-full p-4 sm:p-8 lg:p-11">
      <HeroPanel />
    </div>
  );
}
