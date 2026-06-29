"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { productImageSrc } from "@/lib/productImage";

/**
 * Product image. The source is DERIVED from the product `code`
 * (lib/productImage.ts) — never a stored path. If the file is missing
 * (onError), it shows a neutral on-brand placeholder (faint coconut on
 * green-tint) so a not-yet-uploaded photo never breaks the grid layout.
 *
 * Must be placed inside a positioned container with a defined size
 * (e.g. `relative aspect-square`) because it renders with `fill`.
 */
export function ProductImage({
  code,
  alt,
  sizes,
  priority,
  className,
}: {
  code: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center bg-green-tint"
      >
        {/* Plain <img> for the static brand asset; no layout dependency. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/logo_coko.png"
          alt=""
          className="h-1/3 w-1/3 object-contain opacity-30"
        />
      </div>
    );
  }

  return (
    <Image
      src={productImageSrc(code)}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
