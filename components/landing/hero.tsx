import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Store } from "lucide-react";

import { Dice3D } from "@/components/dice-3d";
import { buttonVariants } from "@/components/ui/button";
import { HOME_PATH } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/types";

export function Hero({ session }: { session: Session | null }) {
  const primaryHref = session ? HOME_PATH[session.role] : "/login";
  const primaryLabel = session ? "Torna alla tua area" : "Entra come giocatore";

  return (
    <section className="relative">
      {/* background decorations — kept in a self-clipping sibling so no
          `overflow` sits on an ancestor of the 3D die (it would flatten it) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <div className="landing-grid absolute inset-0" />
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-amber-400/25 blur-[120px] dark:bg-amber-500/15" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        {/* Copy */}
        <div className="flex flex-col items-start text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
            <Sparkles size={12} /> La rete dei ludopub, in un&apos;app
          </span>

          <h1 className="ff-display mt-5 text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Trova il tuo tavolo.
            <br />
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Gioca stasera.
            </span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Scopri i locali da gioco vicino a te, controlla i tavoli liberi in tempo
            reale e prenota in un tocco. Tornei, serate a tema e nuovi compagni di
            partita inclusi.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Link
              href={primaryHref}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl",
              )}
            >
              {primaryLabel}
              <ArrowRight size={17} />
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
              <p className="text-[10px] text-muted-foreground">3 tavoli liberi · 0,8 km</p>
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
        </div>
      </div>
    </section>
  );
}
