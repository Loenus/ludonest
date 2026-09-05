/**
 * Client-side image prep shared by every "upload a small round picture" flow
 * (venue logos, profile photos): center-crop to a square and downscale before
 * upload, so nothing bloats the app's storage or the Cloudflare Workers bundle
 * — the file never touches the deployed code, but keeping it small also keeps
 * bandwidth and Storage usage inside the free tier.
 */

export const MAX_IMAGE_INPUT_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

async function encodeCanvas(
  canvas: HTMLCanvasElement,
): Promise<{ blob: Blob; ext: string; type: string }> {
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));

  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp", type: "image/webp" };

  const jpeg = await encode("image/jpeg");
  if (jpeg) return { blob: jpeg, ext: "jpg", type: "image/jpeg" };
  throw new Error("encode-failed");
}

/** Center-crop to a square and downscale to `outSize`×`outSize`, as webp (jpeg fallback). */
export async function cropToSquareWebp(
  file: File,
  outSize: number,
): Promise<{ blob: Blob; ext: string; type: string }> {
  return cropToRatioWebp(file, outSize, 1);
}

/**
 * Center-crop to `aspect` (width / height) and downscale to `outWidth` wide,
 * as webp (jpeg fallback). `aspect: 1` gives a square; `aspect: 16/9` a wide
 * banner. Used for event cover images — kept modest so Storage/bandwidth stay
 * inside the free tier.
 */
export async function cropToRatioWebp(
  file: File,
  outWidth: number,
  aspect: number,
): Promise<{ blob: Blob; ext: string; type: string }> {
  const bmp = await createImageBitmap(file);

  // Largest `aspect`-shaped rectangle that fits inside the source, centered.
  let cw = bmp.width;
  let ch = cw / aspect;
  if (ch > bmp.height) {
    ch = bmp.height;
    cw = ch * aspect;
  }
  const sx = (bmp.width - cw) / 2;
  const sy = (bmp.height - ch) / 2;

  const outHeight = Math.round(outWidth / aspect);
  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-2d-context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, sx, sy, cw, ch, 0, 0, outWidth, outHeight);
  bmp.close?.();

  return encodeCanvas(canvas);
}
