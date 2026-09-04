import { PublicEventsList } from "@/components/events/public-events-list";
import type { PublicEvent } from "@/lib/events";

/** Same list, same cards, same destination as the public `/eventi` page. */
export function EventsView({ events }: { events: PublicEvent[] }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-6">
      <h1 className="ff-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
        Eventi e tornei
      </h1>
      <PublicEventsList events={events} backTo="/app?tab=eventi" />
    </div>
  );
}
