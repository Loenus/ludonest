"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { signIn, signUp, signInWithGoogle, type AuthState } from "@/app/actions/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Dice3D } from "@/components/dice-3d";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CLAIM_PATH, HOME_PATH } from "@/lib/session";

type Variant = "player" | "manager";
type Mode = "signin" | "signup";

const COPY: Record<
  Variant,
  { heading: string; subtitle: string; switchHref: string; switchLabel: string; signupHint: string }
> = {
  player: {
    heading: "Area giocatori",
    subtitle: "Trova un ludopub, prenota il tavolo e parti a giocare.",
    switchHref: "/partner/login",
    switchLabel: "Gestisci un locale? Vai all'area gestori",
    signupHint: "",
  },
  manager: {
    heading: "Area gestori",
    subtitle: "Registrati e richiedi di gestire il tuo locale su LudoNest.",
    switchHref: "/login",
    switchLabel: "Sei un giocatore? Accedi da qui",
    signupHint:
      "Dopo la registrazione invii la richiesta per il tuo locale: un amministratore la approva e potrai gestirlo.",
  },
};

export function AuthForm({ variant }: { variant: Variant }) {
  const copy = COPY[variant];
  const [mode, setMode] = useState<Mode>("signin");

  const action = (mode === "signin" ? signIn : signUp).bind(null, variant);
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, {});

  const nextAfterOAuth = variant === "manager" ? CLAIM_PATH : HOME_PATH.player;

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center px-4 py-12">
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

        <div className="mt-8 rounded-3xl border border-border/60 bg-card/90 p-6 shadow-[0_20px_50px_rgba(120,84,31,0.12)] backdrop-blur dark:shadow-none">
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-muted/50 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`h-9 rounded-lg transition-colors ${
                mode === "signin" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Accedi
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`h-9 rounded-lg transition-colors ${
                mode === "signup" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Registrati
            </button>
          </div>

          <form action={formAction} className="flex flex-col gap-4">
            {mode === "signup" && (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">Nome</span>
                <Input
                  name="fullName"
                  autoComplete="name"
                  required
                  minLength={2}
                  placeholder="Mario Rossi"
                  className="h-11 rounded-xl"
                />
              </label>
            )}

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
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={8}
                placeholder="••••••••"
                className="h-11 rounded-xl"
              />
            </label>

            {state.error && (
              <p className="text-xs font-medium text-destructive">{state.error}</p>
            )}
            {state.notice && (
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {state.notice}
              </p>
            )}
            {mode === "signup" && copy.signupHint && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">{copy.signupHint}</p>
            )}

            <Button
              type="submit"
              disabled={pending}
              className="mt-1 h-11 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:shadow-xl disabled:opacity-70"
            >
              {pending
                ? "Attendere…"
                : mode === "signin"
                  ? "Accedi"
                  : "Crea account"}
              {!pending && <ArrowRight size={16} />}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> oppure <span className="h-px flex-1 bg-border" />
          </div>

          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={nextAfterOAuth} />
            <Button
              type="submit"
              variant="outline"
              className="h-11 w-full rounded-xl border-border/70 font-semibold"
            >
              <GoogleGlyph /> Continua con Google
            </Button>
          </form>
        </div>

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

function GoogleGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}
