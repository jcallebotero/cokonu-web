import { FORCE_INTRO } from "@/components/home/introConfig";
import { IntroCurtain } from "@/components/home/IntroCurtain";
import { Hero } from "@/components/home/Hero";
import { Destacados } from "@/components/home/Destacados";
import { getFeaturedByDepartment } from "@/lib/catalog";

/**
 * Runs synchronously BEFORE first paint (plain inline <script>, not
 * next/script — it must block). Decides the intro's fate for this load and
 * publishes it as html[data-intro], which globals.css and the intro
 * components key off:
 *   - reduced motion → "skip" (no curtain ever; overrides FORCE_INTRO)
 *   - FORCE_INTRO → "play" every load (ignores + doesn't touch sessionStorage)
 *   - otherwise: "play" once per session (marking it seen), else "skip"
 * "play" hides the hero behind a white cover until the curtain finishes. The
 * 6s timeout is a failsafe: if hydration never happens, the page un-hides
 * itself. (With JS fully disabled this script doesn't run and the page renders
 * normally.) FORCE_INTRO is interpolated so the gate and the animation agree.
 */
const INTRO_SCRIPT = `(function(){var d=document.documentElement;try{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.dataset.intro="skip";return}var f=${FORCE_INTRO};if(!f&&sessionStorage.getItem("cokonu:introSeen")){d.dataset.intro="skip";return}if(!f){sessionStorage.setItem("cokonu:introSeen","1")}d.dataset.intro="play";window.setTimeout(function(){if(d.dataset.intro==="play"){d.dataset.intro="skip"}},6000)}catch(e){d.dataset.intro="skip"}})()`;

/* The <script> travels inside a hidden div's innerHTML rather than as a React
   element: React 19 warns on <script> elements in component trees (it never
   executes them on client renders anyway). As raw SSR HTML the browser parser
   still executes it synchronously, which is exactly what we need. On pure
   client-side navigations it (intentionally) doesn't run: no attribute is set
   and the hero simply renders live, no curtain. */
const INTRO_SCRIPT_HTML = { __html: `<script>${INTRO_SCRIPT}</script>` };

/**
 * Home page: intro curtain (once per session) + full-bleed hero with the
 * idling mascot, followed by the mode-filtered "Destacados" showcase.
 *
 * BOTH department lists are precomputed here on the server and passed to the
 * client <Destacados>, so toggling the shared hero mode (cookie/pencil) swaps
 * the grid instantly with no refetch.
 */
export default async function HomePage() {
  const [confiteria, papeleria] = await Promise.all([
    getFeaturedByDepartment("confiteria"),
    getFeaturedByDepartment("papeleria"),
  ]);

  return (
    <>
      <div hidden dangerouslySetInnerHTML={INTRO_SCRIPT_HTML} />
      <IntroCurtain />
      <Hero />
      <Destacados confiteria={confiteria} papeleria={papeleria} />
    </>
  );
}
