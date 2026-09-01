import { CalendarDays, Compass, MapPin, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Compass,
    title: "Locali vicino a te",
    body: "Filtra per distanza, generi di gioco e disponibilità. I ludopub di Milano, tutti in un colpo d'occhio.",
  },
  {
    icon: MapPin,
    title: "Tavoli in tempo reale",
    body: "Vedi quanti tavoli sono liberi adesso e invia la richiesta di prenotazione senza telefonate.",
  },
  {
    icon: CalendarDays,
    title: "Tornei ed eventi",
    body: "Serate a tema, campagne di ruolo e tornei: scopri cosa succede stasera e prenota il tuo posto.",
  },
  {
    icon: Users,
    title: "Compagni di partita",
    body: "Cerchi un quarto giocatore per Root? Presto potrai trovare persone con cui giocare, locale per locale.",
  },
];

export function FeatureSection() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-xl">
        <h2 className="ff-display text-2xl font-bold text-foreground sm:text-3xl">
          Tutto quello che serve per giocare fuori casa
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Una sola app per trovare il posto giusto, il gioco giusto e le persone giuste.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border/60 bg-card/80 p-5 shadow-[0_10px_30px_rgba(120,84,31,0.08)] backdrop-blur transition-all hover:-translate-y-1 hover:border-amber-400/50 dark:shadow-none"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 text-amber-500 ring-1 ring-amber-400/30">
              <f.icon size={20} />
            </span>
            <h3 className="ff-display mt-4 text-base font-semibold text-foreground">{f.title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
