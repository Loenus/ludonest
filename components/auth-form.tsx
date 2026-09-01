"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { loginAsGamer, loginAsManager, type AuthState } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Dice3D } from "@/components/dice-3d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Role } from "@/lib/types";

const COPY: Record<
  Role,
  {
    action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
    heading: string;
    subtitle: string;
    submit: string;
    switchHref: string;
    switchLabel: string;
  }
> = {
  gamer: {
    action: loginAsGamer,
    heading: "Accedi come giocatore",
    subtitle: "Trova un ludopub, prenota il tavolo e parti a giocare.",
    submit: "Entra e gioca",
    switchHref: "/partner/login",
    switchLabel: "Gestisci un locale? Accedi come gestore",
  },
  manager: {
    action: loginAsManager,
    heading: "Accedi come gestore",
    subtitle: "Gestisci il tuo ludopub: tavoli, eventi e prenotazioni.",
    submit: "Entra nella dashboard",
    switchHref: "/login",
    switchLabel: "Sei un giocatore? Accedi da qui",
  },
};

export function AuthForm({ variant }: { variant: Role }) {
  const copy = COPY[variant];
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    copy.action,
    {},
  );

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="landing-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <Link
        href="/"
        className="mb-8 flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Torna alla home
      </Link>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Dice3D size={76} className="mb-5" />
          <BrandLogo size="md" />
          <h1 className="ff-display mt-6 text-2xl font-bold text-foreground">{copy.heading}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        <form
          action={formAction}
          className="mt-8 flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[0_20px_50px_rgba(120,84,31,0.12)] backdrop-blur dark:shadow-none"
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Email</span>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@esempio.it"
              className="h-11 rounded-xl"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Password</span>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={4}
              placeholder="••••••••"
              className="h-11 rounded-xl"
            />
          </label>

          {state.error && (
            <p className="text-xs font-medium text-destructive">{state.error}</p>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="mt-1 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl disabled:opacity-70"
          >
            {pending ? "Accesso in corso…" : copy.submit}
            {!pending && <ArrowRight size={16} />}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            Prototipo — usa una email qualsiasi e una password di almeno 4 caratteri.
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link
            href={copy.switchHref}
            className="text-xs font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
          >
            {copy.switchLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
