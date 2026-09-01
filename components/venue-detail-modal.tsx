"use client";

import { CheckCircle2, Clock, MapPin, Sparkles, X } from "lucide-react";

import { RatingBadge } from "@/components/rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatEventDate } from "@/lib/format";
import { MATCH_POSTS, SPINE_COLORS } from "@/lib/mock-data";
import type { GameEvent, Venue } from "@/lib/types";

interface VenueDetailModalProps {
  venue: Venue | null;
  events: GameEvent[];
  booked: boolean;
  onClose: () => void;
  onBook: () => void;
}

export function VenueDetailModal({
  venue,
  events,
  booked,
  onClose,
  onBook,
}: VenueDetailModalProps) {
  if (!venue) return null;

  const spine = SPINE_COLORS[venue.id % SPINE_COLORS.length];
  const venueEvents = events.filter((e) => e.venueId === venue.id);
  const venuePosts = MATCH_POSTS.filter((p) => p.venueName === venue.name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[6px] sm:p-6 md:p-8"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[28px] border border-border/60 bg-card/95 shadow-[0_30px_80px_rgba(50,32,16,0.24)] ring-1 ring-border/40 transition-all duration-300 ease-out sm:w-[min(92vw,32rem)] md:max-w-xl"
      >
        <div
          className="h-3 bg-gradient-to-r"
          style={{ backgroundImage: `linear-gradient(to right, ${spine}, ${spine}cc)` }}
        />
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="ff-display text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">
                {venue.name}
              </h2>
              <p className="mt-1 flex items-center gap-1 text-[0.82rem] text-muted-foreground">
                <MapPin size={13} /> {venue.address}, {venue.city}
              </p>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full bg-muted p-1.5 shadow-sm transition-all duration-200 hover:bg-muted/80 dark:hover:bg-muted/80"
            >
              <X size={16} className="text-foreground" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingBadge rating={venue.rating} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={13} /> {venue.hours}
            </span>
            <span
              className="flex items-center gap-1.5 text-xs"
              style={{ color: venue.openNow ? "var(--teal)" : "var(--coral)" }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: venue.openNow ? "var(--teal)" : "var(--coral)" }}
              />
              {venue.openNow ? "Aperto ora" : "Chiuso ora"}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {venue.tags.map((t) => (
              <Badge
                key={t}
                variant="secondary"
                className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2 text-[10px] text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none"
              >
                {t}
              </Badge>
            ))}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-foreground">{venue.description}</p>

          {venueEvents.length > 0 && (
            <div className="mt-6">
              <h4 className="ff-display mb-2.5 text-sm font-semibold text-foreground">
                Prossimi eventi
              </h4>
              <div className="flex flex-col gap-2">
                {venueEvents.map((ev) => {
                  const d = formatEventDate(ev.date);
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 rounded-2xl border border-border/40 bg-card p-2.5 dark:border-border/50 dark:bg-muted/40"
                    >
                      <div className="flex min-w-[44px] flex-col items-center justify-center rounded-xl bg-background p-1.5 ring-1 ring-border/30 dark:ring-border/50">
                        <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                          {d.day}
                        </span>
                        <span className="font-mono text-[9px] text-muted-foreground">{d.month}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {ev.time} · {ev.seatsLeft} posti liberi
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2.5 flex items-center gap-2">
              <h4 className="ff-display text-sm font-semibold text-foreground">
                Trova compagni di gioco
              </h4>
              <Badge
                variant="outline"
                className="border-amber-400/40 bg-amber-400/5 text-amber-300"
              >
                <Sparkles size={11} /> In arrivo
              </Badge>
            </div>
            {venuePosts.length > 0 ? (
              <div className="flex flex-col gap-2">
                {venuePosts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/40 bg-card p-2.5 dark:border-border/50 dark:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {p.game} · cercano {p.seeking}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{p.note}</p>
                    </div>
                    <Button disabled variant="outline" size="sm" className="shrink-0 text-xs opacity-60">
                      Presto
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Nessuna richiesta di gruppo per questo locale al momento.
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              onClick={onBook}
              disabled={booked}
              className="flex-1 rounded-2xl border border-[#dca96d] bg-[linear-gradient(135deg,#f8d58c_0%,#f0b55a_35%,#df9146_100%)] text-[#2d1c12] font-semibold shadow-[0_16px_28px_rgba(184,117,38,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(184,117,38,0.28)] disabled:opacity-75 dark:border-amber-500/40 dark:bg-gradient-to-r dark:from-amber-600 dark:to-amber-700 dark:text-white dark:shadow-[0_16px_28px_rgba(120,53,15,0.24)] dark:hover:shadow-[0_18px_32px_rgba(120,53,15,0.32)]"
            >
              {booked ? "✓ Richiesta inviata" : "Prenota un tavolo"}
            </Button>
          </div>
          {booked && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
              <CheckCircle2 size={13} /> Il locale ti risponderà a breve.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
