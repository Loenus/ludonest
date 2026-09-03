import { z } from "zod";

/**
 * Structured opening hours. Stored as `jsonb` on `venues` / `venue_claims`,
 * edited with <HoursEditor>, rendered with the formatters below.
 *
 * `close` may be lexically <= `open` — that means the venue closes after
 * midnight (e.g. open 18:00, close 02:00). "00:00" as a close time is treated
 * as midnight (end of day) and shown as "24:00".
 *
 * This module is deliberately framework-free (no "server-only") so both the
 * server actions and the client editor can import it.
 */

export const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** Mon–Fri, the "feriali" group. */
export const WEEKDAY_KEYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri"];
/** Sat–Sun, the "festivi / weekend" group. */
export const WEEKEND_KEYS: Weekday[] = ["sat", "sun"];

export const DAY_LABELS: Record<Weekday, string> = {
  mon: "Lunedì",
  tue: "Martedì",
  wed: "Mercoledì",
  thu: "Giovedì",
  fri: "Venerdì",
  sat: "Sabato",
  sun: "Domenica",
};

const DAY_ABBR: Record<Weekday, string> = {
  mon: "Lun",
  tue: "Mar",
  wed: "Mer",
  thu: "Gio",
  fri: "Ven",
  sat: "Sab",
  sun: "Dom",
};

export interface DayHours {
  closed: boolean;
  /** "HH:MM", 24h. */
  open: string;
  /** "HH:MM", 24h. May be <= open (closes after midnight). */
  close: string;
}

export type WeeklyHours = Record<Weekday, DayHours>;

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const dayHoursSchema = z.object({
  closed: z.boolean(),
  open: z.string().regex(HHMM, { error: "Orario non valido." }),
  close: z.string().regex(HHMM, { error: "Orario non valido." }),
});

/** Strict schema for the server action — rejects any malformed shape. */
export const weeklyHoursSchema = z.object({
  mon: dayHoursSchema,
  tue: dayHoursSchema,
  wed: dayHoursSchema,
  thu: dayHoursSchema,
  fri: dayHoursSchema,
  sat: dayHoursSchema,
  sun: dayHoursSchema,
});

export function makeDay(open = "15:00", close = "00:00", closed = false): DayHours {
  return { closed, open, close };
}

/** A sensible starting week for the editor when a venue has no hours yet. */
export function defaultWeek(): WeeklyHours {
  return {
    mon: makeDay(),
    tue: makeDay(),
    wed: makeDay(),
    thu: makeDay(),
    fri: makeDay(),
    sat: makeDay("10:00", "02:00"),
    sun: makeDay("10:00", "00:00"),
  };
}

/**
 * Coerce arbitrary input (a DB `jsonb` value or a JSON string) into a complete,
 * valid WeeklyHours — or `null` when there is nothing usable. Missing / broken
 * days fall back to "closed" rather than throwing.
 */
export function parseHours(value: unknown): WeeklyHours | null {
  let raw: unknown = value;
  if (typeof raw === "string") {
    const s = raw.trim();
    if (!s) return null;
    try {
      raw = JSON.parse(s);
    } catch {
      return null;
    }
  }
  if (!raw || typeof raw !== "object") return null;

  const src = raw as Record<string, unknown>;
  let anyValid = false;
  const out = {} as WeeklyHours;

  for (const w of WEEKDAYS) {
    const parsed = dayHoursSchema.safeParse(src[w]);
    if (parsed.success) {
      out[w] = parsed.data;
      anyValid = true;
    } else {
      out[w] = makeDay("00:00", "00:00", true);
    }
  }

  return anyValid ? out : null;
}

function displayClose(close: string): string {
  return close === "00:00" ? "24:00" : close;
}

function dayText(d: DayHours): string {
  return d.closed ? "Chiuso" : `${d.open}–${displayClose(d.close)}`;
}

interface DayRun {
  from: Weekday;
  to: Weekday;
  text: string;
}

function runs(h: WeeklyHours): DayRun[] {
  const groups: DayRun[] = [];
  for (const w of WEEKDAYS) {
    const text = dayText(h[w]);
    const last = groups[groups.length - 1];
    if (last && last.text === text) last.to = w;
    else groups.push({ from: w, to: w, text });
  }
  return groups;
}

function runLabel(run: DayRun): string {
  return run.from === run.to
    ? DAY_ABBR[run.from]
    : `${DAY_ABBR[run.from]}–${DAY_ABBR[run.to]}`;
}

/** One-line summary, collapsing equal consecutive days. `""` when no hours. */
export function formatHoursShort(h: WeeklyHours | null): string {
  if (!h) return "";
  const groups = runs(h);
  if (groups.length === 1) {
    return groups[0].text === "Chiuso"
      ? "Sempre chiuso"
      : `Tutti i giorni ${groups[0].text}`;
  }
  return groups.map((g) => `${runLabel(g)} ${g.text}`).join(" · ");
}

/** Grouped rows for a compact schedule list. `[]` when no hours. */
export function formatHoursLines(
  h: WeeklyHours | null,
): { label: string; value: string }[] {
  if (!h) return [];
  return runs(h).map((g) => ({ label: runLabel(g), value: g.text }));
}

function toMinutes(hhmm: string): number {
  const [hh, mm] = hhmm.split(":");
  return Number(hh) * 60 + Number(mm);
}

const ROME_WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

function romeNow(now: Date): { dayIndex: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0") % 24;
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { dayIndex: ROME_WEEKDAY_INDEX[wd] ?? 0, minutes: hh * 60 + mm };
}

/** Is the venue open right now (Europe/Rome)? Handles after-midnight closing. */
export function isOpenNow(h: WeeklyHours | null, now: Date = new Date()): boolean {
  if (!h) return false;
  const { dayIndex, minutes } = romeNow(now);

  const today = h[WEEKDAYS[dayIndex]];
  if (today && !today.closed) {
    const start = toMinutes(today.open);
    let end = toMinutes(today.close);
    if (end <= start) end += 1440;
    if (minutes >= start && minutes < end) return true;
  }

  // A range that started yesterday and runs past midnight into today.
  const yesterday = h[WEEKDAYS[(dayIndex + 6) % 7]];
  if (yesterday && !yesterday.closed) {
    const start = toMinutes(yesterday.open);
    const end = toMinutes(yesterday.close);
    if (end <= start && minutes < end) return true;
  }

  return false;
}
