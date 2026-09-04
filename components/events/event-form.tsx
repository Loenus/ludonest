"use client";

import {
  useActionState,
  useEffect,
  useState,
  type ComponentProps,
} from "react";
import { Calendar, Clock, type LucideIcon } from "lucide-react";

import {
  createEvent,
  updateEvent,
  type EventFormState,
} from "@/app/actions/events";
import { PartnerVenuePicker } from "@/components/events/partner-venue-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EVENT_KINDS } from "@/lib/event-kind";
import { dayKey, timeLabel } from "@/lib/format";
import type { ManagerEvent } from "@/lib/types";

const fieldClass =
  "w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-base text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:text-sm";

/**
 * A native date / time input dressed up to match the other fields: a leading
 * icon, full-width (never overflows the card on mobile), and the whole control
 * is the tap target — the transparent webkit picker indicator is stretched to
 * cover it, and `showPicker()` handles the browsers that need a nudge.
 */
function PickerField({
  icon: Icon,
  className = "",
  onClick,
  ...props
}: ComponentProps<"input"> & { icon: LucideIcon }) {
  return (
    <div className="relative w-full min-w-0">
      <Icon
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        {...props}
        onClick={(e) => {
          try {
            (
              e.currentTarget as HTMLInputElement & { showPicker?: () => void }
            ).showPicker?.();
          } catch {
            /* not user-activated / unsupported — the native tap still opens it */
          }
          onClick?.(e);
        }}
        className={
          "h-11 w-full min-w-0 appearance-none rounded-xl border border-input bg-input/30 pl-9 pr-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-date-and-time-value]:text-left [&::-webkit-datetime-edit]:text-left " +
          className
        }
      />
    </div>
  );
}

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
  const action =
    mode === "create" ? createEvent : updateEvent.bind(null, event!.id);
  const [state, formAction, pending] = useActionState<EventFormState, FormData>(
    action,
    {},
  );
  const [seatsLimited, setSeatsLimited] = useState(event?.seatsLimited ?? false);

  // On a successful save the action returns `{ ok: true }` and `revalidatePath`
  // refreshes the data underneath; hand control back to the caller.
  useEffect(() => {
    if (state.ok) onDone();
  }, [state.ok, onDone]);

  const dateValue = event ? dayKey(event.startsAt) : "";
  const timeValue = event ? timeLabel(event.startsAt) : "20:30";

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
            defaultValue={event?.title}
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
            defaultValue={event?.description}
            placeholder="Racconta l'evento: cosa si fa, com'è strutturata la serata, cosa serve portare, a chi è rivolto…"
            className={fieldClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs text-muted-foreground">Tipo di evento</span>
          <select
            name="kind"
            defaultValue={event?.kind ?? "tavolo"}
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
            defaultValue={event?.minConsumption ?? ""}
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
            defaultChecked={event?.openToAll ?? true}
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
              defaultValue={event?.seatsTotal || ""}
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
          <PartnerVenuePicker defaultValue={event?.partnerVenues} />
        </div>

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
