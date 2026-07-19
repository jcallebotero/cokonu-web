import type { NextConfig } from "next";
import { execSync } from "node:child_process";

/**
 * DEPLOY-SCOPED cache-buster for product photos, resolved ONCE here at BUILD time
 * and inlined via `env` (webpack DefinePlugin replaces `process.env.DEPLOY_VERSION`
 * with this string literal). Because it's baked into the bundle, it is IDENTICAL
 * in SSG and in ISR regeneration — the serverless function never re-derives it and
 * never needs the value in its runtime environment.
 *
 * Why deploy-scoped is correct: product photos live in the repo, so they can only
 * change via a deploy, and Netlify's COMMIT_REF (the deploy's git SHA) changes
 * exactly then. New commit → new version → guaranteed-fresh images; a redeploy of
 * the same commit keeps URLs stable → proper caching. (Replaces the old per-file
 * mtime, which git does not preserve: a fresh clone + build stamped every photo
 * with the same normalized 1980 timestamp, making cache-busting inert in prod.)
 *
 * Fallbacks keep local dev working: Netlify COMMIT_REF → local short git SHA →
 * a stable literal. Short, URL-safe, identical for every image in a deploy.
 */
function deployVersion(): string {
  const ref = process.env.COMMIT_REF; // Netlify build env: full commit SHA
  if (ref && ref.length >= 7) return ref.slice(0, 8);
  try {
    return execSync("git rev-parse --short=8 HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return "devbuild";
  }
}

const nextConfig: NextConfig = {
  env: {
    // Baked into the bundle at build time; read in lib/productImage.ts.
    DEPLOY_VERSION: deployVersion(),
  },
  images: {
    // next/image only optimizes LOCAL paths listed here; everything else is
    // blocked (400). Two prefixes are in use:
    //  - /brand/**    brand assets + mega-menu category icons; never a query.
    //  - /products/** product photos, which carry a deploy-scoped cache-buster
    //    (?v=<DEPLOY_VERSION>, see lib/productImage.ts). The version is one value
    //    per deploy but we still omit `search` so any ?v on our own product paths
    //    is allowed (a missing-photo src has no query and still matches). /hero/**
    //    is absent: it's served via plain <img>/<video>, not next/image.
    localPatterns: [
      { pathname: "/brand/**", search: "" },
      { pathname: "/products/**" },
    ],
    // Cloudinary is only the ORIGIN store for product photos that have been
    // uploaded there; next/image (via Netlify) still does all the optimizing,
    // so the URLs we generate carry NO Cloudinary transformation segment.
    // Without this entry next/image throws "hostname not configured" at runtime.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};

export default nextConfig;
