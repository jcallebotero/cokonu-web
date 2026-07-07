"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Coko's idle loop: a slow sway + a faster breathing bob (staggered periods so
 * it never feels robotic), grounded by a soft shadow. Transform/opacity only
 * (GPU-friendly), anchored bottom-center.
 *
 * Sizing is driven by the parent box (fills its height via `max-h-full`, capped
 * to `90cqw` of the panel width so it never overflows on narrow screens) and
 * bottom-aligned, so the mascot's base sits near the panel's bottom edge. The
 * whole thing is decorative + `pointer-events-none` so the corner pills stay
 * clickable even where the mascot's transparent bounds overlap them.
 *
 * The loop stays parked until the intro finishes ("cokonu:intro-done"), or from
 * the start when there's no intro. Reduced motion keeps Coko static.
 */
export function CokoIdle() {
  const reduce = useReducedMotion();
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (document.documentElement.dataset.intro === "play") {
      const start = () => setGo(true);
      window.addEventListener("cokonu:intro-done", start, { once: true });
      return () => window.removeEventListener("cokonu:intro-done", start);
    }
    // No intro this load — loop from the start.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGo(true);
  }, []);

  const active = go && !reduce;

  return (
    <div className="pointer-events-none relative flex h-full items-end justify-center">
      {/* Sway (slower period). */}
      <motion.div
        className="flex h-full items-end"
        style={{ transformOrigin: "bottom center", willChange: "transform" }}
        animate={active ? { rotate: [-1.5, 1.5, -1.5] } : {}}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Breathing bob + subtle squash/stretch (faster period). */}
        <motion.div
          className="relative flex h-full items-end"
          style={{ transformOrigin: "bottom center", willChange: "transform" }}
          animate={
            active
              ? { y: [0, -10, 0], scaleY: [1, 1.03, 1], scaleX: [1, 0.99, 1] }
              : {}
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Ground shadow — grounds the mascot, pulses opposite the bob. */}
          <motion.span
            aria-hidden
            className="is-round absolute bottom-[1%] left-1/2 h-[4%] w-[46%] -translate-x-1/2 bg-black/25 blur-md"
            animate={
              active ? { scaleX: [1, 1.06, 1], opacity: [0.28, 0.18, 0.28] } : {}
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <Image
            src="/hero/coko_lapiz.png"
            alt=""
            preload
            draggable={false}
            width={1959}
            height={1143}
            sizes="(min-width: 1024px) 60vw, 90vw"
            className="h-auto max-h-full w-auto max-w-[90cqw] select-none object-contain"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
