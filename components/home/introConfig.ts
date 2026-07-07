/**
 * Intro curtain preview flag. Plain (server-importable) module on purpose: the
 * pre-paint gate script in app/page.tsx interpolates this boolean at server
 * render, so it must NOT live in a "use client" module (there it would be a
 * client-reference stub, not the actual value).
 *
 * While true, the intro plays on EVERY load (ignoring sessionStorage) so it can
 * be previewed repeatedly. Flip to false to restore "once per browser session"
 * (key "cokonu:introSeen"). prefers-reduced-motion overrides this either way.
 */
export const FORCE_INTRO = true;
