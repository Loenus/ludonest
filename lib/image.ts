/**
 * Client-side image prep shared by every "upload a small round picture" flow
 * (venue logos, profile photos): center-crop to a square and downscale before
 * upload, so nothing bloats the app's storage or the Cloudflare Workers bundle
 * — the file never touches the deployed code, but keeping it small also keeps
 * bandwidth and Storage usage inside the free tier.
 */

export const MAX_IMAGE_INPUT_BYTES = 8 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;

/** Center-crop to a square and downscale to `outSize`×`outSize`, as webp (jpeg fallback). */
export async function cropToSquareWebp(
  file: File,
  outSize: number,
): Promise<{ blob: Blob; ext: string; type: string }> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const sx = (bmp.width - side) / 2;
  const sy = (bmp.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = outSize;
  canvas.height = outSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-2d-context");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bmp, sx, sy, side, side, 0, 0, outSize, outSize);
  bmp.close?.();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));

  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp", type: "image/webp" };

  const jpeg = await encode("image/jpeg");
  if (jpeg) return { blob: jpeg, ext: "jpg", type: "image/jpeg" };
  throw new Error("encode-failed");
}
