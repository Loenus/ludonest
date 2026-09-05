"use client";

import { useActionState, useEffect, useState } from "react";
import { Calendar, CheckCircle2, Clock, MapPin, X } from "lucide-react";

import { requestBooking, type BookingFormState } from "@/app/actions/bookings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PickerField } from "@/components/ui/picker-field";
import { formatHoursLines, formatHoursShort } from "@/lib/hours";
import type { Venue } from "@/lib/types";
import { VenueAvatar } from "@/lib/venue-avatar";

interface VenueDetailModalProps {
  venue: Venue | null;
  spine: string;
  booked: boolean;
  onClose: () => void;
  onBooked: (venueId: string) => void;
}

export function VenueDetailModal({
  venue,
  spine,
  booked,
  onClose,
  onBooked,
}: VenueDetailModalProps) {
  if (!venue) return null;
  return (
    <ModalBody
      venue={venue}
      spine={spine}
      booked={booked}
      onClose={onClose}
      onBooked={onBooked}
    />
  );
}

function ModalBody({
  venue,
  spine,
  booked,
  onClose,
  onBooked,
}: {
  venue: Venue;
  spine: string;
  booked: boolean;
  onClose: () => void;
  onBooked: (venueId: string) => void;
}) {
  const hoursSummary = formatHoursShort(venue.hours);
  const hoursLines = formatHoursLines(venue.hours);

  const [showForm, setShowForm] = useState(false);

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
        className="max-h-[92vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[28px] border border-border/60 bg-card shadow-[0_30px_80px_rgba(50,32,16,0.24)] ring-1 ring-border/40 transition-all duration-300 ease-out sm:w-[min(92vw,32rem)] md:max-w-xl"
      >
        <div
          className="h-3 bg-gradient-to-r"
          style={{ backgroundImage: `linear-gradient(to right, ${spine}, ${spine}cc)` }}
        />
        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <VenueAvatar venue={venue} size={48} className="mt-0.5" />
              <div className="min-w-0">
                <h2 className="ff-display text-[1.35rem] font-bold tracking-[-0.03em] text-foreground">
                  {venue.name}
                </h2>
                <p className="mt-1 flex items-center gap-1 text-[0.82rem] text-muted-foreground">
                  <MapPin size={13} className="shrink-0" /> {venue.address}, {venue.city}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full bg-muted p-1.5 shadow-sm transition-all duration-200 hover:bg-muted/80"
            >
              <X size={16} className="text-foreground" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock size={13} /> {hoursSummary || "Orari non disponibili"}
            </span>
            <span
              className={`flex items-center gap-1.5 text-xs ${
                venue.openNow
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-rose-700 dark:text-rose-400"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  venue.openNow ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              {venue.openNow ? "Aperto ora" : "Chiuso ora"}
            </span>
          </div>

          {hoursLines.length > 1 && (
            <details className="mt-2.5 text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none font-medium text-foreground/80 marker:text-muted-foreground">
                Orari per giorno
              </summary>
              <ul className="mt-2 flex flex-col gap-1">
                {hoursLines.map((row) => (
                  <li key={row.label} className="flex justify-between gap-4">
                    <span className="font-medium text-foreground/80">{row.label}</span>
                    <span>{row.value}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}

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

          {/* Booking — description and CTA by default; the form takes the
              description's place once the player asks to book, instead of
              always showing a form nobody may need. */}
          {confirmed ? (
            <p className="mt-4 flex items-center gap-1.5 rounded-2xl bg-emerald-500/10 px-3 py-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={14} /> Richiesta inviata. Il locale ti risponderà a breve.
            </p>
          ) : showForm ? (
            <div className="mt-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="ff-display text-sm font-semibold text-foreground">
                  Prenota un tavolo
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Annulla
                </button>
              </div>

              <form action={formAction} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 [&>*]:min-w-0">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Data</span>
                    <PickerField icon={Calendar} name="date" type="date" required min={today} />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className="text-[11px] text-muted-foreground">Ora</span>
                    <PickerField icon={Clock} name="time" type="time" required />
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
                    className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm"
                  />
                </label>

                {state.error && (
                  <p className="text-xs font-medium text-destructive">{state.error}</p>
                )}

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-11 rounded-2xl bg-amber-400 font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 disabled:opacity-70"
                >
                  {pending ? "Invio…" : "Invia richiesta"}
                </Button>
              </form>
            </div>
          ) : (
            <>
              {venue.description && (
                <p className="mt-4 text-sm leading-relaxed text-foreground">
                  {venue.description}
                </p>
              )}
              <Button
                onClick={() => setShowForm(true)}
                className="mt-4 h-11 w-full rounded-2xl border border-[#dca96d] bg-[linear-gradient(135deg,#f8d58c_0%,#f0b55a_35%,#df9146_100%)] font-semibold text-[#2d1c12] shadow-[0_16px_28px_rgba(184,117,38,0.22)] transition-all duration-200 hover:-translate-y-0.5 dark:border-amber-500/40 dark:bg-gradient-to-r dark:from-amber-600 dark:to-amber-700 dark:text-white"
              >
                <Calendar size={16} /> Prenota un tavolo
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
