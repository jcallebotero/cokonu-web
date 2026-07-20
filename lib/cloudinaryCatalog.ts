import "server-only";
import { cache } from "react";

/**
 * CLOUDINARY = ORIGIN STORE ONLY (read-only).
 *
 * This module lists what currently lives in Cloudinary so the app can decide,
 * PER CÓDIGO, whether to serve a Cloudinary original or the repo photo in
 * `public/products/`. It never uploads, deletes, tags or transforms anything.
 *
 * The URLs handed out are the ORIGINAL delivery URLs with NO transformation
 * segment (no f_auto / q_auto / w_ …): next/image + Netlify still do all the
 * resizing and format negotiation, which keeps Cloudinary transformation
 * credits at zero and the heavy bandwidth on Netlify. The `/v<version>/` part of
 * a Cloudinary URL already changes on re-upload, so these URLs need no `?v=`
 * cache-buster (unlike the repo photos).
 *
 * SERVER-ONLY: this reads CLOUDINARY_API_SECRET. `import "server-only"` makes
 * the build fail loudly if it is ever pulled into a Client Component. Consumers
 * must resolve URLs on the server and pass finished plain strings to the client.
 *
 * FOLDER MODES: this account is DYNAMIC folder mode, where an asset's folder is
 * not part of its public_id (which may be a random token) and its human-readable
 * name lives in `display_name`. So we list each known folder directly with
 * `resources/by_asset_folder` and read the código from `display_name`. A `404`
 * for a folder just means that department has no assets yet (contributes zero;
 * NOT an error). There is no whole-account fallback: the account is confirmed
 * dynamic, and a full `/resources/image` scan only burned Admin API quota.
 *
 * RATE LIMIT + GLOBAL DEDUP: the Admin API is capped at 500 requests/HOUR on the
 * Free plan, and there are hundreds of ISR pages each revalidating every 600s. So
 * every Admin GET goes through Next's shared Data Cache (`next.revalidate: 600`),
 * which dedupes it across ALL pages / requests / serverless instances — one real
 * call per folder per ~10 min for the whole site, not one per page. `cache()`
 * adds per-render dedup on top.
 *
 * FAILURE IS ALWAYS SOFT, and NEVER BLANKS A POPULATED SITE. Missing env vars →
 * empty map (the local path: credentials live only in Netlify). Any real failure
 * — a non-2xx (429 rate-limit, 5xx…), a network error, an unexpected payload —
 * logs ONE concise warning and returns the LAST-GOOD catalog if we ever built
 * one, else an empty map. It never throws. So a transient hiccup keeps the last
 * known photos showing; only an instance that has never succeeded falls back to
 * repo images, and it self-heals on the next window.
 */

/** Departments whose Cloudinary folder we honour. Anything else is ignored. */
const ALLOWED_FOLDERS = new Set(["cokonu/confiteria", "cokonu/papeleria"]);

/** Shared Data Cache window for every Admin API GET. Matches ISR `revalidate`. */
const REVALIDATE_SECONDS = 600;

/** Hard stop on pagination so a surprise can never spin forever. */
const MAX_PAGES = 20;

/** Cloudinary's Admin API cap per page. */
const PAGE_SIZE = 500;

/** One flavor variant of a código, e.g. `7701-limon`. */
export interface CloudinaryFlavor {
  /** Token after the FIRST dash, e.g. "limon". */
  slug: string;
  /** Display name, e.g. "Limon" / "Chocolate Blanco". */
  name: string;
  /** Original delivery URL (no transformations). */
  url: string;
}

/** Everything Cloudinary holds for one `<departamento>/<codigo>`. */
export interface CloudinaryEntry {
  /** URL of the `<codigo>` image, if one was uploaded. */
  main?: string;
  flavors: CloudinaryFlavor[];
}

/** Keyed by `"<departamento>/<codigo>"`, e.g. `"confiteria/7701"`. */
export type CloudinaryCatalog = ReadonlyMap<string, CloudinaryEntry>;

const EMPTY: CloudinaryCatalog = new Map();

/**
 * The last successfully-built, NON-EMPTY catalog. Returned on any subsequent
 * failure so a transient Cloudinary/Admin-API problem never blanks the site's
 * images. Only ever assigned from a fetch that succeeded and yielded assets.
 */
let lastGoodCatalog: CloudinaryCatalog | null = null;

/**
 * Title-case a flavor slug: remaining dashes/underscores become spaces and each
 * word is capitalized. ASCII only — no accents are invented ("limon" → "Limon").
 * Mirrors the repo-side label logic in lib/productVariants.ts.
 */
function labelFromSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/** Read a string field defensively from an unknown record. */
function readString(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * One Admin API GET, through Next's SHARED Data Cache (`next.revalidate`), so the
 * same URL is fetched at most once per window across every page/request/instance
 * — the rate-limit fix. In Next 16 `fetch` is uncached by default, so the
 * explicit `next.revalidate` is what opts in. (The debug route is force-dynamic
 * and intentionally bypasses this to read live.)
 *
 * Returns the status and, ONLY for a 2xx, the parsed body. A non-2xx body is
 * never parsed into a catalog: `ok` gates that at the call sites, so a 429/5xx
 * error payload can never become the window's data. Never throws on 4xx/5xx (a
 * network error still rejects → handled as a failure up the chain).
 */
async function adminGet(
  url: URL,
  auth: string,
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) return { ok: false, status: res.status, body: {} };

  let body: Record<string, unknown> = {};
  try {
    const payload: unknown = await res.json();
    if (payload && typeof payload === "object") {
      body = payload as Record<string, unknown>;
    }
  } catch {
    // 2xx with a non-JSON body (shouldn't happen) → treat as empty resources.
  }
  return { ok: true, status: res.status, body };
}

/** Pull `resources` out of a listing body, defensively. */
function resourcesOf(body: Record<string, unknown>): Record<string, unknown>[] {
  const list = Array.isArray(body.resources) ? body.resources : [];
  return list.filter(
    (r): r is Record<string, unknown> => !!r && typeof r === "object",
  );
}

/**
 * List one folder's assets directly (dynamic folder mode). `by_asset_folder`
 * asks Cloudinary for the assets in a folder regardless of public_id shape.
 *
 *  - 2xx → the folder's resources (paginated via `next_cursor`).
 *  - 404 → the folder doesn't exist yet → ZERO assets, NOT an error (e.g.
 *    `cokonu/papeleria` before any papelería photo is uploaded).
 *  - any other non-2xx (429, 5xx, …) → a REAL failure → THROW, so the caller
 *    returns the last-good catalog rather than an empty one.
 */
async function listByAssetFolder(
  cloudName: string,
  auth: string,
  folder: string,
): Promise<Record<string, unknown>[]> {
  const collected: Record<string, unknown>[] = [];
  let cursor = "";

  for (let page = 0; page < MAX_PAGES; page++) {
    const endpoint = new URL(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder`,
    );
    endpoint.searchParams.set("asset_folder", folder);
    endpoint.searchParams.set("max_results", String(PAGE_SIZE));
    if (cursor) endpoint.searchParams.set("next_cursor", cursor);

    const { ok, status, body } = await adminGet(endpoint, auth);
    if (!ok) {
      if (status === 404) return []; // folder not created yet → zero assets
      throw new Error(`by_asset_folder HTTP ${status} for "${folder}"`);
    }

    collected.push(...resourcesOf(body));
    cursor = readString(body, "next_cursor");
    if (!cursor) break;
  }

  return collected;
}

/**
 * Fold one asset into the catalog under `<departamento>/<codigo>`.
 *
 * The human-readable name lives in `display_name` in dynamic folder mode (the
 * public_id can be a random token), so display_name is the PRIMARY source and
 * the public_id's last segment is only the fallback.
 */
function addResource(
  map: Map<string, CloudinaryEntry>,
  cloudName: string,
  departamento: string,
  resource: Record<string, unknown>,
): void {
  const publicId = readString(resource, "public_id");
  const displayName = readString(resource, "display_name");
  const cut = publicId.lastIndexOf("/");
  const idSegment = cut >= 0 ? publicId.slice(cut + 1) : publicId;

  // display_name can carry the extension; public_id never does.
  const filename = (displayName || idSegment).replace(
    /\.(jpe?g|png|webp|avif|gif)$/i,
    "",
  );
  if (!filename) return;

  // Split at the FIRST dash: `<codigo>` or `<codigo>-<sabor>`. Códigos are
  // STRINGS and keep their leading zeros — "005" never becomes "5".
  const dash = filename.indexOf("-");
  const codigo = dash === -1 ? filename : filename.slice(0, dash);
  const flavorSlug = dash === -1 ? "" : filename.slice(dash + 1);
  if (!codigo) return;

  // secure_url is correct in every folder mode; only reconstruct if absent.
  let url = readString(resource, "secure_url");
  if (!url) {
    if (!publicId) return;
    const version = resource.version;
    const format = readString(resource, "format") || "jpg";
    const v = typeof version === "number" ? `v${version}/` : "";
    url = `https://res.cloudinary.com/${cloudName}/image/upload/${v}${publicId}.${format}`;
  }

  const key = `${departamento}/${codigo}`;
  const entry = map.get(key) ?? { flavors: [] };
  if (flavorSlug) {
    entry.flavors.push({
      slug: flavorSlug,
      name: labelFromSlug(flavorSlug),
      url,
    });
  } else {
    entry.main = url;
  }
  map.set(key, entry);
}

/**
 * Build the catalog by asking each known folder directly for its assets. Throws
 * on a real Admin API failure (so the caller can fall back to last-good); a
 * missing (404) folder just contributes nothing.
 */
async function listCloudinary(): Promise<CloudinaryCatalog> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Expected locally (credentials live only in Netlify) → silent empty catalog,
  // not a failure: don't warn and don't disturb last-good.
  if (!cloudName || !apiKey || !apiSecret) return EMPTY;

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const map = new Map<string, CloudinaryEntry>();

  for (const folder of ALLOWED_FOLDERS) {
    const departamento = folder.slice(folder.lastIndexOf("/") + 1);
    // Throws on a real failure (429/5xx/network); returns [] on a 404 folder.
    const resources = await listByAssetFolder(cloudName, auth, folder);
    for (const resource of resources) {
      addResource(map, cloudName, departamento, resource);
    }
  }

  // Stable, deterministic flavor order (matches the repo-side behaviour).
  for (const entry of map.values()) {
    entry.flavors.sort((a, b) => a.name.localeCompare(b.name));
  }
  return map;
}

/**
 * The Cloudinary catalog for this render.
 *
 * `cache()` dedupes it within one render pass (it's consulted for every product
 * and variant); the shared Data Cache on each Admin GET dedupes the actual
 * network calls across the whole site (see adminGet). Always resolves — never
 * throws:
 *  - success → the freshly built map; if non-empty it also becomes last-good.
 *  - failure (any thrown error from listCloudinary) → the last-good map if we
 *    ever built one, else empty. ONE concise warning.
 */
export const getCloudinaryCatalog = cache(
  async (): Promise<CloudinaryCatalog> => {
    try {
      const map = await listCloudinary();
      // Only a real, non-empty result is worth remembering as "good". An empty
      // result (no creds, or every folder 404s) must never overwrite last-good.
      if (map.size > 0) lastGoodCatalog = map;
      return map;
    } catch (error) {
      console.warn(
        "[cloudinary] listing failed — keeping last-good images:",
        error instanceof Error ? error.message : error,
      );
      return lastGoodCatalog ?? EMPTY;
    }
  },
);
