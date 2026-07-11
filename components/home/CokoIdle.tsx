"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Coko, the hero mascot: a looping transparent WebM over its first-frame poster
 * PNG. The poster and video are MUTUALLY EXCLUSIVE — never both visible:
 *
 *  - Pre-roll (before the video's first frame is confirmed): only the poster
 *    shows (instant paint under the intro curtain).
 *  - Once the alpha probe confirms VP9 alpha works (draw a frame to a canvas,
 *    read a corner pixel that's transparent in this asset; alpha < 16 = OK) the
 *    poster is HIDDEN (opacity 0, kept in the DOM as fallback) and ONLY the
 *    video shows. This is critical: the video is transparent, so a visible
 *    poster underneath a PLAYING video shows through everywhere the moving
 *    character isn't in frame 0 → two offset cokos. The swap fires as soon as
 *    the probe resolves (~1s, still under the intro curtain), not at ACT 4.
 *  - Opaque probe (no alpha, e.g. Safari < 17.4), a media 'error', or reduced
 *    motion → only the poster shows; the video is unloaded / never mounted. If
 *    the video errors AFTER takeover, the poster is restored.
 *
 * Both layers fill one aspect-locked 16:9 box (`object-cover`) and share a
 * proportional edge clip (`EDGE_CLIP`) — see below. The mode crossfade doesn't
 * touch this component, so the video never restarts.
 */

/**
 * The source's transparent side margins (black RGB at alpha 0) render a faint
 * dark vertical band when the media is downscaled into a large box — a GPU
 * compositing ghost visible wherever the margin is shown, so trimming *within*
 * the margin only shifts it inward. Clipping 2% off each side (source ~38px)
 * lands just PAST the 35px (1.82%) transparent margin, so no margin is shown and
 * the band is gone. It scales with the box (works at every width) and only
 * shaves ~2px of the character's outermost anti-aliased edge — imperceptible.
 * The character reaches the frame edge top/bottom, so there's no vertical trim.
 */
const EDGE_CLIP: CSSProperties = {
  clipPath: "inset(0 2%)",
  WebkitClipPath: "inset(0 2%)",
};

export function CokoIdle() {
  const reduce = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [videoOk, setVideoOk] = useState(true); // false → drop to the poster
  // The video has taken over: poster hidden, only the video shows.
  const [videoActive, setVideoActive] = useState(false);

  // Mount the video only on the client (avoids an SSR/reduced-motion mismatch);
  // SSR renders the poster alone.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const showVideo = mounted && !reduce && videoOk;

  function dropToPoster() {
    videoRef.current?.pause();
    setVideoActive(false); // restore the poster
    setVideoOk(false); // unmount the video
  }

  function probeAlpha() {
    const v = videoRef.current;
    if (!v) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 27;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no 2d context");
      ctx.drawImage(v, 0, 0, 48, 27);
      // The top-left corner is always fully transparent in this asset.
      const alpha = ctx.getImageData(1, 1, 1, 1).data[3];
      if (alpha < 16) {
        // Alpha works → hand off to the video and hide the poster. Do this now
        // (probe fires while the intro curtain still covers the hero), not at
        // ACT 4, so the poster is already gone when the mascot is revealed.
        setVideoActive(true);
      } else {
        dropToPoster(); // painted opaque → no VP9-alpha support
      }
    } catch {
      dropToPoster(); // tainted canvas / read failure → poster
    }
  }

  return (
    // Aspect-locked 16:9 box; exactly one layer is visible at a time.
    // No background / border / shadow anywhere.
    <div
      className="pointer-events-none relative overflow-hidden"
      style={{ height: "min(100%, 54cqw)", aspectRatio: "1920 / 1080" }}
    >
      {/* Poster: instant-paint base + fallback. Hidden the moment the video
          takes over (no transition, so it's fully hidden immediately — never a
          static frame-0 layer under the playing transparent video). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hero/coko_poster.png"
        alt=""
        draggable={false}
        width={1920}
        height={1080}
        style={EDGE_CLIP}
        className={cn(
          "absolute inset-0 h-full w-full select-none object-cover",
          videoActive ? "opacity-0" : "opacity-100",
        )}
      />

      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          onLoadedData={probeAlpha}
          onError={dropToPoster}
          style={{ ...EDGE_CLIP, pointerEvents: "none" }}
          className={cn(
            // Instant swap (no transition): the frame is already decoded when
            // videoActive flips, so poster→video is seamless, and visibility
            // never depends on a compositor animation completing.
            "absolute inset-0 h-full w-full select-none object-cover",
            videoActive ? "opacity-100" : "opacity-0",
          )}
        >
          <source src="/hero/coko_loop.webm" type="video/webm" />
        </video>
      )}
    </div>
  );
}
