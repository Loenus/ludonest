import { Building2, CheckCircle2, ClipboardList, Dice6, TrendingUp, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { BookingRequest, GameEvent, RequestStatus, Venue } from "@/lib/types";

interface OverviewViewProps {
  venue: Venue;
  pendingCount: number;
  upcomingEvents: GameEvent[];
  pendingRequests: BookingRequest[];
  onUpdateRequestStatus: (id: number, status: RequestStatus) => void;
  onGoToTab: (tab: string) => void;
}

export function OverviewView({
  venue,
  pendingCount,
  upcomingEvents,
  pendingRequests,
  onUpdateRequestStatus,
  onGoToTab,
}: OverviewViewProps) {
  const stats: { label: string; value: string; icon: LucideIcon }[] = [
    { label: "Visite oggi", value: "47", icon: TrendingUp },
    { label: "Richieste in attesa", value: String(pendingCount), icon: ClipboardList },
    {
      label: "Tavoli occupati",
      value: `${venue.totalTables - venue.freeTables}/${venue.totalTables}`,
      icon: Building2,
    },
    { label: "Valutazione media", value: `${venue.rating.toFixed(1)}/6`, icon: Dice6 },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Dashboard
      </h1>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
          <h4 className="ff-display truncate text-xs font-semibold text-foreground sm:text-sm">
            Prossimi eventi
          </h4>
          <button
            onClick={() => onGoToTab("eventi")}
            className="shrink-0 text-xs text-amber-400"
          >
            Vedi
          </button>
        </div>
        {upcomingEvents.slice(0, 2).map((ev) => (
          <div
            key={ev.id}
            className="flex items-center justify-between gap-2 border-t border-border py-2 text-xs first:border-t-0 sm:text-sm"
          >
            <span className="truncate text-foreground">{ev.title}</span>
            <span className="shrink-0 font-mono text-[10px] text-muted-foreground sm:text-xs">
              {ev.date}
            </span>
          </div>
        ))}
        {upcomingEvents.length === 0 && (
          <p className="pt-2 text-xs text-muted-foreground">Nessun evento in programma.</p>
        )}
      </Card>

      <Card className="w-full border border-border/60 bg-card/80 p-4 backdrop-blur sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="ff-display truncate text-xs font-semibold text-foreground sm:text-sm">
            Richieste recenti
          </h4>
          <button
            onClick={() => onGoToTab("prenotazioni")}
            className="shrink-0 text-xs text-amber-400"
          >
            Vedi
          </button>
        </div>
        {pendingRequests.slice(0, 2).map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-2 border-t border-border py-2 first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-foreground sm:text-sm">{r.userName}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground sm:text-xs">
                {r.date} · {r.time} · {r.people}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                onClick={() => onUpdateRequestStatus(r.id, "accepted")}
                className="rounded-full bg-muted p-1.5"
                aria-label="Accetta richiesta"
              >
                <CheckCircle2 size={14} className="text-emerald-400" />
              </button>
              <button
                onClick={() => onUpdateRequestStatus(r.id, "declined")}
                className="rounded-full bg-muted p-1.5"
                aria-label="Rifiuta richiesta"
              >
                <XCircle size={14} className="text-rose-400" />
              </button>
            </div>
          </div>
        ))}
        {pendingCount === 0 && (
          <p className="pt-2 text-xs text-muted-foreground">Nessuna richiesta in attesa.</p>
        )}
      </Card>
    </div>
  );
}
