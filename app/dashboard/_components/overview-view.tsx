import { Building2, ClipboardList, Dice6, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { formatBookingWhen } from "@/lib/format";
import type { Booking, Venue } from "@/lib/types";

interface OverviewViewProps {
  venue: Venue;
  bookings: Booking[];
  pendingCount: number;
  onGoToTab: (tab: string) => void;
}

export function OverviewView({ venue, bookings, pendingCount, onGoToTab }: OverviewViewProps) {
  const pending = bookings
    .filter((b) => b.status === "pending")
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  const acceptedUpcoming = bookings.filter((b) => b.status === "accepted").length;

  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Richieste in attesa", value: String(pendingCount), icon: ClipboardList },
    { label: "Confermate in programma", value: String(acceptedUpcoming), icon: TrendingUp },
    { label: "Tavoli del locale", value: String(venue.totalTables), icon: Building2 },
    {
      label: "Valutazione",
      value: venue.rating == null ? "—" : `${venue.rating.toFixed(1)}/6`,
      icon: Dice6,
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <div>
        <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{venue.name} · {venue.city}</p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className="w-full border border-border/60 bg-card/80 p-3 backdrop-blur sm:p-4"
          >
            <s.icon size={14} className="text-amber-400" />
            <p className="mt-2 font-mono text-base font-bold text-foreground sm:text-lg">{s.value}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="w-full border border-border/60 bg-card/80 p-4 backdrop-blur sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="ff-display text-xs font-semibold text-foreground sm:text-sm">
            Richieste da confermare
          </h4>
          <button
            onClick={() => onGoToTab("prenotazioni")}
            className="shrink-0 text-xs text-amber-500 dark:text-amber-400"
          >
            Gestisci
          </button>
        </div>
        {pending.slice(0, 4).map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between gap-3 border-t border-border py-2.5 text-xs first:border-t-0 sm:text-sm"
          >
            <span className="truncate text-foreground">{b.playerName}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
              {formatBookingWhen(b.startsAt)} · {b.partySize} pers.
            </span>
          </div>
        ))}
        {pending.length === 0 && (
          <p className="pt-1 text-xs text-muted-foreground">Nessuna richiesta in attesa.</p>
        )}
      </Card>

      <Card className="w-full border border-dashed border-border/60 bg-card/50 p-4 text-xs text-muted-foreground sm:p-5">
        Gli strumenti per eventi e statistiche del locale arrivano a breve.
      </Card>
    </div>
  );
}
