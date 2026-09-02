"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Clock, MapPin, Sparkles, X } from "lucide-react";

import { requestBooking, type BookingFormState } from "@/app/actions/bookings";
import { RatingBadge } from "@/components/rating-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hashIndex } from "@/lib/format";
import { MATCH_POSTS, SPINE_COLORS } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

interface VenueDetailModalProps {
  venue: Venue | null;
  booked: boolean;
  onClose: () => void;
  onBooked: (venueId: string) => void;
}

export function VenueDetailModal({ venue, booked, onClose, onBooked }: VenueDetailModalProps) {
  if (!venue) return null;
  return (
    <ModalBody venue={venue} booked={booked} onClose={onClose} onBooked={onBooked} />
  );
}

function ModalBody({
  venue,
  booked,
  onClose,
  onBooked,
}: {
  venue: Venue;
  booked: boolean;
  onClose: () => void;
  onBooked: (venueId: string) => void;
}) {
  const spine = SPINE_COLORS[hashIndex(venue.id, SPINE_COLORS.length)];
  const venuePosts = MATCH_POSTS.filter((p) => p.venueName === venue.name);

  const action = requestBooking.bind(null, venue.id);
  const [state, formAction, pending] = useActionState<BookingFormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) onBooked(venue.id);
  }, [state.ok, venue.id, onBooked]);

  const confirmed = booked || state.ok;
  const today = new Date().toISOString().slice(0, 10);

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
              className="shrink-0 rounded-full bg-muted p-1.5 shadow-sm transition-all duration-200 hover:bg-muted/80"
            >
              <X size={16} className="text-foreground" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <RatingBadge rating={venue.rating} />
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={13} /> {venue.hours || "Orari non disponibili"}
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

          {venue.description && (
            <p className="mt-4 text-sm leading-relaxed text-foreground">{venue.description}</p>
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

          <div className="mt-6 border-t border-border pt-5">
            <h4 className="ff-display mb-3 text-sm font-semibold text-foreground">
              Prenota un tavolo
            </h4>

            {confirmed ? (
              <p className="flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Richiesta inviata. Il locale ti risponderà a breve.
              </p>
            ) : (
              <form action={formAction} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Data</span>
                    <Input name="date" type="date" required min={today} className="h-10 rounded-xl" />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Ora</span>
                    <Input name="time" type="time" required className="h-10 rounded-xl" />
                  </label>
                </div>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Numero di persone</span>
                  <Input
                    name="partySize"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={2}
                    required
                    className="h-10 rounded-xl"
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Nota (facoltativa)</span>
                  <textarea
                    name="note"
                    rows={2}
                    maxLength={500}
                    placeholder="Es. tavolo per Terraforming Mars, siamo principianti…"
                    className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>

                {state.error && (
                  <p className="text-xs font-medium text-destructive">{state.error}</p>
                )}

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-2xl border border-[#dca96d] bg-[linear-gradient(135deg,#f8d58c_0%,#f0b55a_35%,#df9146_100%)] font-semibold text-[#2d1c12] shadow-[0_16px_28px_rgba(184,117,38,0.22)] transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 dark:border-amber-500/40 dark:bg-gradient-to-r dark:from-amber-600 dark:to-amber-700 dark:text-white"
                >
                  {pending ? "Invio…" : "Invia richiesta"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
