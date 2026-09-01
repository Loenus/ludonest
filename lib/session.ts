import type { Role, Session } from "@/lib/types";

/**
 * Mock session handling.
 *
 * This prototype has no real identity provider: the session is a base64-encoded
 * JSON blob stored in an httpOnly cookie. The encode/decode helpers are
 * runtime-agnostic (Web APIs only) so they can run in `proxy.ts`, Server
 * Components and Route Handlers alike.
 */

export const SESSION_COOKIE = "tavolo_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Where each role lands after authentication. */
export const HOME_PATH: Record<Role, string> = {
  gamer: "/app",
  manager: "/dashboard",
};

/** Where each role is sent to authenticate. */
export const LOGIN_PATH: Record<Role, string> = {
  gamer: "/login",
  manager: "/partner/login",
};

export function encodeSession(session: Session): string {
  return btoa(encodeURIComponent(JSON.stringify(session)));
}

export function decodeSession(raw: string | undefined | null): Session | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(atob(raw))) as Session;
    if (parsed?.role !== "gamer" && parsed?.role !== "manager") return null;
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
