"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import {
  HomeOverlayHeader,
  HomeStickyHeader,
} from "@/components/layout/HomeHeaders";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { HeroModeProvider } from "@/components/home/HeroModeContext";

// Avoids the "useLayoutEffect does nothing on the server" warning while still
// measuring before paint on the client (Next.js SSRs client components too).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * App shell + "reveal" footer.
 *
 * On desktop (≥lg) the footer stays FIXED behind the page: the scrolling
 * content sits in a solid, higher-stacked wrapper with a bottom margin equal
 * to the footer's measured height, so scrolling to the end uncovers the footer
 * from the bottom upward (it never slides down from the top). On small screens
 * the footer can be taller than the viewport, which breaks a fixed reveal, so
 * we fall back to a normal static footer in flow.
 *
 * Stacking order (root context): Header (z-40) > search scrim (z-30) > content
 * wrapper (z-10) > fixed footer (z-0). The Header is deliberately OUTSIDE the
 * z-10 wrapper so the search scrim dims the content while the header + search
 * bar stay clear and interactive above it.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const footerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(0);
  const [fabHidden, setFabHidden] = useState(false);
  const [reveal, setReveal] = useState(false);

  // Reveal mode only on wider screens (footer fits the viewport there).
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setReveal(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Measure the footer's real height (it varies — the hero wordmark scales
  // with viewport width) and keep it in sync via ResizeObserver.
  useIsomorphicLayoutEffect(() => {
    const el = footerRef.current;
    if (!reveal || !el) return;
    const update = () => setFooterHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [reveal]);

  // Hide the WhatsApp FAB once the footer starts to be revealed underneath.
  useEffect(() => {
    if (!reveal || footerHeight === 0) {
      // Reset when the reveal footer isn't active (sync with external layout).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFabHidden(false);
      return;
    }
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const revealedPx =
        window.scrollY + window.innerHeight - (doc.scrollHeight - footerHeight);
      setFabHidden(revealedPx > 24);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reveal, footerHeight]);

  return (
    <HeroModeProvider>
      {/* Header lives in the ROOT stacking context (above the search scrim).
          Home swaps the default header for the integrated overlay row + the
          scroll-handoff sticky header (see HomeHeaders.tsx). */}
      {isHome ? (
        <>
          <HomeStickyHeader />
          <HomeOverlayHeader />
        </>
      ) : (
        <Header />
      )}

      {/* Solid, higher-stacked content that scrolls up and over the footer. */}
      <div
        className="relative z-10 min-h-screen bg-bg"
        style={reveal ? { marginBottom: footerHeight } : undefined}
      >
        <main id="contenido">{children}</main>

        {/* Static footer in normal flow on small screens. */}
        {!reveal && <Footer />}
      </div>

      {/* Reveal footer pinned to the viewport bottom, behind the content. */}
      {reveal && (
        <div ref={footerRef} className="fixed inset-x-0 bottom-0 z-0">
          <Footer />
        </div>
      )}

      {/* Slide-in cart panel, controlled via CartContext. */}
      <CartDrawer />

      {/* Floating WhatsApp button (bottom-left, all pages). */}
      <WhatsAppFab hidden={fabHidden} />
    </HeroModeProvider>
  );
}
