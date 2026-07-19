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
 * FOLDER MODES: every account created since June 2024 uses DYNAMIC folders,
 * where an asset's folder is not part of its public_id (which may be a random
 * token) and its human-readable name lives in `display_name`. So we list each
 * known folder with `resources/by_asset_folder` and read the código from
 * `display_name`, falling back to the classic whole-account listing (matching on
 * `asset_folder`/`folder`/public_id path) only if that endpoint is rejected.
 *
 * FAILURE IS ALWAYS SOFT. Missing env vars, a network error, an auth failure or
 * an unexpected payload all resolve to an EMPTY map after ONE concise warning —
 * never a throw. An empty map simply means "nothing is in Cloudinary", so every
 * código falls back to the existing repo logic and the site is unaffected. This
 * is also the normal local path: credentials live only in Netlify, so a local
 * `npm run build` legitimately produces an empty catalog.
 */

/** Departments whose Cloudinary folder we honour. Anything else is ignored. */
const ALLOWED_FOLDERS = new Set(["cokonu/confiteria", "cokonu/papeleria"]);

/** Warm-instance cache window. Matches the catalog's ISR `revalidate: 600`. */
const TTL_MS = 10 * 60 * 1000;

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

/** Module-level TTL cache so warm instances don't re-list on every render. */
let memo: { at: number; map: CloudinaryCatalog } | null = null;

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

/** One Admin API GET. Returns the status and parsed body; never throws on 4xx/5xx. */
async function adminGet(
  url: URL,
  auth: string,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
    // Admin API listing is metadata, not page data: never let Next cache it.
    cache: "no-store",
  });
  let body: Record<string, unknown> = {};
  try {
    const payload: unknown = await res.json();
    if (payload && typeof payload === "object") {
      body = payload as Record<string, unknown>;
    }
  } catch {
    // Non-JSON body (e.g. an HTML error page) → treat as empty.
  }
  return { status: res.status, body };
}

/** Pull `resources` out of a listing body, defensively. */
function resourcesOf(body: Record<string, unknown>): Record<string, unknown>[] {
  const list = Array.isArray(body.resources) ? body.resources : [];
  return list.filter(
    (r): r is Record<string, unknown> => !!r && typeof r === "object",
  );
}

/**
 * PRIMARY listing — DYNAMIC FOLDER MODE.
 *
 * Every Cloudinary account created since June 2024 is in dynamic folder mode,
 * where the asset's folder is NOT part of its public_id (which may be a random
 * token) and the generic `/resources/image` listing doesn't carry a usable
 * folder field. Filtering by a folder derived from the public_id therefore drops
 * EVERY asset and the catalog silently comes back empty — which is exactly the
 * bug this replaces. `by_asset_folder` asks Cloudinary directly for the assets
 * in a folder, so it works no matter what the public_ids look like.
 *
 * Returns `ok: false` (with the status) if the endpoint rejects the request, so
 * the caller can fall back to the fixed-folder-mode strategy.
 */
async function listByAssetFolder(
  cloudName: string,
  auth: string,
  folder: string,
): Promise<{ ok: boolean; status: number; resources: Record<string, unknown>[] }> {
  const collected: Record<string, unknown>[] = [];
  let cursor = "";
  let status = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const endpoint = new URL(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder`,
    );
    endpoint.searchParams.set("asset_folder", folder);
    endpoint.searchParams.set("max_results", String(PAGE_SIZE));
    if (cursor) endpoint.searchParams.set("next_cursor", cursor);

    const { status: httpStatus, body } = await adminGet(endpoint, auth);
    status = httpStatus;
    if (httpStatus < 200 || httpStatus >= 300) {
      return { ok: false, status: httpStatus, resources: [] };
    }

    collected.push(...resourcesOf(body));
    cursor = readString(body, "next_cursor");
    if (!cursor) break;
  }

  return { ok: true, status, resources: collected };
}

/**
 * FALLBACK listing — FIXED (classic) FOLDER MODE.
 *
 * Only used when `by_asset_folder` is rejected for a folder. Lists every upload
 * once and keeps the assets whose folder matches, deriving the folder from
 * `asset_folder` → `folder` → the public_id's leading path, which is how classic
 * accounts expose it.
 */
async function listAllUploads(
  cloudName: string,
  auth: string,
): Promise<Record<string, unknown>[]> {
  const collected: Record<string, unknown>[] = [];
  let cursor = "";

  for (let page = 0; page < MAX_PAGES; page++) {
    const endpoint = new URL(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
    );
    endpoint.searchParams.set("type", "upload");
    endpoint.searchParams.set("max_results", String(PAGE_SIZE));
    if (cursor) endpoint.searchParams.set("next_cursor", cursor);

    const { status, body } = await adminGet(endpoint, auth);
    if (status < 200 || status >= 300) {
      throw new Error(`Admin API HTTP ${status}`);
    }

    collected.push(...resourcesOf(body));
    cursor = readString(body, "next_cursor");
    if (!cursor) break;
  }

  return collected;
}

/** The folder a resource belongs to, as reported by a classic-mode listing. */
function folderOf(resource: Record<string, unknown>): string {
  const publicId = readString(resource, "public_id");
  const cut = publicId.lastIndexOf("/");
  const implied = cut >= 0 ? publicId.slice(0, cut) : "";
  return (
    readString(resource, "asset_folder") ||
    readString(resource, "folder") ||
    implied
  );
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
 * Build the catalog: ask each known folder for its assets (dynamic-folder mode),
 * falling back per-folder to the classic whole-account listing if that endpoint
 * is rejected.
 */
async function listCloudinary(): Promise<CloudinaryCatalog> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Expected locally (credentials live only in Netlify) → silent empty catalog.
  if (!cloudName || !apiKey || !apiSecret) return EMPTY;

  const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const map = new Map<string, CloudinaryEntry>();
  // Classic-mode listing is global, so fetch it at most once across both folders.
  let allUploads: Record<string, unknown>[] | null = null;

  for (const folder of ALLOWED_FOLDERS) {
    const departamento = folder.slice(folder.lastIndexOf("/") + 1);
    const primary = await listByAssetFolder(cloudName, auth, folder);

    if (primary.ok) {
      for (const resource of primary.resources) {
        addResource(map, cloudName, departamento, resource);
      }
      continue;
    }

    // by_asset_folder rejected → this account is likely in fixed folder mode.
    console.warn(
      `[cloudinary] by_asset_folder HTTP ${primary.status} for "${folder}" — falling back to the full listing.`,
    );
    allUploads ??= await listAllUploads(cloudName, auth);
    for (const resource of allUploads) {
      if (folderOf(resource) !== folder) continue;
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
 * The Cloudinary catalog for this request/instance.
 *
 * `cache()` dedupes it within one render pass (it is consulted for every product
 * and every variant lookup), and the module-level TTL keeps a warm serverless
 * instance from re-listing on each regeneration. Always resolves — never throws.
 */
export const getCloudinaryCatalog = cache(
  async (): Promise<CloudinaryCatalog> => {
    const now = Date.now();
    if (memo && now - memo.at < TTL_MS) return memo.map;

    try {
      const map = await listCloudinary();
      memo = { at: now, map };
      return map;
    } catch (error) {
      // ONE concise warning; cache the empty result so a broken/unreachable
      // Cloudinary doesn't get hammered (and doesn't spam the logs) for a while.
      console.warn(
        "[cloudinary] listing failed — serving repo images instead:",
        error instanceof Error ? error.message : error,
      );
      memo = { at: now, map: EMPTY };
      return EMPTY;
    }
  },
);
