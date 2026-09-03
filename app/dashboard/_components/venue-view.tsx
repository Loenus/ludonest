"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, MapPin, Pencil } from "lucide-react";

import { updateVenue, type VenueFormState } from "@/app/actions/venue";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import { FilterChip } from "@/components/filter-chip";
import { HoursEditor } from "@/components/hours-editor";
import { LogoUpload } from "@/components/logo-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatHoursLines } from "@/lib/hours";
import { GENRES } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";
import { VenueAvatar } from "@/lib/venue-avatar";

/**
 * "Il tuo locale" — one layout that edits in place: clicking Modifica swaps
 * every value for its editable control and turns the button into Salva /
 * Annulla. No separate card / form screen.
 */
export function VenueView({ venue }: { venue: Venue }) {
  const [state, formAction, pending] = useActionState<VenueFormState, FormData>(
    updateVenue,
    {},
  );
  const [editing, setEditing] = useState(false);
  const [handledOk, setHandledOk] = useState<VenueFormState | null>(null);
  const [tags, setTags] = useState<string[]>(venue.tags);

  // A successful save returns a fresh `{ ok: true }` object; leave edit mode
  // once for it (revalidatePath refreshes the `venue` prop underneath).
  if (editing && state.ok && state !== handledOk) {
    setHandledOk(state);
    setEditing(false);
  }

  function startEditing() {
    setTags(venue.tags);
    setEditing(true);
  }

  const toggleTag = (g: string) =>
    setTags((prev) => (prev.includes(g) ? prev.filter((t) => t !== g) : [...prev, g]));

  const hoursLines = formatHoursLines(venue.hours);
  const savedOk = !editing && state.ok === true;

  const body = (
    <div className="flex w-full max-w-2xl flex-col gap-8 sm:gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-400/90">
              {editing ? "Modifica in corso…" : "Il tuo locale"}
            </p>
            {savedOk && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Modifiche salvate
              </span>
            )}
          </div>

          {editing ? (
            <div className="flex shrink-0 gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={pending}
                className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-70"
              >
                {pending ? "Salvataggio…" : "Salva"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => setEditing(false)}
                className="rounded-xl"
              >
                Annulla
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={startEditing}
              className="shrink-0 rounded-xl bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30 hover:bg-amber-300"
            >
              <Pencil size={14} /> Modifica
            </Button>
          )}
        </div>

        <div className={editing ? "flex flex-col gap-5" : "flex min-w-0 items-center gap-4"}>
          {editing ? (
            <LogoUpload seed={venue.id} defaultPath={venue.logoPath} />
          ) : (
            <VenueAvatar venue={venue} size={56} />
          )}

          <div className={editing ? "flex flex-col gap-5" : "min-w-0"}>
            {editing ? (
              <label className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Nome locale</span>
                <Input
                  name="name"
                  required
                  minLength={2}
                  defaultValue={venue.name}
                  className="h-11 rounded-xl"
                />
              </label>
            ) : (
              <h1 className="ff-display text-2xl font-bold leading-tight text-foreground sm:text-3xl md:text-4xl">
                {venue.name}
              </h1>
            )}

            {editing ? (
              <AddressAutocomplete
                defaultValue={{
                  address: venue.address,
                  city: venue.city,
                  lat: venue.lat,
                  lng: venue.lng,
                }}
              />
            ) : (
              <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="shrink-0" />
                  {venue.address}
                  {venue.city ? `, ${venue.city}` : ""}
                </span>
                <span
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                    venue.openNow
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      venue.openNow ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {venue.openNow ? "Aperto ora" : "Chiuso"}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <dl className="flex flex-col">
        <Row label="Orari di apertura">
          {editing ? (
            <HoursEditor defaultValue={venue.hours} />
          ) : hoursLines.length === 0 ? (
            <span className="text-muted-foreground">Non impostati</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              {hoursLines.map((l) => (
                <div key={l.label} className="flex gap-3 font-mono text-[13px]">
                  <span className="w-16 shrink-0 text-muted-foreground">{l.label}</span>
                  <span className="text-foreground">{l.value}</span>
                </div>
              ))}
            </div>
          )}
        </Row>

        <Row label="Generi disponibili">
          {editing ? (
            <>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <FilterChip
                    key={g}
                    label={g}
                    active={tags.includes(g)}
                    onClick={() => toggleTag(g)}
                  />
                ))}
              </div>
              {tags.map((g) => (
                <input key={g} type="hidden" name="genres" value={g} />
              ))}
            </>
          ) : venue.tags.length === 0 ? (
            <span className="text-muted-foreground">Nessun genere selezionato</span>
          ) : (
            <span className="flex flex-wrap gap-1.5">
              {venue.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 text-[11px] text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300"
                >
                  {t}
                </Badge>
              ))}
            </span>
          )}
        </Row>

        <Row label="Descrizione">
          {editing ? (
            <textarea
              name="description"
              rows={4}
              maxLength={1000}
              defaultValue={venue.description}
              className="w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm"
            />
          ) : venue.description ? (
            <p className="max-w-prose whitespace-pre-line leading-relaxed text-foreground">
              {venue.description}
            </p>
          ) : (
            <span className="text-muted-foreground">Nessuna descrizione</span>
          )}
        </Row>
      </dl>

      {editing && state.error && (
        <p className="-mt-4 text-xs font-medium text-destructive">{state.error}</p>
      )}
    </div>
  );

  return editing ? <form action={formAction}>{body}</form> : body;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-t border-border/60 py-6 first:border-t-0 first:pt-0 last:pb-0 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:py-5 sm:last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}
