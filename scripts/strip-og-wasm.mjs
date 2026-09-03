// Shrinks the two @vercel/og WebAssembly blobs that Next's edge-runtime shim
// pulls into the OpenNext middleware bundle: resvg.wasm (~1.3 MB) + yoga.wasm.
//
// This app renders no dynamic OG / icon images, so `initWasm()` is never
// reached — nothing instantiates these modules. Replacing them with a valid
// but empty module (magic + version, no sections) keeps the Cloudflare Worker
// under the 3 MiB gzip free-plan limit. `import ... from "*.wasm"` still
// resolves; only an actual ImageResponse render (which can't happen) would
// notice.
//
// Run AFTER `opennextjs-cloudflare build` and BEFORE `wrangler deploy` —
// wrangler resolves these wasm imports straight from node_modules at deploy
// time, so they never land in `.open-next/`.

import { existsSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const EMPTY_WASM = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

const require = createRequire(import.meta.url);

let ogDir;
try {
  ogDir = dirname(require.resolve("next/dist/compiled/@vercel/og/index.node.js"));
} catch {
  console.log("strip-og-wasm: @vercel/og not found under next/dist — nothing to do");
  process.exit(0);
}

let stripped = 0;
for (const name of ["resvg.wasm", "yoga.wasm"]) {
  const file = join(ogDir, name);
  if (!existsSync(file)) continue;
  const before = statSync(file).size;
  if (before <= EMPTY_WASM.length) {
    console.log(`strip-og-wasm: ${name} already stripped`);
    continue;
  }
  writeFileSync(file, EMPTY_WASM);
  console.log(
    `strip-og-wasm: ${name} ${(before / 1024).toFixed(0)} KB -> ${EMPTY_WASM.length} B`,
  );
  stripped++;
}

console.log(stripped ? `strip-og-wasm: done (${stripped} file(s))` : "strip-og-wasm: nothing to strip");
