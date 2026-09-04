import Link from "next/link";

import { PublicEventCard } from "@/components/events/public-event-card";
import { eventHref } from "@/lib/event-kind";
import type { PublicEvent } from "@/lib/events";

/**
 * The events list shared by the public `/eventi` page and the registered
 * player's "Eventi" tab — same cards, same destination.
 */
export function PublicEventsList({
  events,
  emptyMessage = "Nessun evento in programma al momento. Torna a trovarci presto.",
  backTo,
}: {
  events: PublicEvent[];
  emptyMessage?: string;
  /** Where the event page's "back" link should return to — see `eventHref`. */
  backTo?: string;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/60 px-4 py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <Link
          key={event.id}
          href={eventHref(event.id, backTo)}
          className="rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <PublicEventCard event={event} />
        </Link>
      ))}
    </div>
  );
}
