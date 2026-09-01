import { CalendarDays, MapPin, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const PILLARS: {
  step: string;
  icon: LucideIcon;
  title: string;
  body: string;
}[] = [
  {
    step: "01",
    icon: MapPin,
    title: "Prenota un tavolo",
    body: "Trova il ludopub o il locale da gioco più vicino a te, controlla i tavoli liberi in tempo reale e prenota in un tocco. Senza telefonate.",
  },
  {
    step: "02",
    icon: CalendarDays,
    title: "Unisciti agli eventi",
    body: "Tornei, serate a tema, campagne di ruolo e demo di novità: scopri cosa succede stasera vicino a te e blocca il tuo posto.",
  },
  {
    step: "03",
    icon: Users,
    title: "Trova la tua gente",
    body: "Cerchi un quarto giocatore per Root? Pubblica o rispondi agli annunci e siediti a un tavolo con persone che amano i tuoi giochi.",
  },
];

export function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="max-w-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          <Sparkles size={12} /> Come funziona
        </span>
        <h2 className="ff-display mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Tre modi per non restare mai senza partita
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Una sola app per trovare il posto giusto, il gioco giusto e le persone giuste.
        </p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {PILLARS.map((f) => (
          <div
            key={f.title}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-6 shadow-[0_16px_40px_rgba(120,84,31,0.1)] backdrop-blur transition-all hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-[0_28px_60px_rgba(120,84,31,0.18)] dark:shadow-none sm:p-7"
          >
            <span
              className="ff-display pointer-events-none absolute right-4 top-2 text-5xl font-bold text-amber-500/10 transition-colors group-hover:text-amber-500/20 sm:text-6xl"
              aria-hidden
            >
              {f.step}
            </span>
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-orange-500/15 text-amber-500 ring-1 ring-amber-400/30">
              <f.icon size={22} />
            </span>
            <h3 className="ff-display relative mt-5 text-lg font-semibold text-foreground">
              {f.title}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
              {f.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        In arrivo a Milano · presto in tutta Italia
      </p>
    </section>
  );
}
