// OpenNext adapter config for Cloudflare Workers.
// Docs: https://opennext.js.org/cloudflare
//
// Minimal setup: the Worker keeps its incremental cache in memory (fine for a
// single-region deploy with mostly dynamic, auth-gated pages). If you later add
// ISR / `use cache` pages that need a shared cache, bind an R2 bucket named
// `NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc` and switch the import below to
// `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

// Minify the bundled server + middleware. Keeps the Worker under Cloudflare's
// 3 MiB (gzip) free-plan limit.
(config.default as { minify?: boolean }).minify = true;
if (config.middleware) {
  (config.middleware as { minify?: boolean }).minify = true;
}

export default config;
