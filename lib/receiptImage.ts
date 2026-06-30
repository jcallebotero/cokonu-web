import { toBlob } from "html-to-image";

/**
 * Capture a DOM node as a crisp PNG File (2x), for the order receipt.
 *
 * Waits for fonts and any <img> inside the node to finish loading first, so the
 * generated PNG is never blank/half-rendered.
 */
export async function nodeToPngFile(
  node: HTMLElement,
  fileName: string,
): Promise<File> {
  await waitForImages(node);
  // Ensure web fonts (Montserrat via next/font) are ready before capture.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Non-fatal: proceed even if the Font Loading API misbehaves.
    }
  }

  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: "#ffffff",
  });
  if (!blob) {
    throw new Error("No se pudo generar la imagen del recibo.");
  }
  return new File([blob], fileName, { type: "image/png" });
}

/** Resolve once every <img> within `node` has loaded (or errored). */
function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  return Promise.all(
    images.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          }),
    ),
  ).then(() => undefined);
}

/** Trigger a browser download of a File (desktop fallback). */
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke after a tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
