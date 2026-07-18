"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

interface Results {
  items: Product[];
  total: number;
}

/** Debounce for live queries (ms). */
const DEBOUNCE_MS = 180;

/**
 * Header search: a bar that slides in directly below the header with a live
 * results dropdown (up to 4 vertical product cards — the SAME ProductCard used
 * in the category grid — laid out 4 across), plus a translucent green scrim
 * that dims the page below (still visible, pushed back with a green veil).
 *
 * The bar/dropdown render inside the (sticky) <header> so they position against
 * it; the scrim is portalled to <body> so its `fixed inset-0` isn't clipped by
 * the header's backdrop-filter and it sits below the header (z-40). Closes via
 * X, Escape, or scrim click.
 */
export function SearchPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results | null>(null);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevPath = useRef(pathname);

  // Enable the portalled overlay only after mount (SSR-safe).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  // Autofocus on open; clear query/results on close.
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
    // Reset when the panel closes (sync with the open prop).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery("");
    setResults(null);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Close on client navigation (e.g. clicking a result card).
  useEffect(() => {
    if (open && pathname !== prevPath.current) onClose();
    prevPath.current = pathname;
  }, [pathname, open, onClose]);

  // Debounced live search against the shared endpoint.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as Results;
        setResults({ items: data.items ?? [], total: data.total ?? 0 });
      } catch {
        if (!controller.signal.aborted) setResults({ items: [], total: 0 });
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  function goToResults(q = query) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
    onClose();
  }

  const trimmed = query.trim();

  return (
    <>
      {/* Bar + dropdown, anchored directly below the header. */}
      <div
        className={cn(
          "absolute inset-x-0 top-full border-b border-line bg-surface shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)] transition duration-200 ease-out",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0",
        )}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              goToResults();
            }}
            className="flex items-center gap-3 py-4"
          >
            <SearchIcon className="shrink-0 text-ink-soft" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar productos"
              className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-soft"
            />
            {/* Single close control — closes the whole search overlay. */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar búsqueda"
              className="shrink-0 p-1 text-ink transition-colors hover:text-pink-dark"
            >
              <CloseIcon />
            </button>
          </form>

          {trimmed && (
            <div className="pb-6">
              {results && results.items.length > 0 ? (
                <>
                  {/* Count (left) + "Ver todo" (right), above the previews. */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-meta text-sm text-ink-soft">
                      {results.total} resultados
                    </span>
                    {results.total > results.items.length && (
                      <button
                        type="button"
                        onClick={() => goToResults()}
                        className="relative z-10 text-sm font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-green-dark hover:decoration-green-dark"
                      >
                        Ver todo
                      </button>
                    )}
                  </div>

                  {/* Vertical product cards — the SAME ProductCard as the
                      category grid (photo on top, name/price below).
                      DESKTOP (sm+): 4 across at natural size, unchanged.
                      MOBILE (<sm): 2 across at natural size. The old layout put
                      4 across via a `zoom:0.6` + `100vw` inverse-width hack,
                      which renders fine in Chrome but mis-computes on iOS WebKit
                      (real iPhones) — cards overlapped and Agregar buttons/prices
                      collided. 2-up gives each card room to breathe; combined
                      with `compactOnMobile` (name clamped to 2 lines + button
                      bottom-anchored) and the grid's align-items:stretch, cards
                      in a row share height and their buttons line up. */}
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {results.items.map((p) => (
                      <ProductCard key={p.slug} product={p} compactOnMobile />
                    ))}
                  </div>
                </>
              ) : results && results.items.length === 0 ? (
                <p className="py-6 text-center font-meta text-sm text-ink-soft">
                  No encontramos productos para “{trimmed}”.
                </p>
              ) : (
                <p className="py-6 text-center font-meta text-sm text-ink-soft">
                  Buscando…
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Translucent GREEN scrim that dims the page below the bar with a green
          veil (page stays visible); click to close. Portalled to <body> so it
          isn't clipped by the header's backdrop, and sits below the header
          (z-40) so the header + search bar/dropdown stay fully clear above it. */}
      {mounted &&
        createPortal(
          <div
            aria-hidden
            onClick={onClose}
            className={cn(
              "fixed inset-0 z-30 bg-green/35 backdrop-blur-[2px] transition-opacity duration-200",
              open ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />,
          document.body,
        )}
    </>
  );
}
