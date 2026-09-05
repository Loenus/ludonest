/**
 * Supabase Storage helpers. Uploaded venue logos live in the public
 * `venue-logos` bucket — never in the repo or the deployed bundle — so they
 * don't count against the Cloudflare Workers size limit.
 *
 * Framework-free (no "server-only"): imported by both the client uploader and
 * server-rendered avatars. Only reads the public URL env var.
 */

export const VENUE_LOGO_BUCKET = "venue-logos";

/** Path shape produced by <LogoUpload>: "<uploader-uid>/<uuid>.<ext>". */
export const VENUE_LOGO_PATH_RE =
  /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+\.(?:webp|jpe?g|png)$/i;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/** Public CDN URL for an object in the `venue-logos` bucket. */
export function venueLogoUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${VENUE_LOGO_BUCKET}/${encoded}`;
}

/**
 * Sanitise a submitted logo path: returns it only when well-formed AND owned
 * by `userId` (its top folder is the uploader's uid, matching the Storage RLS
 * policy). Anything else — blank, malformed, someone else's folder — is `null`.
 */
export function safeVenueLogoPath(value: unknown, userId: string): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path || !VENUE_LOGO_PATH_RE.test(path)) return null;
  return path.startsWith(`${userId}/`) ? path : null;
}

/* ------------------------------------------------------------------ */
/*  Profile photos — same treatment, separate public bucket            */
/* ------------------------------------------------------------------ */

export const AVATAR_BUCKET = "avatars";

/** Path shape produced by <AvatarUpload>: "<uploader-uid>/<uuid>.<ext>". */
export const AVATAR_PATH_RE = /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+\.(?:webp|jpe?g|png)$/i;

/** Public CDN URL for an object in the `avatars` bucket. */
export function avatarUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${encoded}`;
}

/** Same rules as {@link safeVenueLogoPath}, scoped to the avatars bucket. */
export function safeAvatarPath(value: unknown, userId: string): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path || !AVATAR_PATH_RE.test(path)) return null;
  return path.startsWith(`${userId}/`) ? path : null;
}

/* ------------------------------------------------------------------ */
/*  Event cover images — wide banner, separate public bucket           */
/* ------------------------------------------------------------------ */

export const EVENT_COVER_BUCKET = "event-covers";

/** Path shape produced by <CoverUpload>: "<uploader-uid>/<uuid>.<ext>". */
export const EVENT_COVER_PATH_RE = /^[0-9a-f-]{36}\/[A-Za-z0-9._-]+\.(?:webp|jpe?g|png)$/i;

/** Public CDN URL for an object in the `event-covers` bucket. */
export function eventCoverUrl(path: string): string {
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${SUPABASE_URL}/storage/v1/object/public/${EVENT_COVER_BUCKET}/${encoded}`;
}

/** Same rules as {@link safeVenueLogoPath}, scoped to the event-covers bucket. */
export function safeEventCoverPath(value: unknown, userId: string): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path || !EVENT_COVER_PATH_RE.test(path)) return null;
  return path.startsWith(`${userId}/`) ? path : null;
}
