// Netlify Edge Function — block AI-training / scraper crawlers at the edge.
//
// Why: Netlify Observability showed Meta's "meta-externalagent" (AI-training
// crawler) eating ~65% of our bandwidth in 24h, and Netlify's User Agent Blocker
// extension doesn't include it. robots.txt is only voluntary, so we enforce here
// with a tiny 403 (send as few bytes as possible). This is ADDITIVE to Netlify's
// own extension (a separate edge function) — it doesn't replace or conflict with it.
//
// *** CRITICAL SAFETY RULE — DO NOT BLOCK "facebookexternalhit" ***
// "facebookexternalhit" is the crawler that builds WhatsApp / Facebook / Instagram
// LINK PREVIEWS, which this business depends on — it MUST NEVER be blocked. It is
// a DIFFERENT crawler from Meta's AI bots below. The facebookexternalhit allow-
// guard runs FIRST, before any block check. Note also that none of the blocked
// tokens is a substring of "facebookexternalhit" (in particular "facebookbot" —
// a distinct AI crawler — cannot match "facebookexternalhit").
//
// Dependency-free (uses only Web-standard Request/Response), so it stays tiny and
// fast on every request.

// AI/scraper user-agent tokens to block, matched case-insensitively as substrings.
const BLOCKED_TOKENS = [
  "meta-externalagent",
  "meta-externalfetcher",
  "facebookbot",
  "gptbot",
  "claudebot",
  "ccbot",
  "bytespider",
  "perplexitybot",
];

export default function blockAiCrawlers(request: Request): Response | undefined {
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();

  // ALLOW-FIRST: never block link-preview fetches (WhatsApp/Facebook/Instagram).
  // This guard MUST come before any block matching.
  if (ua.includes("facebookexternalhit")) return undefined;

  // Block known AI-training / scraping crawlers with a minimal 403.
  if (BLOCKED_TOKENS.some((token) => ua.includes(token))) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "content-type": "text/plain" },
    });
  }

  // Everyone else (real users, Googlebot, Bingbot, …) passes through untouched.
  return undefined;
}

// In-source config — Netlify runs this on every path. No netlify.toml needed.
export const config = { path: "/*" };
