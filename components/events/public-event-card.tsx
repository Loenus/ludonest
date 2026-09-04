import { CalendarClock, Coins, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { eventKindLabel, formatEuro } from "@/lib/event-kind";
import type { PublicEvent } from "@/lib/events";
import { dayKey, formatEventDate, timeLabel } from "@/lib/format";
import { VenueAvatar } from "@/lib/venue-avatar";

/** Presentational only — wrap in a <Link> at the call site. */
export function PublicEventCard({ event }: { event: PublicEvent }) {
  const d = formatEventDate(dayKey(event.startsAt));
  const full = event.seatsLeft === 0;
  const pct =
    event.seatsLimited && event.seatsTotal > 0
      ? Math.min(Math.round((event.seatsTaken / event.seatsTotal) * 100), 100)
      : 0;

  return (
    <article className="group flex gap-4 rounded-2xl border border-border/60 bg-card/80 p-4 backdrop-blur transition-all duration-200 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-400/10 sm:p-5">
      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 ring-1 ring-amber-400/30">
        <span className="ff-display text-lg font-bold text-amber-500 dark:text-amber-400">
          {d.day}
        </span>
        <span className="font-mono text-[10px] uppercase text-muted-foreground">
          {d.month}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="ff-display truncate text-base font-semibold text-foreground transition-colors group-hover:text-amber-600 dark:group-hover:text-amber-300">
            {event.title}
          </h3>
          <Badge
            variant="secondary"
            className="h-5 shrink-0 rounded-full px-2 text-[10px]"
          >
            {eventKindLabel(event.kind)}
          </Badge>
        </div>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock size={12} /> {timeLabel(event.startsAt)}
          </span>
          <span className="flex min-w-0 items-center gap-1.5">
            <VenueAvatar
              venue={{
                id: event.venue.id,
                name: event.venue.name,
                logoPath: event.venue.logoPath,
              }}
              size={16}
            />
            <span className="truncate">
              {event.venue.name} · {event.venue.city}
            </span>
          </span>
          {event.minConsumption != null && (
            <span className="flex items-center gap-1">
              <Coins size={12} /> min. €{formatEuro(event.minConsumption)}
            </span>
          )}
        </p>

        {event.seatsLimited ? (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: full ? "#f87171" : "#14b8a6" }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
              {full ? "Al completo" : `${event.seatsLeft} posti liberi`}
            </span>
          </div>
        ) : (
          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users size={12} /> Posti illimitati
          </span>
        )}
      </div>
    </article>
  );
}
