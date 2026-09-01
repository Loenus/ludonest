import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatEventDate } from "@/lib/format";
import { GENRES } from "@/lib/mock-data";
import type { GameEvent } from "@/lib/types";

export interface NewEventDraft {
  title: string;
  date: string;
  time: string;
  genre: string;
  seatsTotal: number;
}

interface EventsViewProps {
  events: GameEvent[];
  showForm: boolean;
  draft: NewEventDraft;
  onToggleForm: () => void;
  onDraftChange: (patch: Partial<NewEventDraft>) => void;
  onAdd: () => void;
  onDelete: (id: number) => void;
}

export function EventsView({
  events,
  showForm,
  draft,
  onToggleForm,
  onDraftChange,
  onAdd,
  onDelete,
}: EventsViewProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">Eventi</h1>
        <Button
          onClick={onToggleForm}
          className="flex items-center gap-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"
        >
          <Plus size={15} /> Nuovo evento
        </Button>
      </div>

      {showForm && (
        <Card className="grid grid-cols-1 gap-3 border-border/80 bg-card p-4 md:grid-cols-2">
          <Input
            placeholder="Titolo evento"
            className="md:col-span-2"
            value={draft.title}
            onChange={(e) => onDraftChange({ title: e.target.value })}
          />
          <Input
            type="date"
            value={draft.date}
            onChange={(e) => onDraftChange({ date: e.target.value })}
          />
          <Input
            type="time"
            value={draft.time}
            onChange={(e) => onDraftChange({ time: e.target.value })}
          />
          <select
            className="h-9 w-full rounded-xl border border-input bg-input/30 px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={draft.genre}
            onChange={(e) => onDraftChange({ genre: e.target.value })}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Posti totali"
            value={draft.seatsTotal}
            onChange={(e) => onDraftChange({ seatsTotal: Number(e.target.value) })}
          />
          <div className="flex gap-2 md:col-span-2">
            <Button
              onClick={onAdd}
              className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"
            >
              Salva evento
            </Button>
            <Button variant="outline" onClick={onToggleForm} className="rounded-xl">
              Annulla
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-col gap-2.5">
        {events.map((ev) => {
          const d = formatEventDate(ev.date);
          return (
            <Card
              key={ev.id}
              className="flex items-center gap-3 border-border/80 bg-card p-3.5"
            >
              <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-muted px-2.5 py-1.5">
                <span className="font-mono text-sm font-bold text-amber-400">{d.day}</span>
                <span className="font-mono text-[9px] text-muted-foreground">{d.month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{ev.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {ev.time} · {ev.seatsTotal} posti
                </p>
              </div>
              <Badge
                variant="secondary"
                className="h-6 shrink-0 rounded-full px-2 text-[10px]"
              >
                {ev.genre}
              </Badge>
              <button
                onClick={() => onDelete(ev.id)}
                className="shrink-0 rounded-full bg-muted p-1.5"
                aria-label="Elimina evento"
              >
                <Trash2 size={14} className="text-rose-400" />
              </button>
            </Card>
          );
        })}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nessun evento in programma. Creane uno nuovo.
          </p>
        )}
      </div>
    </div>
  );
}
