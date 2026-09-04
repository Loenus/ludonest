"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Coins, ExternalLink, Pencil, Plus, Trash2, Users } from "lucide-react";

import { EventForm } from "@/components/events/event-form";
import { deleteEvent } from "@/app/actions/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { eventHref, eventKindLabel, formatEuro } from "@/lib/event-kind";
import { dayKey, formatEventDate, timeLabel } from "@/lib/format";
import type { ManagerEvent } from "@/lib/types";
import { VenueAvatar } from "@/lib/venue-avatar";

interface EventsViewProps {
  events: ManagerEvent[];
}

export function EventsView({ events }: EventsViewProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sorted = [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  function removeEvent(id: string) {
    if (!confirm("Eliminare questo evento? L'azione non è reversibile.")) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteEvent(id);
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">Eventi</h1>
        <Button
          onClick={() => {
            setEditingId(null);
            setCreating((v) => !v);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"
        >
          <Plus size={15} /> Nuovo evento
        </Button>
      </div>

      {creating && (
        <EventForm
          mode="create"
          onDone={() => setCreating(false)}
          onCancel={() => setCreating(false)}
        />
      )}

      <div className="flex flex-col gap-3">
        {sorted.map((ev) =>
          editingId === ev.id ? (
            <EventForm
              key={ev.id}
              mode="edit"
              event={ev}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <EventCard
              key={ev.id}
              event={ev}
              busy={pendingId === ev.id}
              onEdit={() => {
                setCreating(false);
                setEditingId(ev.id);
              }}
              onDelete={() => removeEvent(ev.id)}
            />
          ),
        )}

        {sorted.length === 0 && !creating && (
          <p className="rounded-2xl border border-dashed border-border/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Nessun evento in programma. Creane uno nuovo.
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Event card                                                         */
/* ------------------------------------------------------------------ */

function EventCard({
  event,
  busy,
  onEdit,
  onDelete,
}: {
  event: ManagerEvent;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const d = formatEventDate(dayKey(event.startsAt));
  const seatsLabel = event.seatsLimited
    ? `${event.seatsLeft}/${event.seatsTotal} posti liberi`
    : "posti illimitati";

  return (
    <Card className="flex flex-col gap-3 border-border/80 bg-card p-4">
      <div className="flex items-start gap-3">
        <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-muted px-2.5 py-1.5">
          <span className="font-mono text-sm font-bold text-amber-400">{d.day}</span>
          <span className="font-mono text-[9px] text-muted-foreground">{d.month}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={eventHref(event.id, "/dashboard?tab=eventi")}
              className="truncate text-sm font-medium text-foreground hover:text-amber-600 hover:underline dark:hover:text-amber-300"
            >
              {event.title}
            </Link>
            <Badge
              variant="secondary"
              className="h-5 shrink-0 rounded-full px-2 text-[10px]"
            >
              {eventKindLabel(event.kind)}
            </Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-xs text-muted-foreground">
            <span>{timeLabel(event.startsAt)}</span>
            {event.minConsumption != null && (
              <span className="flex items-center gap-1">
                <Coins size={11} /> min. €{formatEuro(event.minConsumption)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={11} /> {seatsLabel}
            </span>
          </p>
        </div>

        <div className="flex shrink-0 gap-1">
          <Link
            href={eventHref(event.id, "/dashboard?tab=eventi")}
            className="rounded-full bg-muted p-1.5"
            aria-label="Apri la pagina pubblica"
          >
            <ExternalLink size={14} className="text-muted-foreground" />
          </Link>
          <button
            onClick={onEdit}
            className="rounded-full bg-muted p-1.5"
            aria-label="Modifica evento"
          >
            <Pencil size={14} className="text-muted-foreground" />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="rounded-full bg-muted p-1.5 disabled:opacity-50"
            aria-label="Elimina evento"
          >
            <Trash2 size={14} className="text-rose-400" />
          </button>
        </div>
      </div>

      {event.openToAll && (
        <p className="text-xs text-muted-foreground">
          Aperto a tutti · giocatori esperti, novizi e principianti
        </p>
      )}

      {event.description && (
        <p className="line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
          {event.description}
        </p>
      )}

      {event.partnerVenues.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Locali partner
          </span>
          <ul className="flex flex-col gap-1">
            {event.partnerVenues.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm text-foreground">
                <VenueAvatar venue={p} size={22} />
                <span className="min-w-0 truncate">{p.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
