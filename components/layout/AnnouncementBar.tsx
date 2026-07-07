/**
 * Thin announcement bar with a seamless left-scrolling marquee.
 *
 * Rendered in normal flow ABOVE the sticky header, so it's only visible at the
 * very top of the page and simply scrolls away as the user scrolls down — the
 * sticky header (which hides/shows on scroll) reappears without it. No JS and
 * no layout shift (nothing is toggled).
 *
 * Seamless loop: the track contains two identical sequences; the CSS marquee
 * animation shifts it by -50% (one sequence width), so it repeats with no gap.
 */
const MESSAGE =
  "Los costos de envío los sabrás cuando proporciones tus datos en la cotización por WhatsApp";

/** One sequence of the message repeated a few times with dot separators. */
function Sequence({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="flex shrink-0" aria-hidden={hidden || undefined}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-6">{MESSAGE}</span>
          <span aria-hidden>·</span>
        </span>
      ))}
    </div>
  );
}

export function AnnouncementBar() {
  return (
    <div
      role="region"
      aria-label={MESSAGE}
      className="relative z-40 overflow-hidden bg-green-tint text-ink"
    >
      <div className="flex w-max animate-marquee py-1.5 text-xs hover:[animation-play-state:paused]">
        <Sequence />
        <Sequence hidden />
      </div>
    </div>
  );
}
