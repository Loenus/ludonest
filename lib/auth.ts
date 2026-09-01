import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LOGIN_PATH, SESSION_COOKIE, decodeSession } from "@/lib/session";
import type { Role, Session } from "@/lib/types";

/** Read the current session in a Server Component (or `null` if signed out). */
export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(SESSION_COOKIE)?.value);
}

/**
 * Server-side guard for the authenticated areas. `proxy.ts` already blocks the
 * routes, but calling this in the page keeps the pages honest if the matcher
 * ever changes and narrows the type to a non-null session.
 */
export async function requireRole(role: Role): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH[role]);
  if (session.role !== role) redirect("/");
  return session;
}
