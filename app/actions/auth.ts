"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  HOME_PATH,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  encodeSession,
} from "@/lib/session";
import type { Role } from "@/lib/types";

export interface AuthState {
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Ospite";
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Mock authentication. Any well-formed email plus a password of at least four
 * characters is accepted; the role is fixed by which login page called us, so a
 * gamer cannot obtain a manager session (or the reverse) by tampering with the
 * form.
 */
async function authenticate(
  role: Role,
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email)) {
    return { error: "Inserisci un indirizzo email valido." };
  }
  if (password.length < 4) {
    return { error: "La password deve avere almeno 4 caratteri." };
  }

  const store = await cookies();
  store.set(
    SESSION_COOKIE,
    encodeSession({ role, email, name: displayNameFromEmail(email) }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    },
  );

  redirect(HOME_PATH[role]);
}

export async function loginAsGamer(prev: AuthState, formData: FormData) {
  return authenticate("gamer", prev, formData);
}

export async function loginAsManager(prev: AuthState, formData: FormData) {
  return authenticate("manager", prev, formData);
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/");
}
