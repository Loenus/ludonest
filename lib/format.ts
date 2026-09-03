export const MONTHS = [
  "GEN", "FEB", "MAR", "APR", "MAG", "GIU",
  "LUG", "AGO", "SET", "OTT", "NOV", "DIC",
] as const;

export interface EventDateParts {
  day: string;
  month: string;
}

/** "2026-08-28" -> { day: "28", month: "AGO" } */
export function formatEventDate(dateStr: string): EventDateParts {
  const d = new Date(`${dateStr}T00:00:00`);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: MONTHS[d.getMonth()],
  };
}

/** Stable 0..n-1 index from an arbitrary id string (for decorative colours). */
export function hashIndex(id: string, buckets: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % buckets;
}

/* ------------------------------------------------------------------ */
/*  Booking date helpers (manager dashboard)                           */
/* ------------------------------------------------------------------ */

const TZ = "Europe/Rome";

function romeParts(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return f.format(d); // YYYY-MM-DD
}

/** Local (Europe/Rome) calendar-day key for an ISO timestamp, e.g. "2026-09-04". */
export function dayKey(iso: string): string {
  return romeParts(new Date(iso));
}

/** "Oggi" / "Domani" / "gio 4 set" for a day key. */
export function dayLabel(key: string): string {
  const today = romeParts(new Date());
  const tomorrow = romeParts(new Date(Date.now() + 86_400_000));
  if (key === today) return "Oggi";
  if (key === tomorrow) return "Domani";
  const d = new Date(`${key}T12:00:00`);
  return new Intl.DateTimeFormat("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
}

/** "21:00" in Europe/Rome. */
export function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** "Oggi · 21:00" / "gio 4 set · 18:30" */
export function formatBookingWhen(iso: string): string {
  return `${dayLabel(dayKey(iso))} · ${timeLabel(iso)}`;
}

/** Europe/Rome UTC offset ("+02:00" / "+01:00") on a given calendar day. */
export function romeOffset(dayKeyStr: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date(`${dayKeyStr}T12:00:00Z`));
  const raw = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+1";
  const m = raw.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!m) return "+01:00";
  const [, sign, h, min = "00"] = m;
  return `${sign}${h.padStart(2, "0")}:${min}`;
}

/** A local Europe/Rome date + time to an absolute ISO timestamp. */
export function toRomeISO(date: string, time: string): string {
  return `${date}T${time.length === 5 ? `${time}:00` : time}${romeOffset(date)}`;
}

/** The instant of 00:00 today, Europe/Rome, as an ISO string. */
export function todayStartRomeISO(): string {
  const key = dayKey(new Date().toISOString());
  return `${key}T00:00:00${romeOffset(key)}`;
}

/** Group bookings into ordered day buckets by their Europe/Rome calendar day. */
export function groupByDay<T extends { startsAt: string }>(
  items: T[],
): { key: string; label: string; items: T[] }[] {
  const buckets = new Map<string, T[]>();
  for (const it of items) {
    const k = dayKey(it.startsAt);
    (buckets.get(k) ?? buckets.set(k, []).get(k)!).push(it);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, label: dayLabel(key), items }));
}
