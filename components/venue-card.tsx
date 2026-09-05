import { Navigation } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Venue } from "@/lib/types";
import { VenueAvatar } from "@/lib/venue-avatar";

interface VenueCardProps {
  venue: Venue;
  /** Resolved once for the whole grid — see `assignSpineColors`. */
  spine: string;
  onOpen: (venue: Venue) => void;
}

export function VenueCard({ venue, spine, onOpen }: VenueCardProps) {
  return (
    <Card className="group overflow-hidden border border-border/60 bg-card/90 backdrop-blur p-0 transition-all duration-300 shadow-[0_8px_24px_rgba(120,113,108,0.08)] hover:border-amber-400/50 hover:shadow-[0_16px_36px_rgba(245,158,11,0.12)] active:border-amber-400/60 dark:shadow-none">
      {/* A real flex item, not an absolutely positioned overlay or a grid
          track on the `<button>` itself (both misbehaved on mobile) — this
          is the plain, boring "sidebar row" pattern: a fixed-width item next
          to the content, in a flex row that is not a button. Vertical margin
          controls how "tall" it reads. */}
      <div className="flex">
        <span
          aria-hidden
          className="my-4 w-3 shrink-0 rounded-full transition-[filter] duration-300 group-hover:brightness-110 sm:my-0 sm:rounded-none"
          style={{ background: spine }}
        />
        <button onClick={() => onOpen(venue)} className="min-w-0 flex-1 text-left">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <VenueAvatar venue={venue} size={40} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm sm:text-base font-semibold text-foreground">
                  {venue.name}
                </h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {venue.address}, {venue.city}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {venue.tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="h-6 rounded-full border border-amber-200/80 bg-amber-50/90 px-2 text-[10px] text-amber-900 shadow-sm shadow-amber-200/40 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-none"
                >
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 sm:gap-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
              {venue.distanceKm != null && (
                <span className="flex items-center gap-1">
                  <Navigation size={12} />
                  <span className="font-mono">{venue.distanceKm} km</span>
                </span>
              )}
              <span
                className={`flex items-center gap-1.5 ${
                  venue.openNow
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-rose-700 dark:text-rose-400"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    venue.openNow ? "bg-emerald-500" : "bg-rose-500"
                  }`}
                />
                {venue.openNow ? "Aperto ora" : "Chiuso"}
              </span>
            </div>
          </div>
        </button>
      </div>
    </Card>
  );
}
