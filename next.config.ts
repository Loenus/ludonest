import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

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

// NOTE: if you ever start using Cloudflare bindings (KV / R2 / D1 / env) via
// `getCloudflareContext()`, add back:
//   import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
//   initOpenNextCloudflareForDev();
// so `next dev` can see them. Not needed today — the app only reads process.env.
