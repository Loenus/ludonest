"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  WEEKDAYS,
  WEEKDAY_KEYS,
  WEEKEND_KEYS,
  defaultWeek,
  parseHours,
  type DayHours,
  type Weekday,
  type WeeklyHours,
} from "@/lib/hours";

interface HoursEditorProps {
  defaultValue?: WeeklyHours | string | null;
  onChange?: (value: WeeklyHours) => void;
  label?: string;
  /** Outline the editor in red (set by the parent after a failed submit). */
  invalid?: boolean;
}

function sameDay(a: DayHours, b: DayHours): boolean {
  return a.closed === b.closed && a.open === b.open && a.close === b.close;
}

/** `true` when the days in the group don't all share the same hours. */
function isMixed(week: WeeklyHours, keys: Weekday[]): boolean {
  const first = week[keys[0]];
  return !keys.every((k) => sameDay(week[k], first));
}

export function HoursEditor({
  defaultValue,
  onChange,
  label = "Orari di apertura",
  invalid,
}: HoursEditorProps) {
  const [week, setWeek] = useState<WeeklyHours>(
    () => parseHours(defaultValue ?? null) ?? defaultWeek(),
  );
  const [perDay, setPerDay] = useState(false);

  function patch(keys: Weekday[], p: Partial<DayHours>) {
    const next = { ...week };
    for (const k of keys) next[k] = { ...next[k], ...p };
    setWeek(next);
    onChange?.(next);
  }

  const groupMixed = !perDay && (isMixed(week, WEEKDAY_KEYS) || isMixed(week, WEEKEND_KEYS));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={() => setPerDay((v) => !v)}
          className="text-[11px] font-medium text-amber-600 underline-offset-4 hover:underline dark:text-amber-400"
        >
          {perDay ? "Raggruppa feriali / weekend" : "Personalizza per giorno"}
        </button>
      </div>

      <div
        className={cn(
          "flex flex-col gap-2",
          invalid && "rounded-xl border border-destructive p-2 ring-[3px] ring-destructive/25",
        )}
      >
        {perDay ? (
          WEEKDAYS.map((d) => (
            <DayRow key={d} label={DAY_LABELS[d]} day={week[d]} onPatch={(p) => patch([d], p)} />
          ))
        ) : (
          <>
            <DayRow label="Lun–Ven" day={week.mon} onPatch={(p) => patch(WEEKDAY_KEYS, p)} />
            <DayRow label="Sab–Dom" day={week.sat} onPatch={(p) => patch(WEEKEND_KEYS, p)} />
          </>
        )}
      </div>

      {groupMixed && (
        <p className="text-[11px] text-muted-foreground">
          Alcuni giorni hanno orari diversi tra loro. Modifica un gruppo per uniformarli,
          oppure usa «Personalizza per giorno» per impostarli singolarmente.
        </p>
      )}

      <input type="hidden" name="hours" value={JSON.stringify(week)} />
    </div>
  );
}

function DayRow({
  label,
  day,
  onPatch,
}: {
  label: string;
  day: DayHours;
  onPatch: (patch: Partial<DayHours>) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
      <span className="w-[4.5rem] shrink-0 text-xs font-semibold text-foreground">
        {label}
      </span>

      <div className="flex shrink-0 overflow-hidden rounded-lg border border-border/60 text-[11px] font-semibold">
        <button
          type="button"
          onClick={() => onPatch({ closed: false })}
          className={
            !day.closed
              ? "bg-amber-400 px-2.5 py-1 text-slate-950"
              : "px-2.5 py-1 text-muted-foreground hover:text-foreground"
          }
        >
          Aperto
        </button>
        <button
          type="button"
          onClick={() => onPatch({ closed: true })}
          className={
            day.closed
              ? "bg-foreground px-2.5 py-1 text-background"
              : "px-2.5 py-1 text-muted-foreground hover:text-foreground"
          }
        >
          Chiuso
        </button>
      </div>

      {day.closed ? (
        <span className="text-[11px] text-muted-foreground">Chiuso tutto il giorno</span>
      ) : (
        <div className="flex items-center gap-1.5">
          <Input
            type="time"
            value={day.open}
            onChange={(e) => e.target.value && onPatch({ open: e.target.value })}
            className="h-9 w-[6.75rem] rounded-lg"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="time"
            value={day.close}
            onChange={(e) => e.target.value && onPatch({ close: e.target.value })}
            className="h-9 w-[6.75rem] rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
