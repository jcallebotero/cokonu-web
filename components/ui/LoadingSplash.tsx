import Image from "next/image";

/**
 * Branded loading state: the Cokonu coconut character centered on the
 * off-white brand background, with a gentle pulse. Intentionally simple —
 * elaborate animation can come later.
 */
export function LoadingSplash() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 bg-bg"
    >
      <Image
        src="/brand/logo_coko.png"
        alt="Cokonu está cargando"
        width={120}
        height={120}
        priority
        className="h-24 w-24 animate-pulse object-contain"
      />
      <span className="font-meta text-sm text-ink-soft">Cargando…</span>
    </div>
  );
}
