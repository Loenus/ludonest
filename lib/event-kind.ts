import type { EventKind } from "@/lib/types";

/** The three event kinds, in form/display order. Client-safe (no server-only). */
export const EVENT_KINDS: { value: EventKind; label: string }[] = [
  { value: "gdr", label: "Gioco di ruolo" },
  { value: "tavolo", label: "Gioco da tavolo" },
  { value: "carte", label: "Gioco di carte" },
];

export function eventKindLabel(kind: string): string {
  return EVENT_KINDS.find((k) => k.value === kind)?.label ?? kind;
}

/** "8" for a whole amount, "8.50" otherwise. */
export function formatEuro(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

/* ------------------------------------------------------------------ */
/*  Event page theming — a manager may brand the page with a colour    */
/* ------------------------------------------------------------------ */

/** Warm amber — the default when a manager hasn't picked an accent. */
export const DEFAULT_EVENT_ACCENT = "#E8A93B";

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

/** Black or white, whichever reads better on top of `hex` (WCAG luminance). */
export function readableTextOn(hex: string): "#0a0a0a" | "#ffffff" {
  const c = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return L > 0.4 ? "#0a0a0a" : "#ffffff";
}

/**
 * Link to an event's public page. When `backTo` is given (e.g. the reserved
 * area's own events tab), it rides along as `?from=` so the detail page's
 * "back" link returns there instead of the public events list.
 */
export function eventHref(id: string, backTo?: string): string {
  return backTo ? `/eventi/${id}?${new URLSearchParams({ from: backTo })}` : `/eventi/${id}`;
}
