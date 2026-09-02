import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { CLAIM_PATH, HOME_PATH, LOGIN_PATH } from "@/lib/session";
import type { AppRole, Session } from "@/lib/types";

/**
 * Data Access Layer.
 *
 * `proxy.ts` runs optimistic redirects, but every authenticated page/action
 * must still call one of these guards — they are the real enforcement point,
 * close to the data. Reads are memoised per request via `cache()`.
 */

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return {
    userId: user.id,
    role: profile.role as AppRole,
    email: user.email ?? "",
    fullName:
      profile.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Utente",
  };
});

/** Require any authenticated user. */
export async function requireUser(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH.player);
  return session;
}

/**
 * Require a specific role. A logged-in user with the wrong role is sent to
 * their own home; a would-be manager without an approved venue is sent to the
 * claim form.
 */
export async function requireRole(role: AppRole): Promise<Session> {
  const session = await requireUser();

  if (session.role === role) return session;

  if (role === "manager" && session.role === "player") {
    redirect(CLAIM_PATH);
  }
  redirect(HOME_PATH[session.role]);
}

/** The venue owned by the current manager (or `null`). */
export const getManagedVenue = cache(async () => {
  const session = await getSession();
  if (!session || session.role !== "manager") return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("owner_id", session.userId)
    .maybeSingle();

  return data ?? null;
});
