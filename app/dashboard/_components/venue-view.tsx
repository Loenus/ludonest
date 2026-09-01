import { CheckCircle2 } from "lucide-react";

import { FilterChip } from "@/components/filter-chip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GENRES } from "@/lib/mock-data";
import type { Venue } from "@/lib/types";

interface VenueViewProps {
  form: Venue;
  saveMessage: string;
  onChange: (patch: Partial<Venue>) => void;
  onToggleTag: (tag: string) => void;
  onSave: () => void;
}

export function VenueView({ form, saveMessage, onChange, onToggleTag, onSave }: VenueViewProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <h1 className="ff-display text-2xl font-bold text-foreground md:text-3xl">Il tuo locale</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">Nome locale</label>
          <Input
            className="mt-1.5"
            value={form.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Città</label>
          <Input
            className="mt-1.5"
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Indirizzo</label>
          <Input
            className="mt-1.5"
            value={form.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Orario</label>
          <Input
            className="mt-1.5"
            value={form.hours}
            onChange={(e) => onChange({ hours: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Numero tavoli totali</label>
          <Input
            type="number"
            className="mt-1.5"
            value={form.totalTables}
            onChange={(e) => onChange({ totalTables: Number(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Generi disponibili</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <FilterChip
              key={g}
              label={g}
              active={form.tags.includes(g)}
              onClick={() => onToggleTag(g)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-muted-foreground">Descrizione</label>
        <textarea
          rows={4}
          className="mt-1.5 w-full rounded-xl border border-input bg-input/30 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          value={form.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onSave}
          className="rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300"
        >
          Salva modifiche
        </Button>
        {saveMessage && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle2 size={14} /> {saveMessage}
          </span>
        )}
      </div>
    </div>
  );
}
