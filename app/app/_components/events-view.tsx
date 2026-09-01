import { MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatEventDate } from "@/lib/format";
import type { GameEvent, Venue } from "@/lib/types";

interface EventsViewProps {
  events: GameEvent[];
  venues: Venue[];
}

export function EventsView({ events, venues }: EventsViewProps) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 sm:gap-6">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Eventi e tornei
      </h1>
      <div className="flex w-full flex-col gap-2.5 sm:gap-3.5">
        {sorted.map((ev) => {
          const venue = venues.find((v) => v.id === ev.venueId);
          const d = formatEventDate(ev.date);
          const pct = Math.round(((ev.seatsTotal - ev.seatsLeft) / ev.seatsTotal) * 100);
          const full = ev.seatsLeft === 0;
          return (
            <Card
              key={ev.id}
              className="w-full border border-border/60 bg-card/80 p-3 backdrop-blur transition-all duration-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/10 sm:p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 px-3 py-2 ring-1 ring-amber-400/30">
                  <span className="font-mono text-base font-bold text-amber-400 sm:text-lg">
                    {d.day}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{d.month}</span>
                </div>
                <div className="w-full min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground sm:text-sm">
                    {ev.title}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-muted-foreground sm:text-xs">
                    <MapPin size={12} /> {venue ? venue.name : "—"} · {ev.time}
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: full ? "#f87171" : "#14b8a6" }}
                    />
                  </div>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:items-end">
                  <Badge
                    variant="secondary"
                    className="h-6 w-fit rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 text-[10px] font-medium text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none"
                  >
                    {ev.genre}
                  </Badge>
                  <Button
                    disabled={full}
                    size="sm"
                    className="h-8 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 text-[10px] font-medium text-slate-950 transition-all disabled:opacity-60 sm:h-9 sm:w-auto sm:px-4 sm:text-[11px]"
                  >
                    {full ? "Al completo" : "Partecipa"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
