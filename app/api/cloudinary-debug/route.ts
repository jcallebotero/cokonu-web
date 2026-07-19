import { NextResponse } from "next/server";
import { getCloudinaryCatalog } from "@/lib/cloudinaryCatalog";

/**
 * TEMPORARY diagnostic for the Cloudinary catalog. DELETE once the folder-mode
 * question is settled.
 *
 * Why it exists: credentials live only in Netlify, so the Cloudinary path can't
 * be exercised locally. This route reports — from the live environment — which
 * listing endpoints answer, what shape the assets come back in, and what the app
 * actually built, so we can tell "wrong endpoint" from "wrong names" from
 * "missing credentials" without guessing.
 *
 * SECURITY (non-negotiable):
 *  - Gated on an unguessable `key`; anything else 404s so the route stays
 *    invisible to crawlers and probes.
 *  - It NEVER emits the API key, the API secret, the Authorization header, or
 *    any env var VALUE — only booleans for presence. The cloud name IS included
 *    because it is public by construction (it appears in every delivery URL).
 *  - Every section is independently try/caught: one failure can't take down the
 *    others or leak a stack into the response beyond its message string.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

/** Shared secret for the route. Temporary, rotated by deleting the route. */
const DIAG_KEY = "cokonu-diag-8f3a";

const FOLDERS = {
  confiteria: "cokonu/confiteria",
  papeleria: "cokonu/papeleria",
} as const;

function errMsg(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function str(record: Record<string, unknown>, key: string): string | null {
  const value = record[key];
  return typeof value === "string" ? value : null;
}

function resourcesOf(body: Record<string, unknown>): Record<string, unknown>[] {
  const list = Array.isArray(body.resources) ? body.resources : [];
  return list.filter(
    (r): r is Record<string, unknown> => !!r && typeof r === "object",
  );
}

export async function GET(request: Request) {
  // Wrong/missing key → behave as if the route doesn't exist.
  const requestUrl = new URL(request.url);
  if (requestUrl.searchParams.get("key") !== DIAG_KEY) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

  // Presence ONLY — never the values.
  const envPresent = {
    cloudName: Boolean(cloudName),
    apiKey: Boolean(apiKey),
    apiSecret: Boolean(apiSecret),
  };
  const canCall = envPresent.cloudName && envPresent.apiKey && envPresent.apiSecret;

  // Built here, never returned or logged.
  const auth = canCall
    ? Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")
    : "";

  async function adminGet(url: URL) {
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
      cache: "no-store",
    });
    let body: Record<string, unknown> = {};
    try {
      const payload: unknown = await res.json();
      if (payload && typeof payload === "object") {
        body = payload as Record<string, unknown>;
      }
    } catch {
      // Non-JSON error page → leave body empty.
    }
    return { status: res.status, body };
  }

  const out: Record<string, unknown> = { envPresent, cloudName };

  // --- Is the account in dynamic or fixed folder mode? ---------------------
  try {
    if (!canCall) {
      out.folderMode = "unknown (credentials not present)";
    } else {
      const url = new URL(
        `https://api.cloudinary.com/v1_1/${cloudName}/config`,
      );
      url.searchParams.set("settings", "true");
      const { status, body } = await adminGet(url);
      const settings =
        body.settings && typeof body.settings === "object"
          ? (body.settings as Record<string, unknown>)
          : {};
      // Only the folder_mode string is extracted — the rest of /config is never
      // echoed, so nothing unexpected can ride along.
      const mode =
        str(body, "folder_mode") ?? str(settings, "folder_mode") ?? "unknown";
      out.folderMode = { httpStatus: status, folderMode: mode };
    }
  } catch (error) {
    out.folderMode = { error: errMsg(error) };
  }

  // --- Generic whole-account listing (classic-mode shape) ------------------
  try {
    if (!canCall) {
      out.genericList = "skipped (credentials not present)";
    } else {
      const url = new URL(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image`,
      );
      url.searchParams.set("type", "upload");
      url.searchParams.set("max_results", "50");
      const { status, body } = await adminGet(url);
      const resources = resourcesOf(body);
      out.genericList = {
        httpStatus: status,
        count: resources.length,
        sample: resources.slice(0, 10).map((r) => ({
          public_id: str(r, "public_id"),
          asset_folder: str(r, "asset_folder"),
          folder: str(r, "folder"),
          display_name: str(r, "display_name"),
          format: str(r, "format"),
        })),
      };
    }
  } catch (error) {
    out.genericList = { error: errMsg(error) };
  }

  // --- Dynamic-folder listing, per folder ---------------------------------
  for (const [label, folder] of Object.entries(FOLDERS)) {
    const key =
      label === "confiteria"
        ? "byAssetFolderConfiteria"
        : "byAssetFolderPapeleria";
    try {
      if (!canCall) {
        out[key] = "skipped (credentials not present)";
        continue;
      }
      const url = new URL(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/by_asset_folder`,
      );
      url.searchParams.set("asset_folder", folder);
      url.searchParams.set("max_results", "50");
      const { status, body } = await adminGet(url);
      const resources = resourcesOf(body);
      out[key] = {
        folder,
        httpStatus: status,
        count: resources.length,
        sample: resources.slice(0, 10).map((r) => ({
          public_id: str(r, "public_id"),
          display_name: str(r, "display_name"),
          format: str(r, "format"),
        })),
      };
    } catch (error) {
      out[key] = { folder, error: errMsg(error) };
    }
  }

  // --- What the APP actually built from all of the above -------------------
  try {
    const catalog = await getCloudinaryCatalog();
    out.catalogSummary = {
      size: catalog.size,
      keys: [...catalog.keys()].slice(0, 20),
    };
  } catch (error) {
    out.catalogSummary = { error: errMsg(error) };
  }

  return NextResponse.json(out, {
    headers: { "cache-control": "no-store, max-age=0" },
  });
}
