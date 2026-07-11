import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image only optimizes LOCAL paths listed here; everything else is
    // blocked (400). Two prefixes are in use:
    //  - /brand/**    brand assets + mega-menu category icons; never a query.
    //  - /products/** product photos, which now carry an mtime cache-buster
    //    (?v=<mtimeMs>, see lib/productImage.ts). The version is per-file and
    //    dynamic, so `search` can't be pinned to one exact value — we omit it
    //    to allow any ?v on our own product paths (a missing-photo src has no
    //    query and still matches). /hero/** is absent: it's served via plain
    //    <img>/<video>, not next/image.
    localPatterns: [
      { pathname: "/brand/**", search: "" },
      { pathname: "/products/**" },
    ],
  },
};

export default nextConfig;
