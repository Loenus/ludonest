"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { CLAIM_PATH, HOME_PATH } from "@/lib/session";
import type { AppRole } from "@/lib/types";

export interface AuthState {
  error?: string;
  notice?: string;
}

const credentials = z.object({
  email: z.email({ error: "Inserisci un indirizzo email valido." }),
  password: z.string().min(8, { error: "La password deve avere almeno 8 caratteri." }),
});

const signUpSchema = credentials.extend({
  fullName: z.string().trim().min(2, { error: "Inserisci il tuo nome." }),
});

async function siteOrigin(): Promise<string> {
  const h = await headers();
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host") ?? "localhost:3000"}`
  );
}

/**
 * Where to land after a successful sign-in. An approved manager/superadmin goes
 * to their area; a still-`player` account that signed in from the partner page
 * is a would-be manager whose claim isn't approved yet, so it's routed to the
 * claim flow — which shows the "Richiesta in revisione" status (or the form).
 */
async function destinationAfterSignIn(
  variant: "player" | "manager",
): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return HOME_PATH.player;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (data?.role as AppRole) ?? "player";
  if (role === "manager" || role === "superadmin") return HOME_PATH[role];
  return variant === "manager" ? CLAIM_PATH : HOME_PATH.player;
}

/** Email + password sign-in. `variant` is the page that invoked the action. */
export async function signIn(
  variant: "player" | "manager",
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Email o password non corretti." };
  }

  redirect(await destinationAfterSignIn(variant));
}

/** Email + password registration. Managers are routed to the venue-claim form. */
export async function signUp(
  variant: "player" | "manager",
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dati non validi." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${
        variant === "manager" ? CLAIM_PATH : HOME_PATH.player
      }`,
    },
  });

  if (error) {
    return {
      error:
        error.message.toLowerCase().includes("already")
          ? "Esiste già un account con questa email."
          : "Registrazione non riuscita. Riprova.",
    };
  }

  // Email confirmation enabled: no session yet.
  if (!data.session) {
    return { notice: "Ti abbiamo inviato una email di conferma. Controlla la posta." };
  }

  redirect(variant === "manager" ? CLAIM_PATH : HOME_PATH.player);
}

/** Google OAuth. Client submits a form to this action; we redirect to Google. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = String(formData.get("next") ?? HOME_PATH.player);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
