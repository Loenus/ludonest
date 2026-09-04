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

/**
 * Link to an event's public page. When `backTo` is given (e.g. the reserved
 * area's own events tab), it rides along as `?from=` so the detail page's
 * "back" link returns there instead of the public events list.
 */
export function eventHref(id: string, backTo?: string): string {
  return backTo ? `/eventi/${id}?${new URLSearchParams({ from: backTo })}` : `/eventi/${id}`;
}
