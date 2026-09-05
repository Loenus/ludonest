"use client";

import { useActionState, useEffect, useState } from "react";
import { Calendar, Clock } from "lucide-react";

import {
  createEvent,
  updateEvent,
  type EventFormState,
} from "@/app/actions/events";
import { CoverUpload } from "@/components/events/cover-upload";
import { PartnerVenuePicker } from "@/components/events/partner-venue-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PickerField } from "@/components/ui/picker-field";
import { DEFAULT_EVENT_ACCENT, EVENT_KINDS } from "@/lib/event-kind";
import { dayKey, timeLabel } from "@/lib/format";
import type { ManagerEvent } from "@/lib/types";

const fieldClass =
  "w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm";

/** Quick-pick accents — the venue palette, so pages stay on-brand for the app. */
const ACCENT_PRESETS = ["#E8A93B", "#3FB89F", "#E0637A", "#8B7FD6", "#5AA9E6", "#6FBF73"];

/**
 * Create / edit form for a venue event. Used both in the manager dashboard list
 * and inline on the public event page (for the owning manager).
 */
export function EventForm({
  mode,
  event,
  onDone,
  onCancel,
}: {
  mode: "create" | "edit";
  event?: ManagerEvent;
  onDone: () => void;
  onCancel: () => void;
}) {
  // Snapshot the event at mount: the parent re-renders with fresh data after a
  // save (revalidatePath) before this form unmounts, and letting the uncontrolled
  // inputs' `defaultValue` shift under them both wipes edits and trips a Base UI
  // "changing default value" warning.
  const [ev] = useState(() => event);

  const action =
    mode === "create" ? createEvent : updateEvent.bind(null, ev!.id);
  const [state, formAction, pending] = useActionState<EventFormState, FormData>(
    action,
    {},
  );
  const [seatsLimited, setSeatsLimited] = useState(ev?.seatsLimited ?? false);
  const [accent, setAccent] = useState(ev?.accentColor ?? "");

  // On a successful save the action returns `{ ok: true }` and `revalidatePath`
  // refreshes the data underneath; hand control back to the caller.
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  const dateValue = ev ? dayKey(ev.startsAt) : "";
  const timeValue = ev ? timeLabel(ev.startsAt) : "20:30";

  return (
    <form action={formAction}>
      <Card className="grid grid-cols-1 gap-3 border-amber-400/40 bg-amber-400/5 p-4 sm:grid-cols-2 [&>*]:min-w-0">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Titolo evento</span>
          <Input
            name="title"
            required
            minLength={3}
            maxLength={120}
            defaultValue={ev?.title}
            placeholder="es. Open Day — Serata di gioco di ruolo"
            className="rounded-xl"
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground">Descrizione</span>
          <textarea
            name="description"
            required
            rows={8}
            maxLength={4000}
            defaultValue={ev?.description}
            placeholder="Racconta l'evento: cosa si fa, com'è strutturata la serata, cosa serve portare, a chi è rivolto…"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Tipo di evento</span>
          <select
            name="kind"
            defaultValue={ev?.kind ?? "tavolo"}
            className="h-9 w-full rounded-xl border border-input bg-input/30 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {EVENT_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Consumazione minima (€)</span>
          <Input
            type="number"
            name="minConsumption"
            min={0}
            max={999}
            step="0.5"
            defaultValue={ev?.minConsumption ?? ""}
            placeholder="es. 8 — lascia vuoto se non prevista"
            className="rounded-xl"
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Data</span>
          <PickerField
            icon={Calendar}
            type="date"
            name="date"
            required
            defaultValue={dateValue}
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Ora di inizio</span>
          <PickerField
            icon={Clock}
            type="time"
            name="time"
            required
            defaultValue={timeValue}
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input
            type="checkbox"
            name="openToAll"
            defaultChecked={ev?.openToAll ?? true}
            className="size-4 rounded border-input accent-amber-400"
          />
          Aperto a tutti — giocatori esperti, novizi e principianti
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
          <input
            type="checkbox"
            name="seatsLimited"
            checked={seatsLimited}
            onChange={(e) => setSeatsLimited(e.target.checked)}
            className="size-4 rounded border-input accent-amber-400"
          />
          Posti limitati
        </label>

        {seatsLimited && (
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Numero di posti</span>
            <Input
              type="number"
              name="seatsTotal"
              min={1}
              max={500}
              defaultValue={ev?.seatsTotal || ""}
              placeholder="es. 24"
              className="rounded-xl"
            />
          </label>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs text-muted-foreground">
            Locali partner{" "}
            <span className="text-muted-foreground/70">(opzionale)</span>
          </span>
          <PartnerVenuePicker defaultValue={ev?.partnerVenues} />
        </div>

        <fieldset className="flex min-w-0 flex-col gap-3 rounded-xl border border-border/60 bg-background/40 p-3 sm:col-span-2">
          <legend className="px-1 text-xs font-semibold text-foreground">
            Aspetto della pagina{" "}
            <span className="font-normal text-muted-foreground/70">(opzionale)</span>
          </legend>

          <p className="text-[11px] text-muted-foreground">
            Il colore tinge solo gli elementi della pagina (data, tag, pulsante). Senza
            copertina non c&apos;è immagine di sfondo.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Copertina</span>
            <CoverUpload defaultPath={ev?.coverPath} />
          </label>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground">Colore d&apos;accento</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="color"
                aria-label="Colore d'accento"
                value={accent || DEFAULT_EVENT_ACCENT}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
              />
              {ACCENT_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Usa ${c}`}
                  onClick={() => setAccent(c)}
                  style={{ background: c }}
                  className={`h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-transform hover:scale-110 ${
                    accent.toLowerCase() === c.toLowerCase() ? "ring-2 ring-foreground" : ""
                  }`}
                />
              ))}
              {accent && (
                <button
                  type="button"
                  onClick={() => setAccent("")}
                  className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Predefinito
                </button>
              )}
            </div>
            <input type="hidden" name="accentColor" value={accent} />
          </div>
        </fieldset>

        {state.error && (
          <p className="text-xs font-medium text-destructive sm:col-span-2">
            {state.error}
          </p>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <Button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 disabled:opacity-70"
          >
            {pending
              ? "Salvataggio…"
              : mode === "create"
                ? "Salva evento"
                : "Salva modifiche"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-xl"
          >
            Annulla
          </Button>
        </div>
      </Card>
    </form>
  );
}
