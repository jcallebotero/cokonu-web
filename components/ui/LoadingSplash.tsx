import Image from "next/image";

/**
 * Loading state: a full-screen white overlay with the green Cokonu coconut
 * centered, flipping flat on its own vertical axis (rotateY, coin-flip in
 * place — no orbit). The flip starts gently and accelerates (ease-in), looping.
 */
export function LoadingSplash() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-surface"
      style={{ perspective: "900px" }}
    >
      <Image
        src="/brand/coko_verde.png"
        alt="Cargando"
        width={180}
        height={180}
        priority
        className="animate-coco-flip h-40 w-40 object-contain [transform-origin:center] sm:h-48 sm:w-48"
      />
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
