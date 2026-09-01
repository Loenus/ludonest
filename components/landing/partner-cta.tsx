import Link from "next/link";
import { ArrowRight, ClipboardList, LayoutDashboard, Store } from "lucide-react";

import { Dice3D } from "@/components/dice-3d";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERKS = [
  { icon: LayoutDashboard, text: "Dashboard con visite, richieste e occupazione tavoli" },
  { icon: Store, text: "Scheda del locale sempre aggiornata: orari, generi, descrizione" },
  { icon: ClipboardList, text: "Prenotazioni ed eventi gestiti da un unico pannello" },
];

export function PartnerCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6">
      {/* NB: no `overflow`/`backdrop` clip on this card or any ancestor — it holds
          a 3D die and iOS would flatten it. Radius + shadow only. */}
      <div className="relative rounded-[2rem] border border-amber-400/30 bg-[linear-gradient(135deg,rgba(245,158,11,0.14)_0%,var(--card)_55%)] p-8 shadow-[0_28px_70px_rgba(120,84,31,0.16)] sm:p-12 dark:shadow-none">
        {/* decorative die — kept fully inside the card: no `overflow`/`backdrop`
            clip is allowed on an ancestor of a 3D die or iOS flattens it */}
        <div
          className="pointer-events-none absolute bottom-8 right-8 hidden opacity-70 lg:block"
          aria-hidden
        >
          <Dice3D size={124} interactive={false} glow={false} />
        </div>

        <div className="max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            <Store size={12} /> Per i gestori
          </span>

          <h2 className="ff-display mt-4 text-2xl font-bold text-foreground sm:text-3xl">
            Hai un ludopub o uno spazio dove si gioca?
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Diventa partner di LudoNest: fatti trovare dai giocatori della tua città,
            riempi i tavoli nelle serate vuote e gestisci prenotazioni ed eventi da
            un&apos;unica dashboard.
          </p>

          <ul className="mt-6 flex flex-col gap-3">
            {PERKS.map((p) => (
              <li key={p.text} className="flex items-start gap-3 text-sm text-foreground">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-500">
                  <p.icon size={14} />
                </span>
                {p.text}
              </li>
            ))}
          </ul>

          <Link
            href="/partner/login"
            className={cn(
              buttonVariants({ size: "lg" }),
              "mt-8 h-12 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-xl",
            )}
          >
            Accedi come gestore
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}
