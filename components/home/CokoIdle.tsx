"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Coko, the hero mascot. Exactly ONE layer is ever visible; there are three
 * end states, all sharing the same box, framing and edge clip:
 *
 *  1. VP9-alpha OK (Chrome/Firefox/Android) → the transparent WebM <video>.
 *     Pre-roll shows only the poster (instant paint under the intro curtain);
 *     once the alpha probe confirms VP9 alpha works (draw a frame to a canvas,
 *     read a corner pixel that's transparent in this asset; alpha < 16 = OK) the
 *     poster is HIDDEN and ONLY the video shows. This is critical: the video is
 *     transparent, so a visible poster underneath a PLAYING video shows through
 *     everywhere the moving character isn't in frame 0 → two offset cokos. The
 *     swap fires as soon as the probe resolves (~1s, still under the curtain).
 *  2. NO VP9-alpha (iOS/iPadOS Safari — all iOS browsers are WebKit) or a media
 *     'error' → the ANIMATED WebP (`coko_anim.webp`): the same full 144-frame
 *     loop with real alpha, which Safari 14+ renders and loops on its own (no
 *     <video>, no JS). iOS therefore gets the REAL animation, not a still.
 *  3. prefers-reduced-motion → the static first-frame poster, no motion. The
 *     video is never mounted and the animated WebP is never requested.
 *
 * COST: `coko_anim.webp` is ~2.7 MB, so it is mounted ONLY in state 2 — capable
 * browsers never render that <img> and therefore never fetch it. The tiny poster
 * PNG stays the immediate pre-probe paint and is held visible until the WebP has
 * actually decoded (`animLoaded`), so the swap has no gap and no flash.
 *
 * All layers fill one aspect-locked 16:9 box (`object-cover`) and share a
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
  const [videoOk, setVideoOk] = useState(true); // false → drop to the fallback
  // The video has taken over: poster hidden, only the video shows.
  const [videoActive, setVideoActive] = useState(false);
  // The video path is unusable (no VP9-alpha, or a media error) → mount the
  // animated WebP. Gating the <img> on this is what keeps capable browsers from
  // ever requesting the ~2.7 MB asset.
  const [useAnim, setUseAnim] = useState(false);
  // The animated WebP has decoded — only then do we hide the poster, so the
  // swap has no gap while it downloads.
  const [animLoaded, setAnimLoaded] = useState(false);

  // Mount the video only on the client (avoids an SSR/reduced-motion mismatch);
  // SSR renders the poster alone.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const showVideo = mounted && !reduce && videoOk;
  // The animated WebP is mounted ONLY here: after the probe/error has ruled the
  // video out, and never under reduced motion. Capable browsers never reach this.
  const showAnim = mounted && !reduce && useAnim;

  function dropToFallback() {
    videoRef.current?.pause();
    setVideoActive(false); // restore the poster until the WebP decodes
    setVideoOk(false); // unmount the video
    setUseAnim(true); // …and animate with the WebP instead of a static frame
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
        dropToFallback(); // painted opaque → no VP9-alpha support (iOS)
      }
    } catch {
      dropToFallback(); // tainted canvas / read failure → animated WebP
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
          // Hidden once EITHER moving layer is actually up: the video on
          // takeover, or the animated WebP once it has decoded.
          videoActive || animLoaded ? "opacity-0" : "opacity-100",
        )}
      />

      {/* Animated WebP — the iOS path. Same box/framing/clip as the poster and
          video, so the swap is a pure crossfade with no layout shift. It loops
          infinitely on its own (loop_count 0), so there's no <video> and no JS
          driving it. Mounted only in the fallback state, so the ~2.7 MB file is
          never requested by browsers that can play the WebM. */}
      {showAnim && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src="/hero/coko_anim.webp"
          alt=""
          draggable={false}
          width={520}
          height={293}
          onLoad={() => setAnimLoaded(true)}
          style={EDGE_CLIP}
          className={cn(
            "absolute inset-0 h-full w-full select-none object-cover",
            // Held transparent until decoded so the poster covers the download.
            animLoaded ? "opacity-100" : "opacity-0",
          )}
        />
      )}

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
          onError={dropToFallback}
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
