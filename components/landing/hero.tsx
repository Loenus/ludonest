import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

import { Dice3D } from "@/components/dice-3d";
import { buttonVariants } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

const PILLARS = ["Prenota un tavolo", "Unisciti agli eventi", "Trova giocatori"];

export function Hero({
  session,
  homeHref,
}: {
  session: Session | null;
  homeHref: string | null;
}) {
  const primaryHref = session ? homeHref ?? HOME_PATH[session.role] : "/login";
  const primaryLabel = session ? "Torna alla tua area" : "Entra come giocatore";

  return (
    <section className="relative">
      {/* background decorations — kept in a self-clipping sibling so no
          `overflow` sits on an ancestor of the 3D die (it would flatten it) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="landing-hex absolute inset-0" />
        <div className="absolute left-1/2 top-[-12%] h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-amber-400/25 blur-[130px] dark:bg-amber-500/15" />
        <div className="absolute right-[6%] top-[38%] h-[280px] w-[280px] rounded-full bg-orange-500/15 blur-[120px] dark:bg-orange-500/10" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        {/* Copy */}
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <Sparkles size={12} /> La rete dei ludopub, in un&apos;app
          </span>

          <h1 className="ff-display mt-5 text-4xl font-bold leading-[1.03] text-foreground sm:text-5xl lg:text-[3.75rem]">
            Il tavolo da gioco
            <br />
            <span className="shimmer-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              più vicino a te.
            </span>
          </h1>

          <p className="ff-display mt-4 text-xl font-semibold leading-tight text-foreground sm:text-2xl">
            Trova{" "}
            <span className="word-roll" aria-hidden>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                il tavolo.
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                la partita.
              </span>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                la tua gente.
              </span>
            </span>
            <span className="sr-only">il tavolo, la partita, la tua gente.</span>
          </p>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            <strong className="font-semibold text-foreground">Prenota il tuo tavolo</strong> al
            ludopub o al locale da gioco più vicino,{" "}
            <strong className="font-semibold text-foreground">unisciti agli eventi</strong> —
            tornei, serate a tema, campagne — e{" "}
            <strong className="font-semibold text-foreground">trova persone</strong> con cui
            giocare. Tutto in un tocco.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <li
                key={p}
                className="rounded-full border border-border/60 bg-card/70 px-3 py-1 text-[11px] font-medium text-foreground/80 backdrop-blur"
              >
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "shimmer-cta group h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl",
              )}
            >
              {primaryLabel}
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            {!session && (
              <Link
                href="/partner/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 rounded-2xl border-amber-500/40 bg-amber-500/5 px-5 text-sm font-semibold text-amber-700 transition-all hover:bg-amber-500/10 dark:text-amber-300",
                )}
              >
                <Store size={16} /> Ho un ludopub · Diventa partner
              </Link>
            )}
          </div>

          <Link
            href="/eventi"
            className="group mt-4 inline-flex items-center gap-2.5 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-600 transition-transform group-hover:scale-105 dark:text-amber-300">
              <CalendarDays size={16} />
            </span>
            Scopri gli eventi disponibili
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>

          <p className="mt-4 text-[11px] text-muted-foreground">
            Gratis per i giocatori. Nessuna carta richiesta.
          </p>
        </div>

        {/* 3D scene — no `overflow` here: the die's stage is a bounded box that
            already contains the glow, so nothing needs clipping. */}
        <div className="relative flex min-h-[380px] items-center justify-center sm:min-h-[470px]">
          <Dice3D size={210} className="sm:hidden" />
          <Dice3D size={260} className="hidden sm:block" />

          <div className="animate-float-y absolute left-0 top-4 hidden items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(120,84,31,0.16)] backdrop-blur sm:flex dark:shadow-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-500">
              <MapPin size={15} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-foreground">Il Dado Nero</p>
              <p className="text-[10px] text-muted-foreground">Aperto ora · 0,8 km</p>
            </div>
          </div>

          <div className="animate-float-y-delay absolute bottom-2 right-0 hidden items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(120,84,31,0.16)] backdrop-blur sm:flex dark:shadow-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/15 text-amber-500">
              <CalendarDays size={15} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-foreground">Torneo di Wingspan</p>
              <p className="text-[10px] text-muted-foreground">28 AGO · 2 posti rimasti</p>
            </div>
          </div>

          <div className="animate-float-y-slow absolute left-2 bottom-16 hidden items-center gap-2.5 rounded-2xl border border-border/60 bg-card/95 px-3.5 py-2.5 shadow-[0_18px_40px_rgba(120,84,31,0.16)] backdrop-blur lg:flex dark:shadow-none">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-400/15 text-sky-500">
              <Users size={15} />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold text-foreground">Cercasi 4° giocatore</p>
              <p className="text-[10px] text-muted-foreground">Root · stasera 21:00</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
