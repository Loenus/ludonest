import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Pin the workspace root: there is a stray package-lock.json in a parent
  // directory, and without this Turbopack guesses the wrong root and warns.
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ["192.168.1.240", "localhost", "127.0.0.1"],
};

export default nextConfig;

// Lets `next dev` talk to the Cloudflare bindings/env defined in wrangler.jsonc
// through `getCloudflareContext()`. No-op for `next build` / production.
// Docs: https://opennext.js.org/cloudflare/get-started
initOpenNextCloudflareForDev();
